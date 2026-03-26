import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class TasksPage extends BasePage {
  readonly tasksList: Locator;
  readonly createTaskButton: Locator;
  readonly taskCard: Locator;
  readonly filterButton: Locator;
  readonly searchInput: Locator;
  readonly difficultyFilter: Locator;
  readonly categoryFilter: Locator;
  readonly solveButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly taskTitle: Locator;
  readonly taskDescription: Locator;
  readonly taskDifficulty: Locator;

  constructor(page: Page) {
    super(page);
    this.tasksList = page.locator('[data-testid="tasks-list"], .tasks-list, .task-list');
    this.createTaskButton = page.locator('[data-testid="create-task-btn"], button:has-text("Create Task"), button:has-text("Створити"), button:has-text("Додати"), button:has-text("Add"), button:has-text("+"), a[href*="create"], .create-btn, .add-btn, [data-testid*="create"]');
    this.taskCard = page.locator('[data-testid="task-card"], .task-card, .task');
    this.filterButton = page.locator('[data-testid="filter-btn"], button:has-text("Filter"), button:has-text("Фільтр")');
    this.searchInput = page.locator('input[placeholder*="Пошук"], input[placeholder*="Search"], input[type="search"]');
    this.difficultyFilter = page.locator('[data-testid="difficulty-filter"]');
    this.categoryFilter = page.locator('[data-testid="category-filter"]');
    this.solveButton = page.locator('[data-testid="solve-btn"], button:has-text("Solve"), button:has-text("Вирішити")');
    this.editButton = page.locator('[data-testid="edit-btn"], button:has-text("Edit"), button:has-text("Редагувати")');
    this.deleteButton = page.locator('[data-testid="delete-btn"], button:has-text("Delete"), button:has-text("Видалити")');
    this.taskTitle = page.locator('[data-testid="task-title"], .task-title, h3, h4');
    this.taskDescription = page.locator('[data-testid="task-description"], .task-description, p');
    this.taskDifficulty = page.locator('[data-testid="task-difficulty"], .task-difficulty, .difficulty');
  }

  async navigateToTasks(): Promise<void> {
    await this.navigateTo('/tasks');
  }

  async clickCreateTask(): Promise<void> {
    await this.clickElement(this.createTaskButton);
  }

  async searchTasks(query: string): Promise<void> {
    await this.fillInput(this.searchInput, query);
  }

  async filterByDifficulty(difficulty: string): Promise<void> {
    await this.clickElement(this.difficultyFilter);
    await this.page.locator(`[data-value="${difficulty}"]`).click();
  }

  async filterByCategory(category: string): Promise<void> {
    await this.clickElement(this.categoryFilter);
    await this.page.locator(`[data-value="${category}"]`).click();
  }

  async clickSolveTask(): Promise<void> {
    await this.clickElement(this.solveButton);
  }

  async clickEditTask(): Promise<void> {
    await this.clickElement(this.editButton);
  }

  async clickDeleteTask(): Promise<void> {
    await this.clickElement(this.deleteButton);
  }

  async getTasksCount(): Promise<number> {
    return await this.taskCard.count();
  }

  async getFirstTaskTitle(): Promise<string | null> {
    const firstCard = this.taskCard.first();
    const titleElement = firstCard.locator('[data-testid="task-title"]');
    return await titleElement.textContent();
  }

  async verifyTasksListVisible(): Promise<boolean> {
    return await this.verifyElementVisible(this.tasksList);
  }

  async verifyCreateButtonVisible(): Promise<boolean> {
    return await this.verifyElementVisible(this.createTaskButton);
  }

  async verifyTaskCardVisible(): Promise<boolean> {
    return await this.verifyElementVisible(this.taskCard);
  }

  async waitForTasksToLoad(): Promise<void> {
    try {
      // First try to wait for any task-related element or empty state
      await this.page.waitForSelector('[data-testid*="task"], [data-testid*="empty"], .task, .empty-state, main, .container', { timeout: 5000 });
    } catch (error) {
      try {
        // If nothing specific is found, try the tasks list
        await this.waitForElement(this.tasksList, 3000);
      } catch (secondError) {
        // If still nothing found, just wait for page to be stable
        await this.page.waitForLoadState('networkidle');
      }
    }
  }

  async clickFirstTask(): Promise<void> {
    await this.clickElement(this.taskCard.first());
  }
}
