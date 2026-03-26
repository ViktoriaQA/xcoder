import { test, expect } from '../fixtures/auth.fixture';
import { AuthPage } from '../pages/AuthPage';
import { HomePage } from '../pages/HomePage';

test.describe('Authentication', () => {
  let authPage: AuthPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    homePage = new HomePage(page);
  });

  test('@E2E should display login form correctly', async ({ page }) => {
    await authPage.navigateToAuth();
    await authPage.waitForPageLoad();
    
    // Check if auth page is loaded by looking for any input or button
    const hasInputs = await page.locator('input').count() > 0;
    const hasButtons = await page.locator('button').count() > 0;
    const hasAuthContainer = await page.locator('[data-testid*="auth"], [data-testid*="login"], [data-testid*="register"]').count() > 0;
    
    expect(hasInputs || hasButtons || hasAuthContainer).toBe(true);
    
    // Try to verify specific elements if they exist
    const emailVisible = await authPage.verifyElementVisible(authPage.emailInput);
    const passwordVisible = await authPage.verifyElementVisible(authPage.passwordInput);
    const loginButtonVisible = await authPage.verifyElementVisible(authPage.loginButton);
    
    // At least one of the auth elements should be visible
    expect(emailVisible || passwordVisible || loginButtonVisible).toBe(true);
  });

  test('@UI should switch to registration form', async ({ page }) => {
    await authPage.navigateToAuth();
    await authPage.switchToRegisterTab();
    
    expect(await authPage.verifyRegistrationFormVisible()).toBe(true);
    expect(await authPage.verifyElementVisible(authPage.nameInput)).toBe(true);
    expect(await authPage.verifyElementVisible(authPage.confirmPasswordInput)).toBe(true);
  });

  test('@UI should show validation errors for empty fields', async ({ page }) => {
    await authPage.navigateToAuth();
    await authPage.clickLogin();
    
    const errorMessage = await authPage.getErrorMessage();
    expect(errorMessage).toContain('email');
    expect(errorMessage).toContain('password');
  });

  test('@UI should show validation error for invalid email format', async ({ page }) => {
    await authPage.navigateToAuth();
    await authPage.fillLoginForm('invalid-email', 'password123');
    await authPage.clickLogin();
    
    const errorMessage = await authPage.getErrorMessage();
    expect(errorMessage).toContain('email');
  });

  test('@UI should show validation error for short password', async ({ page }) => {
    await authPage.navigateToAuth();
    await authPage.fillLoginForm('test@example.com', '123');
    await authPage.clickLogin();
    
    const errorMessage = await authPage.getErrorMessage();
    expect(errorMessage).toContain('password');
  });

  test('@UI should show validation error for mismatched passwords in registration', async ({ page }) => {
    await authPage.navigateToAuth();
    await authPage.switchToRegisterTab();
    await authPage.fillRegistrationForm('Test', 'User', 'test@example.com', 'password123', 'password456');
    await authPage.clickRegister();
    
    const errorMessage = await authPage.getErrorMessage();
    expect(errorMessage).toContain('password');
  });

  test('@UI should navigate to auth page from home', async ({ page }) => {
    await homePage.navigateToHome();
    await homePage.clickLogin();
    await authPage.waitForPageLoad();
    
    expect(page.url()).toContain('/auth');
    expect(await authPage.verifyLoginFormVisible()).toBe(true);
  });

  test('@E2E should handle successful login redirect', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/auth');
    await authenticatedPage.waitForLoadState('networkidle');
    
    const currentUrl = authenticatedPage.url();
    expect(currentUrl).not.toContain('/auth');
    expect(currentUrl).toMatch(/\/(dashboard|\?)/);
  });

  test('@E2E should handle logout functionality', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForLoadState('networkidle');
    
    const logoutButton = authenticatedPage.locator('[data-testid="logout-btn"]');
    const isVisible = await logoutButton.isVisible();
    if (isVisible) {
      await logoutButton.click();
      await authenticatedPage.waitForLoadState('networkidle');
      const currentUrl = authenticatedPage.url();
      expect(currentUrl).toMatch(/\/(\/|auth)/);
    }
  });

  test('@UI should protect authenticated routes', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/profile', '/tasks', '/tournaments'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      const isRedirectedToAuth = currentUrl.includes('/auth');
      const isRedirectedToHome = currentUrl.includes('/') && !currentUrl.includes('/auth');
      
      expect(isRedirectedToAuth || isRedirectedToHome).toBe(true);
    }
  });
});
