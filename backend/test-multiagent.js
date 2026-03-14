/**
 * Test Script for Multi-Agent SQL Query System
 * Tests the complete pipeline: User Proxy → AI Engineer → Solution Architect → QA → Fullstack Dev
 */

const API_URL = 'http://localhost:3001/api';

// Test credentials
const testUser = {
  email: 'andres.vergara1@u.icesi.edu.co',
  password: 'Icesi2026!'
};

// Test queries with different complexities
const testQueries = [
  {
    name: 'TEST 1: Simple Count (Low Complexity)',
    query: '¿Cuántos diagnósticos tiene la empresa?',
    expectedComplexity: 'low'
  },
  {
    name: 'TEST 2: Average by Dimension (Medium Complexity)',
    query: 'Puntaje promedio por dimensión',
    expectedComplexity: 'medium'
  },
  {
    name: 'TEST 3: Worst Performing Dimension (Medium Complexity)',
    query: '¿Cuál es la dimensión con menor desempeño?',
    expectedComplexity: 'medium'
  },
  {
    name: 'TEST 4: General Summary (Medium Complexity)',
    query: 'Dame un resumen general de la empresa',
    expectedComplexity: 'medium'
  },
  {
    name: 'TEST 5: List All Diagnoses (Low Complexity)',
    query: 'Listar todos los diagnósticos',
    expectedComplexity: 'low'
  }
];

async function runTests() {
  console.log('🚀 Multi-Agent SQL Query System - End-to-End Tests\n');
  console.log('=' .repeat(80));

  try {
    // Step 1: Login
    console.log('\n📝 Step 1: Authenticating...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.statusText}`);
    }

    const { token, user } = await loginResponse.json();
    console.log(`✅ Authenticated as: ${user.name} (${user.role})`);

    // Step 2: Get first company
    console.log('\n📊 Step 2: Fetching companies...');
    const companiesResponse = await fetch(`${API_URL}/companies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const companies = await companiesResponse.json();
    if (!companies || companies.length === 0) {
      throw new Error('No companies found');
    }

    const testCompany = companies[0];
    console.log(`✅ Using company: ${testCompany.name} (ID: ${testCompany.id})`);

    // Step 3: Run query tests
    console.log('\n🧪 Step 3: Running Multi-Agent Query Tests...\n');
    console.log('=' .repeat(80));

    let passed = 0;
    let failed = 0;

    for (const test of testQueries) {
      console.log(`\n${test.name}`);
      console.log('-'.repeat(80));
      console.log(`Query: "${test.query}"`);

      const startTime = Date.now();

      try {
        const queryResponse = await fetch(`${API_URL}/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nlQuery: test.query,
            companyId: testCompany.id
          })
        });

        if (!queryResponse.ok) {
          const error = await queryResponse.json();
          throw new Error(error.error || queryResponse.statusText);
        }

        const result = await queryResponse.json();
        const duration = Date.now() - startTime;

        // Validate response structure
        if (!result.sql || !result.data || !result.metadata) {
          throw new Error('Invalid response structure');
        }

        console.log(`\n✅ SUCCESS (${duration}ms)`);
        console.log(`\nSQL Generated:\n${result.sql.substring(0, 150)}${result.sql.length > 150 ? '...' : ''}`);
        console.log(`\nResults: ${result.data.length} rows`);
        console.log(`Visualization: ${result.visualization.type}`);
        console.log(`Provider: ${result.metadata.provider}`);
        console.log(`Cached: ${result.metadata.cached}`);
        console.log(`Complexity: ${result.metadata.complexity || 'N/A'}`);
        console.log(`Security Level: ${result.metadata.validation?.securityLevel || 'N/A'}`);

        if (result.metadata.agentTimings) {
          console.log(`\nAgent Timings:`);
          console.log(`  - User Proxy: ${result.metadata.agentTimings.userProxy}ms`);
          console.log(`  - AI Engineer: ${result.metadata.agentTimings.aiEngineer}ms`);
          console.log(`  - Solution Architect: ${result.metadata.agentTimings.solutionArchitect}ms`);
          console.log(`  - QA Engineer: ${result.metadata.agentTimings.qaEngineer}ms`);
          console.log(`  - Fullstack Dev: ${result.metadata.agentTimings.fullstackDev}ms`);
          console.log(`  - TOTAL: ${result.metadata.agentTimings.total}ms`);
        }

        if (result.metadata.validation?.warnings && result.metadata.validation.warnings.length > 0) {
          console.log(`\n⚠️  Warnings: ${result.metadata.validation.warnings.join(', ')}`);
        }

        passed++;
      } catch (error) {
        console.log(`\n❌ FAILED: ${error.message}`);
        failed++;
      }
    }

    // Step 4: Summary
    console.log('\n' + '='.repeat(80));
    console.log(`\n📈 Test Summary:`);
    console.log(`   Total Tests: ${testQueries.length}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   Success Rate: ${((passed / testQueries.length) * 100).toFixed(1)}%`);
    console.log('\n' + '='.repeat(80));

    if (failed === 0) {
      console.log('\n🎉 All tests passed! Multi-Agent SQL System is working correctly.\n');
    } else {
      console.log('\n⚠️  Some tests failed. Review errors above.\n');
    }

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
