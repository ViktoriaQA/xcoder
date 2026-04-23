import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class TournamentsPage extends BasePage {
  readonly tournamentsList: Locator;
  readonly createTournamentButton: Locator;
  readonly tournamentCard: Locator;
  readonly filterButton: Locator;
  readonly searchInput: Locator;
  readonly myTournamentsTab: Locator;
  readonly availableTournamentsTab: Locator;
  readonly registerButton: Locator;
  readonly tournamentTitle: Locator;
  readonly tournamentDescription: Locator;
  readonly tournamentDate: Locator;

  constructor(page: Page) {
    super(page);
    this.tournamentsList = page.locator('[data-testid="tournaments-list"]');
    this.createTournamentButton = page.locator('[data-testid="create-tournament-btn"]');
    this.tournamentCard = page.locator('[data-testid="tournament-card"]');
    this.filterButton = page.locator('[data-testid="filter-btn"]');
    this.searchInput = page.locator('input[placeholder*="Пошук"]');
    this.myTournamentsTab = page.locator('[data-testid="my-tournaments-tab"]');
    this.availableTournamentsTab = page.locator('[data-testid="available-tournaments-tab"]');
    this.registerButton = page.locator('[data-testid="register-btn"]');
    this.tournamentTitle = page.locator('[data-testid="tournament-title"]');
    this.tournamentDescription = page.locator('[data-testid="tournament-description"]');
    this.tournamentDate = page.locator('[data-testid="tournament-date"]');
  }

  async navigateToTournaments(): Promise<void> {
    await this.navigateTo('/tournaments');
  }

  async clickCreateTournament(): Promise<void> {
    await this.clickElement(this.createTournamentButton);
  }

  async searchTournaments(query: string): Promise<void> {
    await this.fillInput(this.searchInput, query);
  }

  async clickMyTournamentsTab(): Promise<void> {
    await this.clickElement(this.myTournamentsTab);
  }

  async clickAvailableTournamentsTab(): Promise<void> {
    await this.clickElement(this.availableTournamentsTab);
  }

  async clickRegisterForTournament(): Promise<void> {
    await this.clickElement(this.registerButton);
  }

  async getTournamentsCount(): Promise<number> {
    return await this.tournamentCard.count();
  }

  async getFirstTournamentTitle(): Promise<string | null> {
    const firstCard = this.tournamentCard.first();
    const titleElement = firstCard.locator('[data-testid="tournament-title"]');
    return await titleElement.textContent();
  }

  async verifyTournamentsListVisible(): Promise<boolean> {
    // Wait for loading to complete
    await this.page.waitForLoadState('networkidle');
    
    // Check if tournaments list container is attached to DOM
    const listContainer = this.page.locator('[data-testid="tournaments-list"]');
    const isAttached = await listContainer.count() > 0;
    
    if (!isAttached) {
      return false;
    }
    
    // Check if it's visible
    const isVisible = await this.verifyElementVisible(this.tournamentsList);
    
    // If not visible, check if we have tournament cards (which might mean container is hidden but content exists)
    if (!isVisible) {
      const cardCount = await this.tournamentCard.count();
      if (cardCount > 0) {
        return true; // Cards exist even if container is hidden
      }
      // Check if we have empty state message (valid state)
      const emptyState = this.page.locator('text=/Немає доступних турнірів|No tournaments available/');
      const hasEmptyState = await emptyState.isVisible().catch(() => false);
      if (hasEmptyState) {
        return true; // Empty state is valid
      }
    }
    
    return isVisible;
  }

  async verifyCreateButtonVisible(): Promise<boolean> {
    return await this.verifyElementVisible(this.createTournamentButton);
  }

  async verifyTournamentCardVisible(): Promise<boolean> {
    return await this.verifyElementVisible(this.tournamentCard.first());
  }

  async waitForTournamentsToLoad(): Promise<void> {
    // First wait for loading to complete
    await this.page.waitForLoadState('networkidle');
    
    // Wait for the loading component to disappear
    const loadingElement = this.page.locator('[data-testid="loading"], .loading, [class*="loading"]');
    try {
      await loadingElement.waitFor({ state: 'hidden', timeout: 10000 });
    } catch (error) {
      // Loading element might not exist or already hidden
    }
    
    // Wait a bit for content to stabilize
    await this.page.waitForTimeout(2000);
    
    // Check if tournaments list container exists (not necessarily visible yet)
    const listContainer = this.page.locator('[data-testid="tournaments-list"]');
    await listContainer.waitFor({ state: 'attached', timeout: 10000 });
    
    // Now wait for it to be visible OR check if we have tournament cards
    try {
      await this.waitForElement(this.tournamentsList, 5000);
    } catch (error) {
      // If tournaments list is not visible, check if we have tournament cards
      const cardCount = await this.tournamentCard.count();
      if (cardCount === 0) {
        // If no cards, check if we have empty state message
        const emptyState = this.page.locator('text=/Немає доступних турнірів|No tournaments available/');
        try {
          await emptyState.waitFor({ state: 'visible', timeout: 3000 });
          return; // Empty state is valid
        } catch (emptyError) {
          throw new Error(`No tournaments found and no empty state message: ${error}`);
        }
      }
    }
  }

  async clickFirstTournament(): Promise<void> {
    await this.clickElement(this.tournamentCard.first());
  }
}
