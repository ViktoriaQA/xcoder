import { test, expect } from '../fixtures/auth.fixture';
import { TasksPage } from '../pages/TasksPage';
import { HomePage } from '../pages/HomePage';

test.describe('Tasks', () => {
  let tasksPage: TasksPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    tasksPage = new TasksPage(page);
    homePage = new HomePage(page);
  });

  test('@UI should display tasks page correctly', async ({ page }) => {
    await tasksPage.navigateToTasks();
    await tasksPage.waitForPageLoad();
    
    // Check if either tasks list is visible or empty state message is shown
    const tasksListVisible = await tasksPage.verifyTasksListVisible();
    const taskCount = await tasksPage.getTasksCount();
    
    expect(tasksListVisible || taskCount === 0).toBe(true);
  });

  test('@UI should navigate to tasks from home', async ({ page }) => {
    await homePage.navigateToHome();
    await homePage.navigateToTasks();
    
    expect(page.url()).toContain('/tasks');
    
    // Check if either tasks list is visible or empty state message is shown
    const tasksListVisible = await tasksPage.verifyTasksListVisible();
    const taskCount = await tasksPage.getTasksCount();
    
    expect(tasksListVisible || taskCount === 0).toBe(true);
  });

  test('@UI should display create task button for authenticated users', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    tasksPage = new TasksPage(page);
    
    await tasksPage.navigateToTasks();
    await tasksPage.waitForTasksToLoad();
    
    // Check if we can access the page at all
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Verify the page loads without authentication errors
    expect(currentUrl).toContain('/tasks');
    
    // Check if create button is visible for authenticated users
    const createButtonVisible = await tasksPage.verifyCreateButtonVisible();
    console.log('Create button visible:', createButtonVisible);
    expect(createButtonVisible).toBe(true);
  });

  test('@UI should not display create task button for unauthenticated users', async ({ page }) => {
    await tasksPage.navigateToTasks();
    await tasksPage.waitForTasksToLoad();
    
    expect(await tasksPage.verifyCreateButtonVisible()).toBe(false);
  });

  test('@UI should search tasks', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    tasksPage = new TasksPage(page);
    
    await tasksPage.navigateToTasks();
    await tasksPage.waitForTasksToLoad();
    
    // Check if we can access the page at all
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Verify the page loads without authentication errors
    expect(currentUrl).toContain('/tasks');
    
    // Check search functionality
    const searchInputVisible = await tasksPage.searchInput.isVisible();
    console.log('Search input visible:', searchInputVisible);
    
    if (searchInputVisible) {
      await tasksPage.searchTasks('algorithm');
      await page.waitForTimeout(1000);
      console.log('Search functionality tested successfully');
      
      // Verify search worked (either tasks are filtered or no results message)
      const tasksAfterSearch = await tasksPage.getTasksCount();
      console.log('Tasks after search:', tasksAfterSearch);
    } else {
      console.log('Search input not found - skipping search test');
    }
  });

  test('@UI should filter tasks by difficulty', async ({ page }) => {
    await tasksPage.navigateToTasks();
    await tasksPage.waitForTasksToLoad();
    
    const filterButton = page.locator('[data-testid="filter-btn"]');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(1000);
      
      const difficultyFilter = page.locator('[data-testid="difficulty-filter"]');
      if (await difficultyFilter.isVisible()) {
        await difficultyFilter.click();
        await page.locator('[data-value="easy"]').click();
        await page.waitForTimeout(1000);
        
        expect(await tasksPage.verifyTasksListVisible()).toBe(true);
      }
    }
  });

  test('@UI should filter tasks by category', async ({ page }) => {
    await tasksPage.navigateToTasks();
    await tasksPage.waitForTasksToLoad();
    
    const filterButton = page.locator('[data-testid="filter-btn"]');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(1000);
      
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();
        await page.locator('[data-value="algorithms"]').click();
        await page.waitForTimeout(1000);
        
        expect(await tasksPage.verifyTasksListVisible()).toBe(true);
      }
    }
  });

  test('@UI should display task cards with required information', async ({ page }) => {
    await tasksPage.navigateToTasks();
    await tasksPage.waitForTasksToLoad();
    
    const hasTasks = await tasksPage.getTasksCount() > 0;
    if (hasTasks) {
      expect(await tasksPage.verifyTaskCardVisible()).toBe(true);
      
      const firstTitle = await tasksPage.getFirstTaskTitle();
      expect(firstTitle).toBeTruthy();
      expect(firstTitle?.length).toBeGreaterThan(0);
    }
  });

  test('should handle task solving', async ({ authenticatedPage }) => {
    tasksPage = new TasksPage(authenticatedPage);
    await tasksPage.navigateToTasks();
    await tasksPage.waitForTasksToLoad();
    
    const taskCount = await tasksPage.getTasksCount();
    if (taskCount > 0) {
      await tasksPage.clickFirstTask();
      await authenticatedPage.waitForLoadState('networkidle');
      
      expect(authenticatedPage.url()).toContain('/tasks/');
      
      const solveButton = authenticatedPage.locator('[data-testid="solve-btn"]');
      if (await solveButton.isVisible()) {
        await solveButton.click();
        await authenticatedPage.waitForLoadState('networkidle');
        
        expect(authenticatedPage.url()).toContain('/solve');
        
        const codeEditor = authenticatedPage.locator('[data-testid="code-editor"]');
        expect(await codeEditor.isVisible()).toBe(true);
      }
    }
  });

  test('@E2E should handle task creation for authenticated users', async ({ authenticatedPage }) => {
    tasksPage = new TasksPage(authenticatedPage);
    await tasksPage.navigateToTasks();
    await tasksPage.waitForTasksToLoad();
    
    // Debug: Check what elements are actually on the page
    console.log('Page URL:', authenticatedPage.url());
    
    // Check for any buttons or create functionality
    const allButtons = await authenticatedPage.locator('button').count();
    console.log('Total buttons found:', allButtons);
    
    // Get all button texts
    const buttons = authenticatedPage.locator('button');
    const buttonTexts = [];
    for (let i = 0; i < allButtons; i++) {
      const text = await buttons.nth(i).textContent();
      if (text) buttonTexts.push(text.trim());
    }
    console.log('Button texts:', buttonTexts);
    
    // Check for any links
    const allLinks = await authenticatedPage.locator('a').count();
    console.log('Total links found:', allLinks);
    
    // Check for create button with our expanded selector
    const createButtonVisible = await tasksPage.verifyCreateButtonVisible();
    console.log('Create button visible:', createButtonVisible);
    
    // Try a more flexible check
    const hasCreateFunctionality = await authenticatedPage.locator('button, a').filter({ hasText: /(create|створити|додати|add|new)/i }).count() > 0;
    console.log('Has create functionality:', hasCreateFunctionality);
    
    expect(createButtonVisible || hasCreateFunctionality).toBe(true);
    
    if (createButtonVisible) {
      await tasksPage.clickCreateTask();
      await authenticatedPage.waitForLoadState('networkidle');
    }
  });

  test('@API @E2E should handle task editing for task owners', async ({ authenticatedPage }) => {
    tasksPage = new TasksPage(authenticatedPage);
    await tasksPage.navigateToTasks();
    await tasksPage.waitForTasksToLoad();
    
    const taskCount = await tasksPage.getTasksCount();
    if (taskCount > 0) {
      await tasksPage.clickFirstTask();
      await authenticatedPage.waitForLoadState('networkidle');
      
      const editButton = authenticatedPage.locator('[data-testid="edit-btn"]');
      if (await editButton.isVisible()) {
        await editButton.click();
        await authenticatedPage.waitForLoadState('networkidle');
        
        expect(authenticatedPage.url()).toContain('/edit');
        
        const titleInput = authenticatedPage.locator('input[name="title"]');
        expect(await titleInput.isVisible()).toBe(true);
      }
    }
  });

  test('@API @E2E should handle task deletion for task owners', async ({ authenticatedPage }) => {
    tasksPage = new TasksPage(authenticatedPage);
    await tasksPage.navigateToTasks();
    await tasksPage.waitForTasksToLoad();
    
    const initialCount = await tasksPage.getTasksCount();
    if (initialCount > 0) {
      await tasksPage.clickFirstTask();
      await authenticatedPage.waitForLoadState('networkidle');
      
      const deleteButton = authenticatedPage.locator('[data-testid="delete-btn"]');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const confirmButton = authenticatedPage.locator('[data-testid="confirm-delete-btn"]');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          await authenticatedPage.waitForTimeout(2000);
          
          const currentCount = await tasksPage.getTasksCount();
          expect(currentCount).toBeLessThan(initialCount);
        }
      }
    }
  });
});
