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
    await this.page.waitForTimeout(1000);
    
    // Check if the tournaments list is visible
    const isVisible = await this.verifyElementVisible(this.tournamentsList);
    
    // Also check if it's not in a loading state
    const loadingElement = this.page.locator('[data-testid="loading"], .loading, [class*="loading"]');
    const isLoading = await loadingElement.isVisible().catch(() => false);
    
    // If list container is not visible, check if we have tournament cards as fallback
    if (!isVisible) {
      const cardCount = await this.tournamentCard.count();
      return cardCount > 0 && !isLoading;
    }
    
    return isVisible && !isLoading;
  }

  async verifyCreateButtonVisible(): Promise<boolean> {
    // Wait a bit for the button to potentially render
    await this.page.waitForTimeout(1000);
    return await this.verifyElementVisible(this.createTournamentButton);
  }

  async verifyTournamentCardVisible(): Promise<boolean> {
    return await this.verifyElementVisible(this.tournamentCard.first());
  }

  async waitForTournamentsToLoad(): Promise<void> {
    // First wait for the tournaments list container
    try {
      await this.waitForElement(this.tournamentsList, 10000);
    } catch (error) {
      // If tournaments list is not visible, check if page has loaded content
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
      
      // Check if we have tournament cards even if list container is not visible
      const cardCount = await this.tournamentCard.count();
      if (cardCount === 0) {
        throw error; // Re-throw original error if no cards found
      }
      return; // Exit early if we found cards
    }
    
    // Then wait for loading to complete (check if loading state is gone)
    await this.page.waitForLoadState('networkidle');
    // Wait a bit for the tournaments to render
    await this.page.waitForTimeout(1000);
  }

  async clickFirstTournament(): Promise<void> {
    await this.clickElement(this.tournamentCard.first());
  }
}
