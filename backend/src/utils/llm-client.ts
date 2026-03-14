/**
 * Hybrid LLM Client with Intelligent Routing
 * Routes queries between Groq (complex, cloud) and Ollama (simple, local)
 * Cost: $0/month with hybrid strategy
 */

import { GroqClient } from './groq-client';
import { OllamaClient } from './ollama-client';

export type QueryComplexity = 'low' | 'medium' | 'high';

export interface LLMQueryResult {
  sql: string;
  parameters: string[];
  explanation: string;
  estimatedComplexity: QueryComplexity;
  provider: 'groq' | 'ollama';
}

export class HybridLLMClient {
  private groq: GroqClient;
  private ollama: OllamaClient;
  private useGroqForComplex: boolean;
  private ollamaFallbackEnabled: boolean;

  constructor() {
    this.groq = new GroqClient();
    this.ollama = new OllamaClient();

    // Load configuration from environment
    this.useGroqForComplex = process.env.USE_GROQ_FOR_COMPLEX_QUERIES !== 'false';
    this.ollamaFallbackEnabled = process.env.OLLAMA_FALLBACK_ENABLED !== 'false';
  }

  /**
   * Estimate query complexity based on natural language patterns
   */
  private estimateComplexity(query: string): QueryComplexity {
    const lowerQuery = query.toLowerCase();

    // High complexity indicators
    const highComplexityPatterns = [
      /comparar.*entre/i,
      /correlaci[oó]n/i,
      /tendencia.*tiempo/i,
      /evoluci[oó]n/i,
      /predicci[oó]n/i,
      /m[uú]ltiples.*dimensiones/i,
      /an[aá]lisis.*avanzado/i,
      /segmentaci[oó]n/i,
    ];

    // Medium complexity indicators
    const mediumComplexityPatterns = [
      /promedio.*por/i,
      /agrupar.*por/i,
      /comparar/i,
      /ranking/i,
      /top\s+\d+/i,
      /dimensi[oó]n/i,
      /por\s+(cargo|posici[oó]n|instrumento)/i,
    ];

    // Low complexity: simple counts, lists, single lookups
    const lowComplexityPatterns = [
      /cu[aá]ntos/i,
      /listar/i,
      /mostrar/i,
      /ver/i,
      /qui[eé]n/i,
      /total/i,
    ];

    if (highComplexityPatterns.some(p => p.test(lowerQuery))) {
      return 'high';
    }

    if (mediumComplexityPatterns.some(p => p.test(lowerQuery))) {
      return 'medium';
    }

    if (lowComplexityPatterns.some(p => p.test(lowerQuery))) {
      return 'low';
    }

    // Default to medium if uncertain
    return 'medium';
  }

  /**
   * Generate SQL query with intelligent routing
   */
  async generateSQL(
    userQuery: string,
    dbSchema: string,
    companyId?: string,
    complexity?: QueryComplexity
  ): Promise<LLMQueryResult> {
    // Estimate complexity if not provided
    const estimatedComplexity = complexity || this.estimateComplexity(userQuery);

    let provider: 'groq' | 'ollama' = 'groq';
    let responseText: string;

    try {
      // ROUTING LOGIC
      // 1. High complexity → Always use Groq (most powerful model)
      if (estimatedComplexity === 'high' && this.useGroqForComplex) {
        console.log(`[LLM Router] High complexity → Groq (Llama 3.1 70B)`);
        provider = 'groq';
        responseText = await this.groq.generateSQL(userQuery, dbSchema, companyId);
      }
      // 2. Low/Medium complexity → Try Ollama first (free, unlimited)
      else if (this.ollamaFallbackEnabled) {
        const ollamaAvailable = await this.ollama.ping();

        if (ollamaAvailable) {
          console.log(`[LLM Router] ${estimatedComplexity} complexity → Ollama (local)`);
          provider = 'ollama';
          responseText = await this.ollama.generateSQL(userQuery, dbSchema, companyId);
        } else {
          console.log(`[LLM Router] Ollama unavailable → Groq fallback`);
          provider = 'groq';
          responseText = await this.groq.generateSQL(userQuery, dbSchema, companyId);
        }
      }
      // 3. Fallback disabled → Always Groq
      else {
        console.log(`[LLM Router] Fallback disabled → Groq`);
        provider = 'groq';
        responseText = await this.groq.generateSQL(userQuery, dbSchema, companyId);
      }

      // Parse JSON response
      const result = this.parseQueryResult(responseText);

      return {
        ...result,
        provider,
      };
    } catch (error: any) {
      console.error(`[LLM Router] ${provider} failed:`, error.message);

      // Final fallback: try the other provider
      if (provider === 'groq' && this.ollamaFallbackEnabled) {
        console.log('[LLM Router] Groq failed → Trying Ollama emergency fallback');
        const ollamaAvailable = await this.ollama.ping();
        if (ollamaAvailable) {
          responseText = await this.ollama.generateSQL(userQuery, dbSchema, companyId);
          const result = this.parseQueryResult(responseText);
          return { ...result, provider: 'ollama' };
        }
      } else if (provider === 'ollama') {
        console.log('[LLM Router] Ollama failed → Trying Groq emergency fallback');
        responseText = await this.groq.generateSQL(userQuery, dbSchema, companyId);
        const result = this.parseQueryResult(responseText);
        return { ...result, provider: 'groq' };
      }

      throw new Error(`All LLM providers failed: ${error.message}`);
    }
  }

