#!/usr/bin/env node

/**
 * Simple E2E Test for TutorsPool
 * Tests key functionality without complex dependencies
 */

const https = require('https');

async function testEndpoint(url, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TutorsPool-Test/1.0'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 200) // Limit data for logging
        });
      });
    });

    req.on('error', (error) => {
      resolve({ error: error.message });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Simple E2E Tests...');
  
  const baseUrl = 'https://tutors-pool.vercel.app';
  const tests = [
    { name: 'Health Check', url: `${baseUrl}/api/health`, expected: 200 },
    { name: 'Home Page', url: `${baseUrl}/`, expected: 200 },
    { name: 'Login Page', url: `${baseUrl}/login`, expected: 200 },
    { name: 'Search Page', url: `${baseUrl}/search`, expected: 200 },
    { name: 'Tutors API', url: `${baseUrl}/api/tutors`, expected: 200 },
    { name: 'Subjects API', url: `${baseUrl}/api/subjects`, expected: 200 },
    { name: 'Search Tutors', url: `${baseUrl}/api/tutors?q=math`, expected: 200 },
    { name: 'Admin Login', url: `${baseUrl}/api/auth/login`, method: 'POST', body: { email: 'admin@example.com', password: 'admin' }, expected: 200 },
    { name: 'Tutor Login', url: `${baseUrl}/api/auth/login`, method: 'POST', body: { email: 'tutor@example.com', password: 'tutor' }, expected: 200 },
    { name: 'Student Login', url: `${baseUrl}/api/auth/login`, method: 'POST', body: { email: 'student@example.com', password: 'student' }, expected: 200 },
    { name: '404 Test', url: `${baseUrl}/api/nonexistent`, expected: 404 }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await testEndpoint(test.url, test.method, test.body);
      
      if (result.error) {
        console.log(`❌ ${test.name}: Error - ${result.error}`);
        failed++;
      } else if (result.statusCode === test.expected) {
        console.log(`✅ ${test.name}: ${result.statusCode}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: Expected ${test.expected}, got ${result.statusCode}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Exception - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('💥 Some tests failed.');
    process.exit(1);
  }
}

runTests().catch(console.error);
