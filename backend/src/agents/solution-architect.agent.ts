/**
 * Agent 3: Solution Architect
 * Role: Plan query execution strategy, decide if caching/optimization needed
 * Input: SQL query plan from AI Engineer
 * Output: Execution strategy
 */

import { SQLQueryPlan } from './ai-engineer.agent';

export interface ExecutionStrategy {
  useCache: boolean;
  cacheKey?: string;
  cacheTTL?: number; // seconds
  shouldOptimize: boolean;
  shouldValidate: boolean;
  executionPriority: 'low' | 'medium' | 'high';
  estimatedDuration: number; // milliseconds
}

export class SolutionArchitectAgent {
  /**
   * Plan execution strategy for the SQL query
   */
  async planExecution(sqlPlan: SQLQueryPlan, companyId: string): Promise<ExecutionStrategy> {
    // Determine if caching should be used
    const useCache = this.shouldUseCache(sqlPlan);

    // Determine if query needs optimization
    const shouldOptimize = sqlPlan.complexity === 'high' || sqlPlan.requiresJoins;

    // All queries should be validated for security
    const shouldValidate = true;

    // Calculate cache key if caching enabled
    const cacheKey = useCache
      ? this.generateCacheKey(sqlPlan.sql, sqlPlan.parameters, companyId)
      : undefined;

    // Set cache TTL based on query type
    const cacheTTL = useCache ? this.getCacheTTL(sqlPlan) : undefined;

    // Estimate execution duration
    const estimatedDuration = this.estimateDuration(sqlPlan);

    // Set priority based on complexity
    const executionPriority = this.getExecutionPriority(sqlPlan);

    return {
      useCache,
      cacheKey,
      cacheTTL,
      shouldOptimize,
      shouldValidate,
      executionPriority,
      estimatedDuration,
    };
  }

  /**
   * Determine if query results should be cached
   */
  private shouldUseCache(sqlPlan: SQLQueryPlan): boolean {
    // Cache aggregations and complex queries
    if (sqlPlan.complexity === 'high' || sqlPlan.complexity === 'medium') {
      return true;
    }

    // Cache queries with JOINs
    if (sqlPlan.requiresJoins) {
      return true;
    }

    // Cache queries affecting multiple tables
    if (sqlPlan.tablesInvolved.length > 2) {
      return true;
    }

    // Don't cache simple queries or real-time data
    return false;
  }

  /**
   * Generate cache key for query
   */
  private generateCacheKey(sql: string, parameters: any[], companyId: string): string {
    const normalizedSQL = sql.trim().replace(/\s+/g, ' ');
    const paramsStr = JSON.stringify(parameters);
    const keyData = `${companyId}:${normalizedSQL}:${paramsStr}`;

    // Simple hash function (could use crypto.createHash in production)
    let hash = 0;
    for (let i = 0; i < keyData.length; i++) {
      const char = keyData.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return `query:${Math.abs(hash)}`;
  }

  /**
   * Get cache TTL based on query type
   */
  private getCacheTTL(sqlPlan: SQLQueryPlan): number {
    // High complexity: cache for 5 minutes (data doesn't change often)
    if (sqlPlan.complexity === 'high') {
      return 300; // 5 minutes
    }

    // Medium complexity: cache for 2 minutes
    if (sqlPlan.complexity === 'medium') {
      return 120; // 2 minutes
    }

    // Low complexity: cache for 30 seconds
    return 30;
  }

  /**
   * Estimate query execution duration
   */
  private estimateDuration(sqlPlan: SQLQueryPlan): number {
    let duration = 100; // Base duration in ms

    // Add time for JOINs
    if (sqlPlan.requiresJoins) {
      duration += 200 * (sqlPlan.tablesInvolved.length - 1);
    }

    // Add time based on complexity
    if (sqlPlan.complexity === 'high') {
      duration += 500;
    } else if (sqlPlan.complexity === 'medium') {
      duration += 200;
    }

    // Add time based on estimated rows
    if (sqlPlan.estimatedRows > 500) {
      duration += 300;
    }

    return duration;
  }

  /**
   * Get execution priority
   */
  private getExecutionPriority(sqlPlan: SQLQueryPlan): 'low' | 'medium' | 'high' {
    // Simple queries are high priority (fast execution)
    if (sqlPlan.complexity === 'low') {
      return 'high';
    }

    // Medium complexity queries are medium priority
    if (sqlPlan.complexity === 'medium') {
      return 'medium';
    }

    // Complex queries are low priority (may take longer)
    return 'low';
  }
}

export const solutionArchitectAgent = new SolutionArchitectAgent();
