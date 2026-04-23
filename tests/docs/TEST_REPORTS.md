# Test Reports Access

## GitHub Actions E2E Tests

This repository uses GitHub Actions to run E2E tests with Playwright.

### Viewing Test Reports

After each test run, the HTML report is automatically published to GitHub Pages. You can access the reports at:

**Main Index Page:** `https://[your-username].github.io/[repository-name]/`

**Latest Test Report:** `https://[your-username].github.io/[repository-name]/test-reports/[run-number]/index.html`

### Setup Instructions

1. **Enable GitHub Pages** in your repository:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` folder
   - Save

2. **Repository Permissions** are already configured in the workflow file.

### What's Included in Reports

- **HTML Report**: Interactive test results with screenshots and videos
- **Screenshots**: Captured on test failures
- **Videos**: Recorded for failed tests
- **Trace Files**: Detailed execution traces for debugging

### Local Development

Run tests locally:
```bash
npm run test:e2e              # Run tests
npm run test:e2e:ui           # Run with UI
npm run test:e2e:headed       # Run in headed mode
npm run test:e2e:debug        # Debug mode
```

View local report:
```bash
npx playwright show-report
```

### Workflow Triggers

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Artifacts

Test artifacts are stored for 30 days:
- `playwright-report`: HTML report
- `playwright-screenshots`: Failure screenshots
- `playwright-videos`: Failure videos
