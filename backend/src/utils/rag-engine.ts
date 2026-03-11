import fs from 'fs';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

// ==================== TYPES ====================

interface DocumentChunk {
    id: string;
    source: string;       // original filename
    content: string;       // chunk text
    keywords: string[];    // extracted keywords for matching
}

interface RAGContext {
    chunks: DocumentChunk[];
    lastIndexed: Date;
}

// ==================== IN-MEMORY STORE ====================

let ragContext: RAGContext = {
    chunks: [],
    lastIndexed: new Date(0),
};

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
const CHUNK_SIZE = 500;  // chars per chunk
const CHUNK_OVERLAP = 100;

// ==================== TEXT EXTRACTION ====================

async function extractTextFromPDF(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
}

function extractTextFromTXT(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
}

async function extractText(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.pdf':
            return extractTextFromPDF(filePath);
        case '.txt':
        case '.csv':
            return extractTextFromTXT(filePath);
        case '.doc':
        case '.docx':
            // For .doc/.docx we'd need mammoth or similar; fallback to empty
            console.warn(`[RAG] .doc/.docx not supported for text extraction: ${filePath}`);
            return '';
        default:
            return '';
    }
}

// ==================== CHUNKING ====================

function chunkText(text: string, source: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    // Clean text: collapse whitespace, remove excessive newlines
    const clean = text.replace(/\s+/g, ' ').trim();

    if (!clean) return chunks;

    for (let i = 0; i < clean.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
        const content = clean.slice(i, i + CHUNK_SIZE).trim();
        if (content.length < 30) continue; // skip tiny fragments

        chunks.push({
            id: `${source}-${i}`,
            source,
            content,
            keywords: extractKeywords(content),
        });
    }

    return chunks;
}

// ==================== KEYWORD EXTRACTION (simple TF approach) ====================

const STOPWORDS = new Set([
    'de', 'la', 'el', 'en', 'y', 'a', 'los', 'las', 'del', 'un', 'una',
    'que', 'es', 'por', 'con', 'para', 'se', 'al', 'lo', 'como', 'su',
    'más', 'o', 'no', 'ha', 'este', 'entre', 'son', 'ser', 'también',
    'está', 'sus', 'sobre', 'estos', 'puede', 'esta', 'sin', 'pero',
    'todo', 'ya', 'muy', 'han', 'hay', 'cada', 'desde', 'donde',
    'the', 'of', 'and', 'to', 'in', 'a', 'is', 'that', 'for', 'it',
    'with', 'as', 'was', 'on', 'are', 'be', 'at', 'by', 'an', 'or',
    'from', 'this', 'which', 'has', 'not', 'but', 'can', 'their',
]);

function extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
        .replace(/[^a-záéíóúñü\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !STOPWORDS.has(w));

    // Count frequencies
    const freq: Record<string, number> = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

    // Return top keywords by frequency
    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([word]) => word);
}

// ==================== INDEXING ====================

export async function indexDocuments(): Promise<{ indexed: number; chunks: number }> {
    if (!fs.existsSync(UPLOADS_DIR)) {
        return { indexed: 0, chunks: 0 };
    }

    const files = fs.readdirSync(UPLOADS_DIR);
    const allChunks: DocumentChunk[] = [];
    let indexed = 0;

    for (const file of files) {
        const filePath = path.join(UPLOADS_DIR, file);
        const stat = fs.statSync(filePath);
        if (!stat.isFile()) continue;

        try {
            const text = await extractText(filePath);
            if (text) {
                const chunks = chunkText(text, file);
                allChunks.push(...chunks);
                indexed++;
                console.log(`[RAG] Indexed "${file}": ${chunks.length} chunks`);
            }
        } catch (err) {
            console.error(`[RAG] Error indexing "${file}":`, err);
        }
    }

    ragContext = {
        chunks: allChunks,
        lastIndexed: new Date(),
    };

    console.log(`[RAG] Indexing complete: ${indexed} documents, ${allChunks.length} chunks`);
    return { indexed, chunks: allChunks.length };
}

