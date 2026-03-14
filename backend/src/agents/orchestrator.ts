/**
 * Multi-Agent Orchestrator
 * Coordinates all 6 agents to process natural language SQL queries
 * Flow: User Proxy → AI Engineer → Solution Architect → QA Engineer → Fullstack Dev
 */

import { PrismaClient } from '@prisma/client';
import { userProxyAgent, UserIntent } from './user-proxy.agent';
import { aiEngineerAgent, SQLQueryPlan } from './ai-engineer.agent';
import { solutionArchitectAgent, ExecutionStrategy } from './solution-architect.agent';
import { qaEngineerAgent, ValidationResult } from './qa-engineer.agent';
import FullstackDevAgent, { QueryResult } from './fullstack-dev.agent';

export interface OrchestrationResult {
  success: boolean;
  result?: QueryResult;
  error?: string;
  metadata: {
    intent: UserIntent;
    sqlPlan?: SQLQueryPlan;
    strategy?: ExecutionStrategy;
    validation?: ValidationResult;
    agentTimings: {
      userProxy: number;
      aiEngineer: number;
      solutionArchitect: number;
      qaEngineer: number;
      fullstackDev: number;
      total: number;
    };
  };
}

export class MultiAgentOrchestrator {
  private prisma: PrismaClient;
  private fullstackDev: FullstackDevAgent;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.fullstackDev = new FullstackDevAgent(prisma);
  }

  /**
   * Orchestrate the entire multi-agent query processing pipeline
   */
  async processQuery(
    userQuery: string,
    companyId: string,
    companyName: string
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const agentTimings: OrchestrationResult['metadata']['agentTimings'] = {
      userProxy: 0,
      aiEngineer: 0,
      solutionArchitect: 0,
      qaEngineer: 0,
      fullstackDev: 0,
      total: 0,
    };

    try {
      console.log(`\n[Orchestrator] Processing query: "${userQuery}"`);
      console.log(`[Orchestrator] Company: ${companyName} (${companyId})`);

      // AGENT 1: User Proxy - Interpret intent
      const t1 = Date.now();
      console.log('\n[Orchestrator] Agent 1: User Proxy - Interpreting query...');
      const intent: UserIntent = await userProxyAgent.interpret(userQuery, companyId);
      agentTimings.userProxy = Date.now() - t1;

      console.log(`[Orchestrator] Intent detected: ${intent.queryType} (${intent.complexity} complexity)`);
      console.log(`[Orchestrator] Refined query: "${intent.refinedQuery}"`);

      // Validate intent
      const intentValidation = await userProxyAgent.validate(intent);
      if (!intentValidation.valid) {
        return {
          success: false,
          error: intentValidation.reason,
          metadata: {
            intent,
            agentTimings: {
              ...agentTimings,
              total: Date.now() - startTime,
            },
          },
        };
      }

      // AGENT 2: AI Engineer - Generate SQL
      const t2 = Date.now();
      console.log('\n[Orchestrator] Agent 2: AI Engineer - Generating SQL...');
      let sqlPlan: SQLQueryPlan = await aiEngineerAgent.generateSQL(intent, companyId);
      agentTimings.aiEngineer = Date.now() - t2;

      console.log(`[Orchestrator] SQL generated (provider: ${sqlPlan.provider})`);
      console.log(`[Orchestrator] SQL: ${sqlPlan.sql.substring(0, 100)}...`);

      // Refine SQL
      sqlPlan = await aiEngineerAgent.refineSQL(sqlPlan);

      // Basic validation from AI Engineer
      const basicValidation = await aiEngineerAgent.validateSQL(sqlPlan);
      if (!basicValidation.valid) {
        return {
          success: false,
          error: `SQL validation failed: ${basicValidation.errors.join(', ')}`,
          metadata: {
            intent,
            sqlPlan,
            agentTimings: {
              ...agentTimings,
              total: Date.now() - startTime,
            },
          },
        };
      }

      // AGENT 3: Solution Architect - Plan execution
      const t3 = Date.now();
      console.log('\n[Orchestrator] Agent 3: Solution Architect - Planning execution...');
      const strategy: ExecutionStrategy = await solutionArchitectAgent.planExecution(sqlPlan, companyId);
      agentTimings.solutionArchitect = Date.now() - t3;

      console.log(`[Orchestrator] Strategy: cache=${strategy.useCache}, optimize=${strategy.shouldOptimize}, priority=${strategy.executionPriority}`);
      console.log(`[Orchestrator] Estimated duration: ${strategy.estimatedDuration}ms`);

      // AGENT 5: QA Engineer - Comprehensive validation
      const t5 = Date.now();
      console.log('\n[Orchestrator] Agent 5: QA Engineer - Validating security...');
      const validation: ValidationResult = await qaEngineerAgent.validate(sqlPlan, companyId);
      agentTimings.qaEngineer = Date.now() - t5;

      console.log(`[Orchestrator] Validation: ${validation.isValid ? 'PASSED' : 'FAILED'} (${validation.securityLevel})`);

      if (!validation.isValid) {
        console.error(`[Orchestrator] Validation errors:`, validation.errors);
        return {
          success: false,
          error: `Security validation failed: ${validation.errors.join(', ')}`,
          metadata: {
            intent,
            sqlPlan,
            strategy,
            validation,
            agentTimings: {
              ...agentTimings,
              total: Date.now() - startTime,
            },
          },
        };
      }

      if (validation.warnings.length > 0) {
        console.warn(`[Orchestrator] Validation warnings:`, validation.warnings);
      }

      // AGENT 6: Fullstack Dev - Execute query
      const t6 = Date.now();
      console.log('\n[Orchestrator] Agent 6: Fullstack Dev - Executing query...');
      const result: QueryResult = await this.fullstackDev.execute(sqlPlan, strategy, userQuery);
      agentTimings.fullstackDev = Date.now() - t6;

      console.log(`[Orchestrator] Execution complete: ${result.rowCount} rows in ${result.executionTime}ms`);
      console.log(`[Orchestrator] Visualization: ${result.visualization.type}`);
      console.log(`[Orchestrator] Cached: ${result.cached}`);

      agentTimings.total = Date.now() - startTime;

      console.log(`\n[Orchestrator] Total pipeline time: ${agentTimings.total}ms`);
      console.log(`[Orchestrator] Agent breakdown: UP=${agentTimings.userProxy}ms, AE=${agentTimings.aiEngineer}ms, SA=${agentTimings.solutionArchitect}ms, QA=${agentTimings.qaEngineer}ms, FD=${agentTimings.fullstackDev}ms`);

      return {
        success: true,
        result,
        metadata: {
          intent,
          sqlPlan,
          strategy,
          validation,
          agentTimings,
        },
      };
    } catch (error: any) {
      console.error('[Orchestrator] Pipeline failed:', error);

      agentTimings.total = Date.now() - startTime;

      return {
        success: false,
        error: error.message || 'Unknown error in query processing',
        metadata: {
          intent: {} as UserIntent,
          agentTimings,
        },
      };
    }
  }

  /**
   * Health check for all agents and LLM providers
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    agents: Record<string, boolean>;
    llm: { groq: boolean; ollama: boolean };
    database: boolean;
  }> {
    try {
      // Check database
      const dbCheck = await this.prisma.$queryRaw`SELECT 1`;
      const databaseHealthy = !!dbCheck;

      // Check LLM providers
      const { llmClient } = await import('../utils/llm-client');
      const llmHealth = await llmClient.healthCheck();

      // All agents are code-based (no external dependencies except LLM/DB)
      const agents = {
        userProxy: llmHealth.groq, // Depends on Groq
        aiEngineer: llmHealth.groq || llmHealth.ollama, // Can use either
        solutionArchitect: true, // No external deps
        qaEngineer: true, // No external deps
        fullstackDev: databaseHealthy, // Depends on database
      };

      const allHealthy = databaseHealthy && (llmHealth.groq || llmHealth.ollama);

      return {
        status: allHealthy ? 'healthy' : 'degraded',
        agents,
        llm: llmHealth,
        database: databaseHealthy,
      };
    } catch (error) {
      console.error('[Orchestrator] Health check failed:', error);
      return {
        status: 'unhealthy',
        agents: {
          userProxy: false,
          aiEngineer: false,
          solutionArchitect: false,
          qaEngineer: false,
          fullstackDev: false,
        },
        llm: { groq: false, ollama: false },
        database: false,
      };
    }
  }

  /**
   * Get cache statistics from Fullstack Dev agent
   */
  getCacheStats() {
    return this.fullstackDev.getCacheStats();
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.fullstackDev.clearCache();
  }
}

// Singleton instance will be created in index.ts with Prisma client
export default MultiAgentOrchestrator;
