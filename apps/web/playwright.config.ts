import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const env: Record<string, string> = {
  NODE_ENV: 'test',
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
}

if (process.env.CI) {
  env.CI = 'true'
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3001',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
    cwd: path.join(__dirname),
    env,
    stdout: 'pipe',
    stderr: 'pipe',
  },
}) 