// ==================== BILINGUAL KEYWORD EXPANSION ====================
// Maps Spanish dimension/topic terms to English equivalents for bilingual retrieval
const TOPIC_TRANSLATIONS: Record<string, string[]> = {
    // Kroh dimensions
    'cultura digital': ['digital culture', 'culture', 'organizational culture', 'corporate culture', 'innovation culture'],
    'experiencia del cliente': ['customer experience', 'customer journey', 'customer satisfaction', 'user experience'],
    'organización y talento': ['organization', 'talent', 'human resources', 'workforce', 'skills', 'competencies', 'training'],
    'tecnología y datos': ['technology', 'data', 'digital infrastructure', 'information systems', 'analytics', 'cloud'],
    'procesos e innovación': ['processes', 'innovation', 'automation', 'agile', 'lean', 'methodology', 'workflow'],
    'estrategia y liderazgo': ['strategy', 'leadership', 'strategic planning', 'vision', 'governance', 'executive'],
    'ecosistema y partners': ['ecosystem', 'partners', 'partnerships', 'collaboration', 'supply chain', 'stakeholders'],
    // Kerzner dimensions
    'lenguaje común': ['common language', 'terminology', 'communication', 'knowledge', 'pmbok', 'fundamentals'],
    'procesos comunes': ['common processes', 'methodology', 'standardization', 'procedures', 'lifecycle', 'best practices'],
    'metodología singular': ['singular methodology', 'integrated methodology', 'project management methodology', 'framework'],
    'benchmarking': ['benchmarking', 'comparison', 'best practices', 'continuous improvement', 'performance measurement'],
    'mejora continua': ['continuous improvement', 'lessons learned', 'optimization', 'kaizen', 'maturity'],
    'gestión de proyectos': ['project management', 'project planning', 'scheduling', 'controlling', 'risk management'],
    'madurez': ['maturity', 'maturity model', 'maturity level', 'capability', 'excellence'],
    'gobernanza': ['governance', 'portfolio', 'program management', 'prioritization', 'oversight'],
};

function expandQueryWithTranslations(query: string): string[] {
    const queryLower = query.toLowerCase();
    const extraKeywords: string[] = [];

    for (const [spanish, english] of Object.entries(TOPIC_TRANSLATIONS)) {
        if (queryLower.includes(spanish)) {
            extraKeywords.push(...english);
        }
    }

    // Also add individual word translations for partial matches
    const words = queryLower.split(/\s+/);
    for (const [spanish, english] of Object.entries(TOPIC_TRANSLATIONS)) {
        const spanishWords = spanish.split(/\s+/);
        if (spanishWords.some(sw => words.includes(sw))) {
            extraKeywords.push(...english.slice(0, 3)); // Add top 3 translations
        }
    }

    return [...new Set(extraKeywords)];
}

// ==================== RETRIEVAL ====================

function scoreChunk(chunk: DocumentChunk, queryKeywords: string[]): number {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();

    for (const keyword of queryKeywords) {
        // Exact keyword match in chunk keywords
        if (chunk.keywords.includes(keyword)) score += 3;
        // Substring match in content
        if (contentLower.includes(keyword)) score += 1;
    }

    return score;
}

/**
 * Retrieve relevant document chunks for a given topic/query
 * @param query - search query or topic (e.g., "Cultura Digital", "gestión de proyectos metodología")
 * @param topK - number of chunks to return
 * @returns Array of relevant text chunks
 */
export function retrieveContext(query: string, topK: number = 5): DocumentChunk[] {
    if (ragContext.chunks.length === 0) return [];

    // Expand query with bilingual translations
    const translatedKeywords = expandQueryWithTranslations(query);
    const queryKeywords = [...extractKeywords(query), ...translatedKeywords];
    if (queryKeywords.length === 0) return [];

    const scored = ragContext.chunks
        .map(chunk => ({ chunk, score: scoreChunk(chunk, queryKeywords) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

    return scored.map(({ chunk }) => chunk);
}

/**
 * Get relevant context as a formatted string for injection into recommendations
 * @param topic - The dimension/foundation name to search for
 * @param topK - Max chunks
 * @returns Formatted context string or empty string
 */
export function getContextForTopic(topic: string, topK: number = 3): string {
    const chunks = retrieveContext(topic, topK);
    if (chunks.length === 0) return '';

    const contextParts = chunks.map((c, i) =>
        `[Fuente: ${c.source}] ${c.content}`
    );

    return contextParts.join('\n\n');
}

/**
 * Get RAG status info
 */
export function getRAGStatus() {
    return {
        indexed: ragContext.chunks.length > 0,
        totalChunks: ragContext.chunks.length,
        lastIndexed: ragContext.lastIndexed,
        sources: [...new Set(ragContext.chunks.map(c => c.source))],
    };
}
