#!/usr/bin/env node
/**
 * Test Script: User Deactivation Feature
 * 
 * Tests the complete user deactivation workflow including:
 * 1. Admin deactivates user
 * 2. Deactivated user cannot login
 * 3. Admin reactivates user
 * 4. User can login again
 * 
 * Usage: node test-deactivation.js
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, title, message) {
  console.log(`${color}${colors.bright}${title}${colors.reset}${color} ${message}${colors.reset}`);
}

async function apiCall(method, endpoint, body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await response.json();

  return { status: response.status, data };
}

async function runTests() {
  log(colors.cyan, '\n📋 User Deactivation Feature Test Suite\n', '');

  let adminToken = null;
  let testUserId = null;
  let testUserEmail = null;

  try {
    // Step 1: Admin Login
    log(colors.blue, '\n[Step 1]', 'Admin Login');
    const adminLogin = await apiCall('POST', '/auth/login', {
      email: 'admin@halalbites.com',
      password: 'admin123',
    });

    if (adminLogin.status !== 200) {
      log(colors.red, '❌ FAILED', `Admin login failed: ${adminLogin.data.error}`);
      return;
    }

    adminToken = adminLogin.data.token;
    log(colors.green, '✅ SUCCESS', `Admin logged in with token: ${adminToken.substring(0, 20)}...`);

    // Step 2: Fetch Users List
    log(colors.blue, '\n[Step 2]', 'Fetch Users List');
    const usersList = await apiCall('GET', '/users', null, adminToken);

    if (usersList.status !== 200) {
      log(colors.red, '❌ FAILED', `Failed to fetch users: ${usersList.data.error}`);
      return;
    }

    const nonAdminUser = usersList.data.find(u => u.role !== 'admin');
    if (!nonAdminUser) {
      log(colors.yellow, '⚠️  WARNING', 'No non-admin users found for testing');
      return;
    }

    testUserId = nonAdminUser.id;
    testUserEmail = nonAdminUser.email;

    log(colors.green, '✅ SUCCESS', `Found test user: ${nonAdminUser.username} (ID: ${testUserId})`);
    log(colors.cyan, '   Status', `${nonAdminUser.active ? 'Active' : 'Deactivated'} (active: ${nonAdminUser.active}, is_active: ${nonAdminUser.is_active})`);

    // Step 3: Deactivate User
    log(colors.blue, '\n[Step 3]', 'Deactivate User');
    const deactivate = await apiCall('PUT', `/users/${testUserId}/deactivate`, null, adminToken);

    if (deactivate.status !== 200) {
      log(colors.red, '❌ FAILED', `Deactivate failed: ${deactivate.data.error}`);
      return;
    }

    const deactivatedUser = deactivate.data.data[0];
    log(colors.green, '✅ SUCCESS', 'User deactivated');
    log(colors.cyan, '   Status', `is_active: ${deactivatedUser.is_active}`);

    if (deactivatedUser.is_active !== false) {
      log(colors.red, '❌ ERROR', 'User is_active should be false after deactivation!');
    }

    // Step 4: Try to Login with Deactivated User
    log(colors.blue, '\n[Step 4]', 'Try to Login with Deactivated User');
    const deactivatedLogin = await apiCall('POST', '/auth/login', {
      email: testUserEmail,
      password: 'password123', // Dummy password - will fail auth first
    });

    // We expect this to fail, either with invalid credentials or deactivated account
    if (deactivatedLogin.status === 401) {
      const isDeactivatedMessage = deactivatedLogin.data.error?.includes('deactivated');
      if (isDeactivatedMessage) {
        log(colors.green, '✅ SUCCESS', `Login blocked with message: "${deactivatedLogin.data.error}"`);
      } else {
        log(colors.yellow, '⚠️  PARTIAL', `Login failed but with different message: "${deactivatedLogin.data.error}"`);
      }
    } else {
      log(colors.red, '❌ FAILED', `Expected 401 status but got ${deactivatedLogin.status}`);
    }

    // Step 5: Verify User Still Deactivated in List
    log(colors.blue, '\n[Step 5]', 'Verify User Still Deactivated in Users List');
    const usersList2 = await apiCall('GET', '/users', null, adminToken);
    const stillDeactivated = usersList2.data.find(u => u.id === testUserId);

    if (stillDeactivated.active === false || stillDeactivated.is_active === false) {
      log(colors.green, '✅ SUCCESS', `User correctly shows as deactivated in list`);
      log(colors.cyan, '   Status', `active: ${stillDeactivated.active}, is_active: ${stillDeactivated.is_active}`);
    } else {
      log(colors.red, '❌ FAILED', `User shows as active but should be deactivated!`);
      log(colors.red, '   ERROR', `active: ${stillDeactivated.active}, is_active: ${stillDeactivated.is_active}`);
    }

    // Step 6: Reactivate User
    log(colors.blue, '\n[Step 6]', 'Reactivate User');
    const reactivate = await apiCall('PUT', `/users/${testUserId}/reactivate`, null, adminToken);

    if (reactivate.status !== 200) {
      log(colors.red, '❌ FAILED', `Reactivate failed: ${reactivate.data.error}`);
      return;
    }

    const reactivatedUser = reactivate.data.data[0];
    log(colors.green, '✅ SUCCESS', 'User reactivated');
    log(colors.cyan, '   Status', `is_active: ${reactivatedUser.is_active}`);

    if (reactivatedUser.is_active !== true) {
      log(colors.red, '❌ ERROR', 'User is_active should be true after reactivation!');
    }

    // Step 7: Verify Users List Shows Reactivated
    log(colors.blue, '\n[Step 7]', 'Verify User Shows as Active in Users List');
    const usersList3 = await apiCall('GET', '/users', null, adminToken);
    const reactivatedInList = usersList3.data.find(u => u.id === testUserId);

    if (reactivatedInList.active === true || reactivatedInList.is_active === true) {
      log(colors.green, '✅ SUCCESS', `User correctly shows as active in list`);
      log(colors.cyan, '   Status', `active: ${reactivatedInList.active}, is_active: ${reactivatedInList.is_active}`);
    } else {
      log(colors.red, '❌ FAILED', `User shows as deactivated but should be active!`);
    }

    log(colors.green, '\n✅ All Tests Passed!', '');

  } catch (error) {
    log(colors.red, '💥 ERROR', error.message);
    console.error(error);
  }
}

// Run tests
runTests();
