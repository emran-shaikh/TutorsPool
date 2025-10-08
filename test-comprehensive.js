#!/usr/bin/env node

/**
 * Comprehensive End-to-End Testing Script for TutorsPool
 * Tests all major functionality and identifies issues
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'https://tutors-pool.vercel.app';
const LOCAL_URL = 'http://localhost:5173';

// Test configuration
const config = {
  baseUrl: BASE_URL,
  timeout: 10000,
  verbose: true
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  warnings: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      timeout: config.timeout,
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testEndpoint(endpoint, method = 'GET', body = null, expectedStatus = 200) {
  const url = `${config.baseUrl}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'TutorsPool-E2E-Test/1.0'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await makeRequest(url, options);
    
    if (response.statusCode === expectedStatus) {
      testResults.passed++;
      log(`✅ ${method} ${endpoint} - Status: ${response.statusCode}`);
      return { success: true, response };
    } else {
      testResults.failed++;
      const error = `${method} ${endpoint} - Expected ${expectedStatus}, got ${response.statusCode}`;
      testResults.errors.push(error);
      log(error, 'error');
      return { success: false, response };
    }
  } catch (error) {
    testResults.failed++;
    const errorMsg = `${method} ${endpoint} - Error: ${error.message}`;
    testResults.errors.push(errorMsg);
    log(errorMsg, 'error');
    return { success: false, error };
  }
}

// Test suites
async function testHealthChecks() {
  log('🏥 Testing Health Checks...');
  
  await testEndpoint('/api/health');
  await testEndpoint('/');
  await testEndpoint('/favicon.ico', 'GET', null, 200);
}

async function testAuthentication() {
  log('🔐 Testing Authentication...');
  
  // Test login endpoints
  await testEndpoint('/api/auth/login', 'POST', {
    email: 'admin@example.com',
    password: 'admin'
  });
  
  await testEndpoint('/api/auth/login', 'POST', {
    email: 'tutor@example.com',
    password: 'tutor'
  });
  
  await testEndpoint('/api/auth/login', 'POST', {
    email: 'student@example.com',
    password: 'student'
  });
  
  // Test auth/me endpoint
  await testEndpoint('/api/auth/me', 'GET', null, 401); // Should fail without token
}

async function testPublicPages() {
  log('📄 Testing Public Pages...');
  
  const publicPages = [
    '/',
    '/login',
    '/signup',
    '/search',
    '/about',
    '/contact',
    '/subjects'
  ];
  
  for (const page of publicPages) {
    await testEndpoint(page);
  }
}

async function testAPIEndpoints() {
  log('🔌 Testing API Endpoints...');
  
  // Test tutors endpoint
  await testEndpoint('/api/tutors');
  await testEndpoint('/api/tutors?q=math&page=1&limit=10');
  await testEndpoint('/api/tutors?priceMin=50&priceMax=100');
  
  // Test subjects endpoint
  await testEndpoint('/api/subjects');
  
  // Test students endpoints
  await testEndpoint('/api/students');
  await testEndpoint('/api/students/profile', 'GET', null, 401); // Should fail without auth
  
  // Test bookings endpoint
  await testEndpoint('/api/bookings');
  
  // Test notifications
  await testEndpoint('/api/notifications', 'GET', null, 401); // Should fail without auth
  
  // Test tutor-specific endpoints
  await testEndpoint('/api/tutors/profile', 'GET', null, 401); // Should fail without auth
  await testEndpoint('/api/tutors/stats', 'GET', null, 401); // Should fail without auth
  await testEndpoint('/api/tutors/bookings', 'GET', null, 401); // Should fail without auth
  
  // Test admin endpoints
  await testEndpoint('/api/admin/dashboard', 'GET', null, 401); // Should fail without auth
}

async function testErrorHandling() {
  log('🚨 Testing Error Handling...');
  
  // Test non-existent endpoints
  await testEndpoint('/api/nonexistent', 'GET', null, 404);
  await testEndpoint('/api/tutors/999999', 'GET', null, 404);
  
  // Test invalid data
  await testEndpoint('/api/auth/login', 'POST', { invalid: 'data' });
  await testEndpoint('/api/tutors', 'POST', { invalid: 'tutor' });
}

async function testCachingHeaders() {
  log('🗄️ Testing Cache Headers...');
  
  const response = await testEndpoint('/api/tutors');
  if (response.success) {
    const cacheControl = response.response.headers['cache-control'];
    if (cacheControl && cacheControl.includes('no-cache')) {
      log('✅ Cache headers properly set', 'success');
    } else {
      testResults.warnings.push('Cache headers not properly set');
      log('⚠️ Cache headers not properly set', 'warning');
    }
  }
}

async function testCORSHeaders() {
  log('🌐 Testing CORS Headers...');
  
  const response = await testEndpoint('/api/tutors');
  if (response.success) {
    const corsOrigin = response.response.headers['access-control-allow-origin'];
    if (corsOrigin === '*') {
      log('✅ CORS headers properly set', 'success');
    } else {
      testResults.warnings.push('CORS headers not properly configured');
      log('⚠️ CORS headers not properly configured', 'warning');
    }
  }
}

async function testSearchFunctionality() {
  log('🔍 Testing Search Functionality...');
  
  const searchTests = [
    { q: 'math', expectedMinResults: 1 },
    { q: 'physics', expectedMinResults: 1 },
    { q: 'nonexistent', expectedMinResults: 0 },
    { q: '', expectedMinResults: 5 }
  ];
  
  for (const test of searchTests) {
    const response = await testEndpoint(`/api/tutors?q=${encodeURIComponent(test.q)}`);
    if (response.success) {
      try {
        const data = JSON.parse(response.response.data);
        if (data.items && data.items.length >= test.expectedMinResults) {
          log(`✅ Search for "${test.q}" returned ${data.items.length} results`);
        } else {
          testResults.warnings.push(`Search for "${test.q}" returned fewer results than expected`);
          log(`⚠️ Search for "${test.q}" returned ${data.items.length} results (expected min ${test.expectedMinResults})`, 'warning');
        }
      } catch (e) {
        testResults.errors.push(`Invalid JSON response for search "${test.q}"`);
        log(`❌ Invalid JSON response for search "${test.q}"`, 'error');
      }
    }
  }
}

async function testPagination() {
  log('📄 Testing Pagination...');
  
  const paginationTests = [
    { page: 1, limit: 5 },
    { page: 2, limit: 10 },
    { page: 1, limit: 20 }
  ];
  
  for (const test of paginationTests) {
    const response = await testEndpoint(`/api/tutors?page=${test.page}&limit=${test.limit}`);
    if (response.success) {
      try {
        const data = JSON.parse(response.response.data);
        if (data.page === test.page && data.limit === test.limit) {
          log(`✅ Pagination page=${test.page}, limit=${test.limit} working correctly`);
        } else {
          testResults.warnings.push(`Pagination not working correctly for page=${test.page}, limit=${test.limit}`);
        }
      } catch (e) {
        testResults.errors.push(`Invalid pagination response for page=${test.page}, limit=${test.limit}`);
      }
    }
  }
}

async function runAllTests() {
  log('🚀 Starting Comprehensive End-to-End Testing...', 'info');
  log(`Testing against: ${config.baseUrl}`, 'info');
  
  const startTime = Date.now();
  
  try {
    await testHealthChecks();
    await testPublicPages();
    await testAPIEndpoints();
    await testAuthentication();
    await testSearchFunctionality();
    await testPagination();
    await testErrorHandling();
    await testCachingHeaders();
    await testCORSHeaders();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Print summary
    log('\n📊 TEST SUMMARY', 'info');
    log('='.repeat(50), 'info');
    log(`✅ Passed: ${testResults.passed}`, 'success');
    log(`❌ Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
    log(`⚠️ Warnings: ${testResults.warnings.length}`, testResults.warnings.length > 0 ? 'warning' : 'success');
    log(`⏱️ Duration: ${duration}ms`, 'info');
    
    if (testResults.errors.length > 0) {
      log('\n❌ ERRORS:', 'error');
      testResults.errors.forEach(error => log(`  - ${error}`, 'error'));
    }
    
    if (testResults.warnings.length > 0) {
      log('\n⚠️ WARNINGS:', 'warning');
      testResults.warnings.forEach(warning => log(`  - ${warning}`, 'warning'));
    }
    
    if (testResults.failed === 0) {
      log('\n🎉 All tests passed! Application is working correctly.', 'success');
      process.exit(0);
    } else {
      log('\n💥 Some tests failed. Please review and fix the issues above.', 'error');
      process.exit(1);
    }
    
  } catch (error) {
    log(`💥 Test suite failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, testEndpoint };
