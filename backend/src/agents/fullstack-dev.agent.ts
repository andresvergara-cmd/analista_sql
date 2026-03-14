/**
 * Agent 6: Fullstack Developer
 * Role: Execute SQL, format results, determine visualization type
 * Input: Validated SQL query + execution strategy
 * Output: Query results + visualization metadata
 */

import { PrismaClient } from '@prisma/client';
import { SQLQueryPlan } from './ai-engineer.agent';
import { ExecutionStrategy } from './solution-architect.agent';

export interface QueryResult {
  sql: string;
  data: any[];
  rowCount: number;
  executionTime: number; // milliseconds
  explanation: string;
  visualization: VisualizationMetadata;
  provider: 'groq' | 'ollama';
  cached: boolean;
}

export interface VisualizationMetadata {
  type: 'table' | 'bar' | 'line' | 'pie' | 'radar' | 'scatter';
  xAxis?: string;
  yAxis?: string;
  categories?: string[];
  series?: string[];
  recommendedLibrary: 'recharts' | 'plotly';
  chartConfig?: any;
}

export class FullstackDevAgent {
  private prisma: PrismaClient;
  private cache: Map<string, { data: any[]; timestamp: number }>;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.cache = new Map();
  }

  /**
   * Execute SQL query and return formatted results
   */
  async execute(
    sqlPlan: SQLQueryPlan,
    strategy: ExecutionStrategy,
    userQuery: string
  ): Promise<QueryResult> {
    const startTime = Date.now();
    let data: any[] = [];
    let cached = false;

    // Check cache first
    if (strategy.useCache && strategy.cacheKey) {
      const cachedResult = this.getFromCache(strategy.cacheKey, strategy.cacheTTL!);
      if (cachedResult) {
        data = cachedResult;
        cached = true;
        console.log(`[FullstackDev] Cache hit: ${strategy.cacheKey}`);
      }
    }

    // Execute query if not cached
    if (!cached) {
      try {
        data = await this.executeRawSQL(sqlPlan.sql, sqlPlan.parameters);

        // Cache result if strategy requires it
        if (strategy.useCache && strategy.cacheKey) {
          this.setCache(strategy.cacheKey, data);
          console.log(`[FullstackDev] Cached result: ${strategy.cacheKey}`);
        }
      } catch (error: any) {
        console.error('[FullstackDev] Query execution failed:', error);
        throw new Error(`Query execution failed: ${error.message}`);
      }
    }

    const executionTime = Date.now() - startTime;

    // Determine best visualization
    const visualization = this.determineVisualization(data, userQuery, sqlPlan);

    return {
      sql: sqlPlan.sql,
      data,
      rowCount: data.length,
      executionTime,
      explanation: sqlPlan.explanation,
      visualization,
      provider: sqlPlan.provider,
      cached,
    };
  }

  /**
   * Execute raw SQL query using Prisma
   */
  private async executeRawSQL(sql: string, parameters: any[]): Promise<any[]> {
    try {
      // Use Prisma's $queryRawUnsafe with parameters
      // Note: Prisma doesn't support positional parameters directly,
      // so we need to use template strings or convert to named parameters

      const result = await this.prisma.$queryRawUnsafe(sql, ...parameters);

      return Array.isArray(result) ? result : [result];
    } catch (error: any) {
      console.error('[FullstackDev] SQL execution error:', error);
      throw error;
    }
  }

  /**
   * Determine appropriate visualization type based on data structure
   */
  private determineVisualization(
    data: any[],
    userQuery: string,
    sqlPlan: SQLQueryPlan
  ): VisualizationMetadata {
    // Default to table
    if (!data || data.length === 0) {
      return {
        type: 'table',
        recommendedLibrary: 'recharts',
      };
    }

    const firstRow = data[0];
    const columns = Object.keys(firstRow);
    const numericColumns = columns.filter(col =>
      typeof firstRow[col] === 'number'
    );

    // Single value (COUNT, AVG, etc.) → table
    if (data.length === 1 && columns.length <= 2) {
      return {
        type: 'table',
        recommendedLibrary: 'recharts',
      };
    }

    // Dimension analysis (e.g., "promedio por dimensión") → bar chart
    if (
      columns.some(col => /dimension|dimensi[oó]n/i.test(col)) &&
      numericColumns.length > 0
    ) {
      return {
        type: 'bar',
        xAxis: columns.find(col => /dimension|dimensi[oó]n/i.test(col)),
        yAxis: numericColumns[0],
        recommendedLibrary: 'recharts',
      };
    }

    // Time series or evolution → line chart
    if (
      columns.some(col => /fecha|date|time|a[ñn]o|mes/i.test(col)) &&
      numericColumns.length > 0
    ) {
      return {
        type: 'line',
        xAxis: columns.find(col => /fecha|date|time|a[ñn]o|mes/i.test(col)),
        yAxis: numericColumns[0],
        recommendedLibrary: 'recharts',
      };
    }

    // Categorical data with numeric values → bar chart
    if (columns.length === 2 && numericColumns.length === 1) {
      const categoryColumn = columns.find(col => col !== numericColumns[0]);
      return {
        type: 'bar',
        xAxis: categoryColumn,
        yAxis: numericColumns[0],
        recommendedLibrary: 'recharts',
      };
    }

    // Multiple dimensions with scores → radar chart
    if (
      data.length >= 3 &&
      data.length <= 10 &&
      numericColumns.length >= 1 &&
      /dimensi[oó]n|foundation|capability/i.test(userQuery)
    ) {
      return {
        type: 'radar',
        categories: data.map(row => row[columns[0]]),
        series: numericColumns,
        recommendedLibrary: 'recharts',
      };
    }

    // Percentage or proportion data → pie chart
    if (
      data.length <= 8 &&
      numericColumns.length === 1 &&
      /porcentaje|distribuci[oó]n|participaci[oó]n/i.test(userQuery)
    ) {
      return {
        type: 'pie',
        categories: data.map(row => row[columns[0]]),
        recommendedLibrary: 'recharts',
      };
    }

    // Comparison queries → bar chart
    if (/comparar|versus|vs|ranking/i.test(userQuery)) {
      return {
        type: 'bar',
        xAxis: columns[0],
        yAxis: numericColumns[0],
        recommendedLibrary: 'recharts',
      };
    }

    // Default to table for complex data
    return {
      type: 'table',
      recommendedLibrary: 'recharts',
    };
  }

  /**
   * Get data from cache
   */
  private getFromCache(cacheKey: string, ttl: number): any[] | null {
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      return null;
    }

    const now = Date.now();
    const age = (now - cached.timestamp) / 1000; // seconds

    if (age > ttl) {
      // Cache expired
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  /**
   * Set data in cache
   */
  private setCache(cacheKey: string, data: any[]): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    // Limit cache size to prevent memory issues
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * Clear cache (for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Note: Will be instantiated in orchestrator with Prisma client
export default FullstackDevAgent;
