/**
 * Ollama API Client
 * Local LLM deployment - Unlimited queries, no cost
 * Recommended models: sqlcoder:7b (SQL specialized), llama3.1:8b (general)
 */

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaGenerateOptions {
  model?: string;
  temperature?: number;
  numPredict?: number;
}

export class OllamaClient {
  private readonly baseUrl: string;
  private readonly defaultModel = "llama3.1:8b";
  private readonly sqlModel = "sqlcoder:7b"; // SQL-specialized model

  constructor() {
    this.baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  }

  /**
   * Check if Ollama server is running
   */
  async ping(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate SQL query from natural language using SQLCoder
   */
  async generateSQL(
    userQuery: string,
    dbSchema: string,
    companyId?: string
  ): Promise<string> {
    const prompt = `You are an expert PostgreSQL 17 database engineer.
Generate SAFE, EFFICIENT SQL queries from natural language.

DATABASE SCHEMA (Prisma):
${dbSchema}

SECURITY RULES:
- ONLY SELECT queries (no INSERT, UPDATE, DELETE, DROP, etc.)
- Maximum 1000 rows (use LIMIT 1000)
- Use parameterized queries ($1, $2, etc.)
- Only tables: Tenant, User, Company, Assessment, Answer, Diagnosis, Report, SurveyLink

USER QUERY: "${userQuery}"
${companyId ? `COMPANY ID: ${companyId}` : ''}

Return JSON:
{
  "sql": "SELECT ...",
  "parameters": [],
  "explanation": "Spanish explanation",
  "estimatedComplexity": "low|medium|high"
}`;

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.sqlModel,
          prompt,
          stream: false,
          options: {
            temperature: 0.1,
            num_predict: 1000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.response || '';

      // Extract JSON from response
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                       responseText.match(/```\n([\s\S]*?)\n```/) ||
                       responseText.match(/\{[\s\S]*\}/);

      return jsonMatch ? (jsonMatch[1] || jsonMatch[0]).trim() : responseText.trim();
    } catch (error: any) {
      console.error('Ollama SQL generation error:', error);
      throw new Error(`Ollama failed: ${error.message}`);
    }
  }

  /**
   * Generate general text using Llama 3.1
   */
  async generateText(
    prompt: string,
    options: OllamaGenerateOptions = {}
  ): Promise<string> {
    const {
      model = this.defaultModel,
      temperature = 0.7,
      numPredict = 500,
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature,
            num_predict: numPredict,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error: any) {
      console.error('Ollama text generation error:', error);
      throw new Error(`Ollama text generation failed: ${error.message}`);
    }
  }

  /**
   * Chat completion with conversation history
   */
  async chat(
    messages: OllamaMessage[],
    options: OllamaGenerateOptions = {}
  ): Promise<string> {
    const {
      model = this.defaultModel,
      temperature = 0.7,
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: {
            temperature,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama chat error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.message?.content || '';
    } catch (error: any) {
      console.error('Ollama chat error:', error);
      throw new Error(`Ollama chat failed: ${error.message}`);
    }
  }

  /**
   * List available models on Ollama server
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      console.error('Ollama list models error:', error);
      return [];
    }
  }

  /**
   * Pull a model from Ollama library (useful for setup)
   */
  async pullModel(modelName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName,
          stream: false,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Ollama pull model error:', error);
      return false;
    }
  }
}

export const ollamaClient = new OllamaClient();
