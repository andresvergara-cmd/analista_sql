/**
 * Groq API Client
 * Free tier: 200K tokens/day with Llama 3.1 70B (500-800 tok/s)
 */

import Groq from "groq-sdk";

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export class GroqClient {
  private client: Groq;
  private readonly defaultModel = "llama-3.3-70b-versatile"; // Updated from deprecated llama-3.1-70b-versatile

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }

    this.client = new Groq({
      apiKey,
    });
  }

  /**
   * Generate SQL query from natural language
   */
  async generateSQL(
    userQuery: string,
    dbSchema: string,
    companyId?: string
  ): Promise<string> {
    const systemPrompt = `You are an expert PostgreSQL 17 database engineer and Prisma ORM specialist.
Your task is to generate SAFE, EFFICIENT SQL queries from natural language questions.

DATABASE SCHEMA (Prisma format):
${dbSchema}

SECURITY CONSTRAINTS (CRITICAL):
- ONLY SELECT queries allowed (no INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, etc.)
- Maximum 1000 rows returned (use LIMIT 1000)
- Only access tables: Tenant, User, Company, Assessment, Course, Answer, Diagnosis, Report, SurveyLink, UserCompanyAccess
- Always use parameterized queries with placeholders ($1, $2, etc.) when filtering by IDs
- Never expose passwords or sensitive data
- Always use proper JOINs with explicit ON conditions

SQL RULES (CRITICAL - FOLLOW STRICTLY):
- GROUP BY RULE: If using GROUP BY, ALL non-aggregated columns in SELECT must be in GROUP BY clause
- AGGREGATION RULE: Use aggregate functions (COUNT, AVG, SUM, MAX, MIN) correctly
- ORDER BY RULE: Columns in ORDER BY must be in SELECT or be part of an aggregate
- NO mixing of aggregated and non-aggregated columns without proper GROUP BY

OUTPUT FORMAT (JSON only):
{
  "sql": "SELECT ... (use $1, $2 for parameters)",
  "parameters": ["value1", "value2"],
  "explanation": "Plain Spanish explanation of what the query does",
  "estimatedComplexity": "low" | "medium" | "high"
}

EXAMPLES:
Query: "¿Cuántos diagnósticos tiene la empresa?"
{
  "sql": "SELECT COUNT(*) as total FROM \\"Answer\\" a JOIN \\"Diagnosis\\" d ON d.\\"answerId\\" = a.\\"id\\" WHERE a.\\"companyId\\" = $1",
  "parameters": ["company-uuid"],
  "explanation": "Cuenta el número total de diagnósticos completados para la empresa",
  "estimatedComplexity": "low"
}

Query: "Listar todos los diagnósticos"
{
  "sql": "SELECT d.\\"id\\", d.\\"score\\", d.\\"result\\", d.\\"createdAt\\", a.\\"studentName\\" FROM \\"Diagnosis\\" d JOIN \\"Answer\\" a ON d.\\"answerId\\" = a.\\"id\\" WHERE a.\\"companyId\\" = $1 ORDER BY d.\\"createdAt\\" DESC LIMIT 1000",
  "parameters": ["company-uuid"],
  "explanation": "Lista todos los diagnósticos con sus detalles ordenados por fecha",
  "estimatedComplexity": "low"
}`;

    const userPrompt = `USER QUERY: "${userQuery}"${companyId ? `\nCOMPANY ID: ${companyId}` : ''}

Generate the JSON response following the format above.`;

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: this.defaultModel,
        temperature: 0.1, // Low temperature for deterministic SQL generation
        max_tokens: 1000,
        top_p: 1,
      });

      const responseContent = completion.choices[0]?.message?.content || '';

      // Extract JSON from response (may be wrapped in markdown code blocks)
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) ||
                       responseContent.match(/```\n([\s\S]*?)\n```/) ||
                       [null, responseContent];

      return jsonMatch[1]?.trim() || responseContent.trim();
    } catch (error: any) {
      console.error('Groq API error:', error);
      throw new Error(`Groq API failed: ${error.message}`);
    }
  }

  /**
   * Generate explanation for query results
   */
  async generateExplanation(
    query: string,
    sql: string,
    results?: any[]
  ): Promise<string> {
    const systemPrompt = `You are a data analyst expert. Generate clear, concise explanations in Spanish.`;

    const userPrompt = `User asked: "${query}"
SQL executed: ${sql}
${results ? `Results count: ${results.length} rows` : ''}

Provide a brief Spanish explanation of what this query does and what the user should understand from the results.`;

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: this.defaultModel,
        temperature: 0.3,
        max_tokens: 300,
      });

      return completion.choices[0]?.message?.content || 'No explanation available.';
    } catch (error: any) {
      console.error('Groq explanation error:', error);
      return 'No se pudo generar explicación.';
    }
  }

  /**
   * General purpose text generation
   */
  async generateText(
    messages: GroqMessage[],
    options: GroqCompletionOptions = {}
  ): Promise<string> {
    const {
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 1000,
      topP = 1,
    } = options;

    try {
      const completion = await this.client.chat.completions.create({
        messages,
        model,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('Groq text generation error:', error);
      throw new Error(`Groq text generation failed: ${error.message}`);
    }
  }

  /**
   * Check if Groq API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const completion = await this.client.chat.completions.create({
        messages: [{ role: "user", content: "ping" }],
        model: this.defaultModel,
        max_tokens: 10,
      });
      return !!completion.choices[0]?.message?.content;
    } catch (error) {
      console.error('Groq health check failed:', error);
      return false;
    }
  }
}

export const groqClient = new GroqClient();
