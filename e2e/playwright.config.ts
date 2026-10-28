import { defineConfig, devices } from '@playwright/test';

const frontendUrl = process.env.WEB_SERVER_URL ?? 'http://localhost:5173';
const apiUrl = process.env.API_URL ?? 'http://localhost:3000';
const failureProxyUrl = process.env.FAILURE_PROXY_URL ?? 'http://127.0.0.1:3100';
const startServers = process.env.START_WEB_SERVER !== '0';

const failureProxy = new URL(failureProxyUrl);

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Database fixtures are shared per test file; one worker keeps them deterministic.
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.URL ?? frontendUrl,
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'on-first-retry',
    testIdAttribute: 'data-testid',
  },
  projects: [
    {
      name: 'chromiumheadless',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
  ],
  webServer: startServers
    ? [
        {
          command: 'npm --prefix ../../find-potential-stock-backend run dev',
          url: `${apiUrl}/api/health`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          // Tests run against seeded fixtures; live scraping would change counts and ordering.
          env: {
            SCRAPE_ENABLED: 'false',
            SCRAPE_RUN_ON_START: 'false',
          },
        },
        {
          // SSR loaders fetch data in Node, so page.route cannot intercept them.
          // Tests toggle this proxy to exercise the error states (tests/utils/api-failure.ts).
          command: 'node tests/support/api-failure-proxy.mjs',
          url: `${failureProxyUrl}/__health`,
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
          env: {
            PORT: failureProxy.port || '3100',
            HOST: failureProxy.hostname,
            TARGET: apiUrl,
          },
        },
        {
          command: 'npm run dev',
          cwd: '..',
          url: frontendUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          // Server loaders use this; Vite also proxies browser /api calls through the same proxy.
          env: {
            API_PROXY_TARGET: failureProxyUrl,
          },
        },
      ]
    : undefined,
});
