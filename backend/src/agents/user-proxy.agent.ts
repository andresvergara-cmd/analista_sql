/**
 * Agent 1: User Proxy
 * Role: Interprets user intent, extracts entities, clarifies ambiguity
 * Input: Natural language query from user
 * Output: Refined query + extracted entities
 */

import { llmClient } from '../utils/llm-client';

export interface UserIntent {
  originalQuery: string;
  refinedQuery: string;
  entities: {
    tables?: string[];
    dimensions?: string[];
    timeRanges?: string[];
    aggregations?: string[];
    filters?: Record<string, any>;
  };
  queryType: 'count' | 'aggregation' | 'comparison' | 'list' | 'recommendation' | 'other';
  complexity: 'low' | 'medium' | 'high';
  requiresClarification: boolean;
  clarificationNeeded?: string;
}

export class UserProxyAgent {
  private groqClient = llmClient['groq']; // Access Groq directly for intent understanding

  /**
   * Interpret user's natural language query
   */
  async interpret(userQuery: string, companyId: string): Promise<UserIntent> {
    const systemPrompt = `You are an expert at understanding user intent for business intelligence queries.
Your task is to analyze natural language questions about digital maturity assessments and extract key information.

DOMAIN CONTEXT:
- Digital maturity assessments (Kroh et al. 2020, Kerzner, etc.)
- Companies being evaluated
- Assessments/Instruments used
- Respondents (people who answered)
- Diagnoses with scores and dimensions
- Recommendations and roadmaps

OUTPUT FORMAT (JSON only):
{
  "refinedQuery": "Clarified, unambiguous version of user query in Spanish",
  "entities": {
    "tables": ["Answer", "Diagnosis"],
    "dimensions": ["Digital Focus", "Data Management"],
    "timeRanges": [],
    "aggregations": ["count", "average"],
    "filters": {"companyId": "uuid"}
  },
  "queryType": "count" | "aggregation" | "comparison" | "list" | "recommendation" | "other",
  "complexity": "low" | "medium" | "high",
  "requiresClarification": false,
  "clarificationNeeded": null
}

QUERY TYPES:
- count: "¿Cuántos diagnósticos?", "Total de evaluaciones"
- aggregation: "Promedio por dimensión", "Puntaje global"
- comparison: "Comparar instrumentos", "Ranking de dimensiones"
- list: "Listar diagnósticos", "Mostrar respondentes"
- recommendation: "Qué mejorar", "Roadmap", "Sugerencias"
- other: Everything else

COMPLEXITY ESTIMATION:
- low: Simple counts, lists, single table queries
- medium: Aggregations, grouping, 2-3 table JOINs
- high: Multiple JOINs, complex aggregations, comparisons across dimensions`;

    const userPrompt = `USER QUERY: "${userQuery}"
COMPANY ID: ${companyId}

Analyze this query and extract the intent and entities.`;

    try {
      const responseText = await this.groqClient.generateText(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        {
          temperature: 0.2, // Low temperature for consistent analysis
          maxTokens: 500,
        }
      );

      // Parse JSON response
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                       responseText.match(/```\n([\s\S]*?)\n```/) ||
                       responseText.match(/\{[\s\S]*\}/);

      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]).trim() : responseText.trim();
      const parsed = JSON.parse(jsonText);

      return {
        originalQuery: userQuery,
        refinedQuery: parsed.refinedQuery || userQuery,
        entities: parsed.entities || {},
        queryType: parsed.queryType || 'other',
        complexity: parsed.complexity || 'medium',
        requiresClarification: parsed.requiresClarification || false,
        clarificationNeeded: parsed.clarificationNeeded || undefined,
      };
    } catch (error: any) {
      console.error('[UserProxyAgent] Failed to interpret query:', error);

      // Fallback: basic interpretation
      return {
        originalQuery: userQuery,
        refinedQuery: userQuery,
        entities: {},
        queryType: this.inferBasicQueryType(userQuery),
        complexity: this.inferBasicComplexity(userQuery),
        requiresClarification: false,
      };
    }
  }

  /**
   * Fallback: Infer query type using pattern matching
   */
  private inferBasicQueryType(query: string): UserIntent['queryType'] {
    const lower = query.toLowerCase();

    if (/cu[aá]ntos|total|n[uú]mero/.test(lower)) return 'count';
    if (/promedio|puntaje|score/.test(lower)) return 'aggregation';
    if (/comparar|versus|vs|ranking/.test(lower)) return 'comparison';
    if (/listar|mostrar|ver|qui[eé]n/.test(lower)) return 'list';
    if (/recomendaci[oó]n|mejorar|roadmap|plan/.test(lower)) return 'recommendation';

    return 'other';
  }

  /**
   * Fallback: Infer complexity using pattern matching
   */
  private inferBasicComplexity(query: string): UserIntent['complexity'] {
    const lower = query.toLowerCase();

    if (/comparar.*entre|correlaci[oó]n|tendencia|evoluci[oó]n/.test(lower)) {
      return 'high';
    }

    if (/promedio.*por|agrupar|dimensi[oó]n/.test(lower)) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Validate if query is safe and answerable
   */
  async validate(intent: UserIntent): Promise<{ valid: boolean; reason?: string }> {
    // Check for dangerous patterns
    const dangerousPatterns = [
      /drop\s+table/i,
      /delete\s+from/i,
      /update\s+.*\s+set/i,
      /insert\s+into/i,
      /truncate/i,
      /alter\s+table/i,
      /create\s+table/i,
      /grant\s+/i,
      /revoke\s+/i,
    ];

    const hasDangerousPattern = dangerousPatterns.some(pattern =>
      pattern.test(intent.originalQuery) || pattern.test(intent.refinedQuery)
    );

    if (hasDangerousPattern) {
      return {
        valid: false,
        reason: 'Query contains potentially dangerous SQL operations. Only SELECT queries are allowed.',
      };
    }

    // Check if query is too vague
    if (intent.refinedQuery.length < 5) {
      return {
        valid: false,
        reason: 'Query is too short or vague. Please provide more details.',
      };
    }

    return { valid: true };
  }
}

export const userProxyAgent = new UserProxyAgent();
