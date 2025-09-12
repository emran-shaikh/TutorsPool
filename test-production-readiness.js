/**
 * TutorsPool Production Readiness Test Suite
 * Comprehensive testing of all major features and functionality
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5174';
const FRONTEND_URL = 'http://localhost:8080';

// Test data
const testUsers = {
  student: {
    name: 'Test Student',
    email: 'teststudent@example.com',
    password: 'password123',
    role: 'STUDENT'
  },
  tutor: {
    name: 'Test Tutor',
    email: 'testtutor@example.com',
    password: 'password123',
    role: 'TUTOR'
  },
  admin: {
    name: 'Test Admin',
    email: 'testadmin@example.com',
    password: 'password123',
    role: 'ADMIN'
  }
};

let authTokens = {};

// Utility functions
const makeRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
};

// Test suite
class ProductionTestSuite {
  constructor() {
    this.tests = [];
    this.results = { passed: 0, failed: 0, total: 0 };
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async runTests() {
    console.log('🚀 Starting TutorsPool Production Readiness Tests\n');
    console.log('='.repeat(60));

    for (const test of this.tests) {
      try {
        console.log(`\n🧪 Testing: ${test.name}`);
        const result = await test.testFn();
        
        if (result.success) {
          console.log(`✅ PASSED: ${test.name}`);
          this.results.passed++;
        } else {
          console.log(`❌ FAILED: ${test.name}`);
          console.log(`   Error: ${result.error}`);
          this.results.failed++;
        }
      } catch (error) {
        console.log(`❌ FAILED: ${test.name} (Exception)`);
        console.log(`   Error: ${error.message}`);
        this.results.failed++;
      }
      this.results.total++;
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Application is production ready!');
    } else {
      console.log(`\n⚠️  ${this.results.failed} tests failed. Please review and fix issues.`);
    }
  }
}

// Initialize test suite
const testSuite = new ProductionTestSuite();

// Authentication Tests
testSuite.addTest('User Registration - Student', async () => {
  const response = await makeRequest('POST', '/api/auth/register', testUsers.student);
  return response;
});

testSuite.addTest('User Registration - Tutor', async () => {
  const response = await makeRequest('POST', '/api/auth/register', testUsers.tutor);
  return response;
});

testSuite.addTest('User Login - Student', async () => {
  const response = await makeRequest('POST', '/api/auth/login', {
    email: testUsers.student.email,
    password: testUsers.student.password
  });
  
  if (response.success && response.data.token) {
    authTokens.student = response.data.token;
  }
  return response;
});

testSuite.addTest('User Login - Tutor', async () => {
  const response = await makeRequest('POST', '/api/auth/login', {
    email: testUsers.tutor.email,
    password: testUsers.tutor.password
  });
  
  if (response.success && response.data.token) {
    authTokens.tutor = response.data.token;
  }
  return response;
});

// API Endpoint Tests
testSuite.addTest('Get Tutors List', async () => {
  const response = await makeRequest('GET', '/api/tutors');
  return response;
});

testSuite.addTest('Get Featured Tutors', async () => {
  const response = await makeRequest('GET', '/api/tutors?limit=4');
  return response;
});

testSuite.addTest('Get Subjects List', async () => {
  const response = await makeRequest('GET', '/api/subjects');
  return response;
});

testSuite.addTest('Search Tutors', async () => {
  const response = await makeRequest('GET', '/api/tutors/search?query=math');
  return response;
});

// Booking System Tests
testSuite.addTest('Create Booking (Student)', async () => {
  if (!authTokens.student) {
    return { success: false, error: 'No student token available' };
  }
  
  const bookingData = {
    tutorId: 'tutor-1',
    subjectId: 'mathematics',
    startAtUTC: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endAtUTC: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    priceCents: 5000,
    currency: 'USD'
  };
  
  const response = await makeRequest('POST', '/api/bookings', bookingData, authTokens.student);
  return response;
});

testSuite.addTest('Get Student Bookings', async () => {
  if (!authTokens.student) {
    return { success: false, error: 'No student token available' };
  }
  
  const response = await makeRequest('GET', '/api/students/bookings', null, authTokens.student);
  return response;
});

testSuite.addTest('Get Tutor Bookings', async () => {
  if (!authTokens.tutor) {
    return { success: false, error: 'No tutor token available' };
  }
  
  const response = await makeRequest('GET', '/api/tutors/bookings', null, authTokens.tutor);
  return response;
});

// Notification System Tests
testSuite.addTest('Get Notifications (Student)', async () => {
  if (!authTokens.student) {
    return { success: false, error: 'No student token available' };
  }
  
  const response = await makeRequest('GET', '/api/notifications', null, authTokens.student);
  return response;
});

testSuite.addTest('Get Notifications (Tutor)', async () => {
  if (!authTokens.tutor) {
    return { success: false, error: 'No tutor token available' };
  }
  
  const response = await makeRequest('GET', '/api/notifications', null, authTokens.tutor);
  return response;
});

// Chat System Tests
testSuite.addTest('Get Chat Conversations (Student)', async () => {
  if (!authTokens.student) {
    return { success: false, error: 'No student token available' };
  }
  
  const response = await makeRequest('GET', '/api/chat/conversations', null, authTokens.student);
  return response;
});

testSuite.addTest('Get Chat Messages', async () => {
  if (!authTokens.student) {
    return { success: false, error: 'No student token available' };
  }
  
  const response = await makeRequest('GET', '/api/chat/messages/user-1/user-2', null, authTokens.student);
  return response;
});

// Review System Tests
testSuite.addTest('Get Reviews', async () => {
  const response = await makeRequest('GET', '/api/reviews');
  return response;
});

testSuite.addTest('Get Tutor Reviews', async () => {
  const response = await makeRequest('GET', '/api/reviews/tutor/tutor-1');
  return response;
});

// Admin Tests (if admin token available)
testSuite.addTest('Get All Users (Admin)', async () => {
  // Try to login as admin first
  const loginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'kehusaruf@mailinator.com', // Known admin email
    password: 'password123'
  });
  
  if (loginResponse.success && loginResponse.data.token) {
    authTokens.admin = loginResponse.data.token;
    const response = await makeRequest('GET', '/api/admin/users', null, authTokens.admin);
    return response;
  }
  
  return { success: false, error: 'Could not authenticate as admin' };
});

testSuite.addTest('Get Admin Dashboard Data', async () => {
  if (!authTokens.admin) {
    return { success: false, error: 'No admin token available' };
  }
  
  const response = await makeRequest('GET', '/api/admin/dashboard', null, authTokens.admin);
  return response;
});

// Health Check Tests
testSuite.addTest('Server Health Check', async () => {
  const response = await makeRequest('GET', '/api/health');
  return response;
});

// Frontend Accessibility Tests
testSuite.addTest('Frontend Accessibility Check', async () => {
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    return { success: response.status === 200, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Performance Tests
testSuite.addTest('API Response Time Check', async () => {
  const startTime = Date.now();
  const response = await makeRequest('GET', '/api/tutors');
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  // Consider response time under 2 seconds as acceptable
  const isAcceptable = responseTime < 2000;
  
  return {
    success: response.success && isAcceptable,
    error: isAcceptable ? null : `Response time too slow: ${responseTime}ms`
  };
});

// Error Handling Tests
testSuite.addTest('Invalid Endpoint Handling', async () => {
  const response = await makeRequest('GET', '/api/invalid-endpoint');
  // Should return 404 or proper error response
  return { success: response.status === 404 || !response.success };
});

testSuite.addTest('Unauthorized Access Handling', async () => {
  const response = await makeRequest('GET', '/api/admin/users');
  // Should return 401 Unauthorized
  return { success: response.status === 401 };
});

// Run the test suite
async function runProductionTests() {
  try {
    await testSuite.runTests();
  } catch (error) {
    console.error('Test suite failed to run:', error);
  }
}

// Export for use
export { runProductionTests, testSuite };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runProductionTests();
}
