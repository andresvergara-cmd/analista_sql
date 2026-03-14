/**
 * Agent 2: AI Engineer
 * Role: Generate SQL queries from natural language using LLM
 * Input: Refined query + entities from User Proxy
 * Output: SQL query + parameters + explanation
 */

import { llmClient, LLMQueryResult } from '../utils/llm-client';
import { UserIntent } from './user-proxy.agent';
import fs from 'fs';
import path from 'path';

export interface SQLQueryPlan {
  sql: string;
  parameters: any[];
  explanation: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedRows: number;
  requiresJoins: boolean;
  tablesInvolved: string[];
  provider: 'groq' | 'ollama';
}

export class AIEngineerAgent {
  private dbSchema: string;

  constructor() {
    // Load Prisma schema for LLM context
    this.dbSchema = this.loadPrismaSchema();
  }

  /**
   * Load Prisma schema to provide database context to LLM
   */
  private loadPrismaSchema(): string {
    try {
      const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');
      return fs.readFileSync(schemaPath, 'utf-8');
    } catch (error) {
      console.error('[AIEngineer] Failed to load Prisma schema:', error);
      // Fallback: basic schema description
      return `
DATABASE SCHEMA:
- Tenant: Multi-tenancy support
- User: System users with roles
- Company: Organizations being assessed
- Assessment: Digital maturity instruments (Kroh, Kerzner, etc.)
- Answer: Responses from users/respondents
- Diagnosis: Calculated maturity results with scores and dimensions
- Report: Generated PDF reports
- SurveyLink: Public survey links for companies

KEY RELATIONSHIPS:
- Company has many Answers
- Answer belongs to Assessment
- Answer has one Diagnosis
- Diagnosis has JSON "result" field with dimensions, scores, recommendations, roadmap
`;
    }
  }

  /**
   * Generate SQL query from user intent
   */
  async generateSQL(
    intent: UserIntent,
    companyId: string
  ): Promise<SQLQueryPlan> {
    try {
      // Call hybrid LLM client to generate SQL
      const result: LLMQueryResult = await llmClient.generateSQL(
        intent.refinedQuery,
        this.dbSchema,
        companyId,
        intent.complexity
      );

      // Ensure companyId is in parameters if filtering by company
      const parameters = this.ensureCompanyFilter(result.parameters, companyId);

      // Analyze query metadata
      const metadata = this.analyzeQuery(result.sql);

      return {
        sql: result.sql,
        parameters,
        explanation: result.explanation,
        complexity: result.estimatedComplexity,
        estimatedRows: metadata.estimatedRows,
        requiresJoins: metadata.requiresJoins,
        tablesInvolved: metadata.tablesInvolved,
        provider: result.provider,
      };
    } catch (error: any) {
      console.error('[AIEngineer] SQL generation failed:', error);
      throw new Error(`Failed to generate SQL: ${error.message}`);
    }
  }

  /**
   * Ensure companyId filter is applied for multi-tenancy security
   */
  private ensureCompanyFilter(parameters: any[], companyId: string): any[] {
    // If parameters already exist, assume companyId is included
    if (parameters.length > 0) {
      return parameters;
    }

    // If no parameters, add companyId as first parameter
    return [companyId];
  }

  /**
   * Analyze SQL query to extract metadata
   */
  private analyzeQuery(sql: string): {
    requiresJoins: boolean;
    tablesInvolved: string[];
    estimatedRows: number;
  } {
    const upperSQL = sql.toUpperCase();

    // Detect JOINs
    const requiresJoins = /\bJOIN\b/.test(upperSQL);

    // Extract table names (simple regex for common patterns)
    const tablePattern = /FROM\s+"?(\w+)"?|JOIN\s+"?(\w+)"?/gi;
    const tables = new Set<string>();
    let match;

    while ((match = tablePattern.exec(sql)) !== null) {
      const tableName = match[1] || match[2];
      if (tableName) {
        tables.add(tableName);
      }
    }

    // Estimate rows based on query type
    let estimatedRows = 1000; // Default

    if (/COUNT\s*\(/i.test(sql)) {
      estimatedRows = 1; // COUNT returns single row
    } else if (/LIMIT\s+(\d+)/i.test(sql)) {
      const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
      estimatedRows = parseInt(limitMatch![1], 10);
    } else if (/AVG|SUM|MAX|MIN/i.test(sql) && /GROUP\s+BY/i.test(sql)) {
      estimatedRows = 50; // Aggregations with grouping
    }

    return {
      requiresJoins,
      tablesInvolved: Array.from(tables),
      estimatedRows,
    };
  }

  /**
   * Refine SQL query (post-generation optimization)
   * This is a simple version - Agent 4 (Data Architect) will do deeper optimization
   */
  async refineSQL(plan: SQLQueryPlan): Promise<SQLQueryPlan> {
    let refinedSQL = plan.sql;

    // Ensure LIMIT clause exists (safety)
    if (!/LIMIT\s+\d+/i.test(refinedSQL) && !/COUNT\s*\(/i.test(refinedSQL)) {
      refinedSQL += ' LIMIT 1000';
    }

    // Ensure proper quoting for PostgreSQL identifiers
    refinedSQL = this.quoteIdentifiers(refinedSQL);

    return {
      ...plan,
      sql: refinedSQL,
    };
  }

  /**
   * Quote table and column names for PostgreSQL
   */
  private quoteIdentifiers(sql: string): string {
    // Simple implementation: ensure double quotes around table names
    // This handles common cases like Answer, Diagnosis, etc.

    const tables = ['Tenant', 'User', 'Company', 'Assessment', 'Course', 'Answer', 'Diagnosis', 'Report', 'SurveyLink', 'UserCompanyAccess'];

    let quotedSQL = sql;

    tables.forEach(table => {
      // Match table name not already quoted
      const pattern = new RegExp(`\\b${table}\\b(?!")`, 'g');
      quotedSQL = quotedSQL.replace(pattern, `"${table}"`);
    });

    return quotedSQL;
  }

  /**
   * Validate generated SQL for security
   * Basic validation - Agent 5 (QA Engineer) will do comprehensive validation
   */
  async validateSQL(plan: SQLQueryPlan): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check for forbidden operations
    const forbiddenPatterns = [
      { pattern: /\b(DROP|ALTER|TRUNCATE|CREATE)\b/i, message: 'DDL operations not allowed' },
      { pattern: /\b(INSERT|UPDATE|DELETE)\b/i, message: 'DML write operations not allowed' },
      { pattern: /\b(GRANT|REVOKE)\b/i, message: 'Permission operations not allowed' },
      { pattern: /;\s*\w+/i, message: 'Multiple statements not allowed' },
      { pattern: /--/i, message: 'SQL comments suspicious' },
      { pattern: /\/\*/i, message: 'Block comments suspicious' },
    ];

    forbiddenPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(plan.sql)) {
        errors.push(message);
      }
    });

    // Check for proper parameterization (should use $1, $2, not raw values)
    if (/'.*DROP.*'|'.*DELETE.*'/i.test(plan.sql)) {
      errors.push('Suspicious string literals in SQL');
    }

    // Ensure SELECT only
    if (!/^\s*SELECT\b/i.test(plan.sql.trim())) {
      errors.push('Query must start with SELECT');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const aiEngineerAgent = new AIEngineerAgent();
