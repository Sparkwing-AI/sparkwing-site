import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4322',
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'wide', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'compact', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'npx astro preview --port 4322',
    url: 'http://localhost:4322',
    // Serves dist, so build first.
    reuseExistingServer: !process.env.CI,
  },
});
