import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly getStartedButton: Locator;
  readonly tournamentsLink: Locator;
  readonly tasksLink: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly heroSection: Locator;

  constructor(page: Page) {
    super(page);
    this.getStartedButton = page.locator('[data-testid="get-started-btn"], button:has-text("Get Started"), button:has-text("Почати")');
    this.tournamentsLink = page.locator('[data-testid="tournaments-link"], a:has-text("Tournaments"), a:has-text("Турніри")');
    this.tasksLink = page.locator('[data-testid="tasks-link"], a:has-text("Tasks"), a:has-text("Завдання"), a[href*="tasks"]');
    this.loginButton = page.locator('[data-testid="login-btn"]').first();
    this.registerButton = page.locator('[data-testid="register-btn"]').first();
    this.heroSection = page.locator('[data-testid="hero-section"], .hero, section:has(h1)');
  }

  async navigateToHome(): Promise<void> {
    await this.navigateTo('/');
  }

  async clickGetStarted(): Promise<void> {
    await this.clickElement(this.getStartedButton);
  }

  async navigateToTournaments(): Promise<void> {
    // Try clicking the tournaments link, or navigate directly
    try {
      await this.clickElement(this.tournamentsLink);
    } catch (error) {
      await this.navigateTo('/tournaments');
    }
  }

  async navigateToTasks(): Promise<void> {
    // Direct navigation since Tasks link doesn't exist in current UI
    await this.navigateTo('/tasks');
  }

  async clickLogin(): Promise<void> {
    await this.clickElement(this.loginButton);
  }

  async clickRegister(): Promise<void> {
    await this.clickElement(this.registerButton);
  }

  async verifyHeroSectionVisible(): Promise<boolean> {
    return await this.verifyElementVisible(this.heroSection);
  }

  async verifyNavigationLinksVisible(): Promise<boolean> {
    const tournamentsVisible = await this.verifyElementVisible(this.tournamentsLink);
    const tasksVisible = await this.verifyElementVisible(this.tasksLink);
    return tournamentsVisible && tasksVisible;
  }
}
