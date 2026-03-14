/**
 * Direct Test of Multi-Agent Orchestrator
 * Bypasses HTTP layer to test the agent pipeline directly
 */

import { PrismaClient } from '@prisma/client';
import MultiAgentOrchestrator from './src/agents/orchestrator';

const prisma = new PrismaClient();
const orchestrator = new MultiAgentOrchestrator(prisma);

// Test company ID (use first available company)
let TEST_COMPANY_ID: string;
let TEST_COMPANY_NAME: string;

const testQueries = [
  {
    name: 'TEST 1: Simple Count',
    query: '¿Cuántos diagnósticos tiene la empresa?',
  },
  {
    name: 'TEST 2: Average by Dimension',
    query: 'Puntaje promedio por dimensión',
  },
  {
    name: 'TEST 3: Worst Performing Dimension',
    query: '¿Cuál es la dimensión con menor desempeño?',
  },
  {
    name: 'TEST 4: General Summary',
    query: 'Dame un resumen general de la empresa',
  },
  {
    name: 'TEST 5: List All Diagnoses',
    query: 'Listar todos los diagnósticos',
  },
];

async function runTests() {
  console.log('🚀 Multi-Agent Orchestrator - Direct Tests\n');
  console.log('='.repeat(80));

  try {
    // Get first company
    const company = await prisma.company.findFirst();
    if (!company) {
      throw new Error('No companies found in database');
    }

    TEST_COMPANY_ID = company.id;
    TEST_COMPANY_NAME = company.name;

    console.log(`\n✅ Using company: ${TEST_COMPANY_NAME}`);
    console.log(`   ID: ${TEST_COMPANY_ID}\n`);
    console.log('='.repeat(80));

    let passed = 0;
    let failed = 0;

    for (const test of testQueries) {
      console.log(`\n${test.name}`);
      console.log('-'.repeat(80));
      console.log(`Query: "${test.query}"`);

      const startTime = Date.now();

      try {
        const result = await orchestrator.processQuery(
          test.query,
          TEST_COMPANY_ID,
          TEST_COMPANY_NAME
        );

        const duration = Date.now() - startTime;

        if (!result.success) {
          throw new Error(result.error || 'Unknown error');
        }

        console.log(`\n✅ SUCCESS (${duration}ms)`);

        if (result.result) {
          console.log(`\nSQL Generated:`);
          console.log(`${result.result.sql.substring(0, 200)}${result.result.sql.length > 200 ? '...' : ''}`);
          console.log(`\nResults: ${result.result.rowCount} rows`);
          console.log(`Visualization: ${result.result.visualization.type}`);
          console.log(`Provider: ${result.result.provider}`);
          console.log(`Cached: ${result.result.cached}`);
          console.log(`Execution Time: ${result.result.executionTime}ms`);
        }

        if (result.metadata.agentTimings) {
          console.log(`\n📊 Agent Pipeline Timings:`);
          console.log(`   User Proxy:         ${result.metadata.agentTimings.userProxy}ms`);
          console.log(`   AI Engineer:        ${result.metadata.agentTimings.aiEngineer}ms`);
          console.log(`   Solution Architect: ${result.metadata.agentTimings.solutionArchitect}ms`);
          console.log(`   QA Engineer:        ${result.metadata.agentTimings.qaEngineer}ms`);
          console.log(`   Fullstack Dev:      ${result.metadata.agentTimings.fullstackDev}ms`);
          console.log(`   ─────────────────────────────`);
          console.log(`   TOTAL PIPELINE:     ${result.metadata.agentTimings.total}ms`);
        }

        if (result.metadata.sqlPlan) {
          console.log(`\n🔍 Query Metadata:`);
          console.log(`   Complexity: ${result.metadata.sqlPlan.complexity}`);
          console.log(`   Tables: ${result.metadata.sqlPlan.tablesInvolved.join(', ')}`);
          console.log(`   Requires JOINs: ${result.metadata.sqlPlan.requiresJoins}`);
        }

        if (result.metadata.validation) {
          console.log(`\n🔒 Security Validation:`);
          console.log(`   Status: ${result.metadata.validation.isValid ? '✅ PASSED' : '❌ FAILED'}`);
          console.log(`   Security Level: ${result.metadata.validation.securityLevel}`);

          if (result.metadata.validation.warnings && result.metadata.validation.warnings.length > 0) {
            console.log(`   Warnings: ${result.metadata.validation.warnings.length}`);
            result.metadata.validation.warnings.forEach(w => console.log(`     - ${w}`));
          }

          if (result.metadata.validation.recommendations && result.metadata.validation.recommendations.length > 0) {
            console.log(`   Recommendations: ${result.metadata.validation.recommendations.length}`);
          }
        }

        passed++;
      } catch (error: any) {
        console.log(`\n❌ FAILED: ${error.message}`);
        console.error(error.stack);
        failed++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log(`\n📈 Test Summary:`);
    console.log(`   Total Tests: ${testQueries.length}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   Success Rate: ${((passed / testQueries.length) * 100).toFixed(1)}%`);
    console.log('\n' + '='.repeat(80));

    if (failed === 0) {
      console.log('\n🎉 All tests passed! Multi-Agent System is fully operational.\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Review errors above.\n');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
runTests();
