#!/usr/bin/env node
/**
 * Integration test script for Channel Directory
 * Tests the full flow: seed data -> API calls -> verify responses
 */

// No import needed – Node 18+ provides global fetch

const BASE_URL = 'http://localhost:5000';
const WORKSPACE_SLUG = 'default-workspace-id';

// Token từ seed script (member@example.com)
const MEMBER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMGViMDY4ZGQ2Nzc3MzdlZWVmZmViZCIsImVtYWlsIjoibWVtYmVyQGV4YW1wbGUuY29tIiwibmFtZSI6IkNhcm9sIE1lbWJlciIsInJvbGUiOiJtZW1iZXIiLCJpYXQiOjE3NzkzNDc1NjAsImV4cCI6MTc3OTk1MjM2MH0.DPu_DK5H-1iEltCPRmHNlm03qFDz3YnqqA-aoDEZgFs';

async function testAPI(name: string, url: string, token: string) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success`);
      console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 500));
      return { success: true, data };
    } else {
      const error = await response.text();
      console.log(`   ❌ Failed`);
      console.log(`   Error:`, error);
      return { success: false, error };
    }
  } catch (err) {
    console.log(`   ❌ Network Error:`, err);
    return { success: false, error: err };
  }
}

async function run() {
  console.log('🚀 Starting Integration Tests\n');
  console.log('Prerequisites:');
  console.log('  1. Backend running on http://localhost:5000');
  console.log('  2. Run `npm run seed:all` first to create test data');
  console.log('  3. Token must be valid (check expiry)\n');

  const tests = [
    {
      name: 'Get Channel Directory (by slug)',
      url: `${BASE_URL}/api/v1/workspaces/${WORKSPACE_SLUG}/channels?page=1&limit=20&sort=activity`,
      token: MEMBER_TOKEN,
    },
    {
      name: 'Get Channel Directory (sort by name)',
      url: `${BASE_URL}/api/v1/workspaces/${WORKSPACE_SLUG}/channels?page=1&limit=20&sort=name`,
      token: MEMBER_TOKEN,
    },
    {
      name: 'Get Channel Directory (filter public)',
      url: `${BASE_URL}/api/v1/workspaces/${WORKSPACE_SLUG}/channels?page=1&limit=20&type=public`,
      token: MEMBER_TOKEN,
    },
    {
      name: 'Get Channel Directory (search)',
      url: `${BASE_URL}/api/v1/workspaces/${WORKSPACE_SLUG}/channels?page=1&limit=20&search=engineering`,
      token: MEMBER_TOKEN,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testAPI(test.name, test.url, test.token);
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Check:');
    console.log('  - Is backend running?');
    console.log('  - Did you run seed:all?');
    console.log('  - Is the token expired?');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

run();
