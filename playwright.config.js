import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  timeout: 15000,
  use: { baseURL: 'http://127.0.0.1:4173', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'webkit-mobile', testMatch: /mobile-regressoes\.spec\.js/, use: { browserName: 'webkit', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 } },
  ],
  webServer: { command: 'npm run dev', port: 4173, reuseExistingServer: !process.env.CI },
});