  /**
   * Parse LLM response into structured result
   */
  private parseQueryResult(responseText: string): Omit<LLMQueryResult, 'provider'> {
    try {
      const parsed = JSON.parse(responseText);
      return {
        sql: parsed.sql || '',
        parameters: parsed.parameters || [],
        explanation: parsed.explanation || 'Sin explicación disponible',
        estimatedComplexity: parsed.estimatedComplexity || 'medium',
      };
    } catch (error) {
      console.error('[LLM Parser] Failed to parse JSON response:', responseText);
      throw new Error('Failed to parse LLM response. Invalid JSON format.');
    }
  }

  /**
   * Generate explanation for query results
   * Always uses Ollama if available (saves Groq tokens)
   */
  async generateExplanation(
    query: string,
    sql: string,
    results?: any[]
  ): Promise<{ explanation: string; provider: 'groq' | 'ollama' }> {
    // Try Ollama first (free, unlimited)
    if (this.ollamaFallbackEnabled) {
      const ollamaAvailable = await this.ollama.ping();
      if (ollamaAvailable) {
        const prompt = `Usuario preguntó: "${query}"
SQL ejecutado: ${sql}
${results ? `Resultados: ${results.length} filas` : ''}

Genera una breve explicación en español de qué hace esta consulta y qué debe entender el usuario de los resultados.`;

        try {
          const explanation = await this.ollama.generateText(prompt);
          return { explanation, provider: 'ollama' };
        } catch (error) {
          console.warn('[Explanation] Ollama failed, falling back to Groq');
        }
      }
    }

    // Fallback to Groq
    const explanation = await this.groq.generateExplanation(query, sql, results);
    return { explanation, provider: 'groq' };
  }

  /**
   * Health check for all LLM providers
   */
  async healthCheck(): Promise<{ groq: boolean; ollama: boolean }> {
    const [groqHealth, ollamaHealth] = await Promise.all([
      this.groq.healthCheck().catch(() => false),
      this.ollama.ping().catch(() => false),
    ]);

    return {
      groq: groqHealth,
      ollama: ollamaHealth,
    };
  }

  /**
   * Get provider statistics (for monitoring/debugging)
   */
  async getProviderStats(): Promise<{
    groqAvailable: boolean;
    ollamaAvailable: boolean;
    ollamaModels: string[];
    recommendedProvider: 'groq' | 'ollama';
  }> {
    const health = await this.healthCheck();
    const ollamaModels = health.ollama ? await this.ollama.listModels() : [];

    return {
      groqAvailable: health.groq,
      ollamaAvailable: health.ollama,
      ollamaModels,
      recommendedProvider: health.ollama ? 'ollama' : 'groq',
    };
  }
}

// Singleton instance
export const llmClient = new HybridLLMClient();
