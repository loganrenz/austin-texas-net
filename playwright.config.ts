import { defineConfig } from '@playwright/test'

/**
 * Playwright E2E config for austin-texas.net
 *
 * Automatically starts `nuxt dev` on port 12233 before tests.
 * Uses a URL health check so tests don't start until SSR is fully warm.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  workers: 4,

  use: {
    baseURL: 'http://localhost:12233',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  webServer: {
    command: 'doppler run --project austin-texas-net --config dev -- nuxt dev --port 12233',
    url: 'http://localhost:12233',  // Wait for HTTP 200, not just port open
    reuseExistingServer: !process.env.CI,
    timeout: 180_000, // 3 min — Nuxt cold start + SSR warm-up
    stdout: 'ignore',
    stderr: 'pipe',
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],

  outputDir: 'test-results',
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
})
