import { test as base, Page } from '@playwright/test';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  email: string;
  password: string;
  name: string;
}

export const test = base.extend<{
  authenticatedPage: Page;
  adminPage: Page;
}>({
  authenticatedPage: async ({ page, context }, use) => {
    const testUser: AuthUser = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      name: 'Test User'
    };

    console.log('Starting authentication flow for test user:', testUser.email);

    // Generate JWT token first for localStorage setup
    const token = jwt.sign(
      { 
        sub: '1', 
        email: testUser.email, 
        role: 'trainer', // Changed from 'user' to 'trainer' to show create button
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days expiration
      }, 
      'fallback-secret-change-in-production', // Same secret as backend
      { algorithm: 'HS256' }
    );

    const userData = JSON.stringify({
      id: 1,
      email: testUser.email,
      name: testUser.name,
      role: 'trainer', // Changed from 'user' to 'trainer' to show create button
      first_name: testUser.name,
      last_name: '',
      is_verified: true,
      phone_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Navigate to the domain first to set localStorage
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Set localStorage using evaluate
    await page.evaluate(([tokenValue, userValue]) => {
      localStorage.setItem('auth_token', tokenValue);
      localStorage.setItem('auth_user', userValue);
    }, [token, userData]);

    // Set Authorization header for API requests
    await context.setExtraHTTPHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Mock the /auth/me endpoint to return our test user data
    await page.route('**/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 1,
            email: testUser.email,
            name: testUser.name,
            role: 'trainer', // Changed from 'user' to 'trainer' to show create button
            first_name: testUser.name,
            last_name: '',
            is_verified: true,
            phone_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        })
      });
    });

    console.log('JWT authentication setup complete with localStorage and API mocking');

    await use(page);
  },

  adminPage: async ({ page, context }, use) => {
    const adminUser: AuthUser = {
      email: 'admin@example.com',
      password: 'AdminPassword123!',
      name: 'Admin User'
    };

    // Generate JWT token for localStorage setup
    const token = jwt.sign(
      { 
        sub: '1', 
        email: adminUser.email, 
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days expiration
      }, 
      'fallback-secret-change-in-production', // Same secret as backend
      { algorithm: 'HS256' }
    );

    const userData = JSON.stringify({
      id: 1,
      email: adminUser.email,
      name: adminUser.name,
      role: 'admin',
      first_name: adminUser.name,
      last_name: '',
      is_verified: true,
      phone_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Navigate to the domain first to set localStorage
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Set localStorage using evaluate
    await page.evaluate(([tokenValue, userValue]) => {
      localStorage.setItem('auth_token', tokenValue);
      localStorage.setItem('auth_user', userValue);
    }, [token, userData]);

    // Set Authorization header for API requests
    await context.setExtraHTTPHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Mock the /auth/me endpoint to return our admin user data
    await page.route('**/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 1,
            email: adminUser.email,
            name: adminUser.name,
            role: 'admin',
            first_name: adminUser.name,
            last_name: '',
            is_verified: true,
            phone_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        })
      });
    });

    console.log('Admin JWT authentication setup complete with localStorage and API mocking');

    await use(page);
  }
});

export { expect } from '@playwright/test';
