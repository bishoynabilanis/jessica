import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: ['**/._*', '**/__MACOSX/**'],
  timeout: 30_000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    channel: process.env.CI ? undefined : 'chrome',
    headless: true,
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: 'npm run preview -- --port 4174 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
