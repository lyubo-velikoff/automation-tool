import { Page } from '@playwright/test';

const MOCK_TOKEN = {
  "access_token": "test-token",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "test-refresh-token",
  "provider_token": null,
  "provider_refresh_token": null,
  "user": {
    "id": "test-user-id",
    "email": "test@example.com",
    "role": "authenticated",
    "aud": "authenticated",
    "app_metadata": {
      "provider": "github"
    }
  },
  "expires_at": Date.now() + 3600000
};

/**
 * Login as a test user by setting a mock Supabase token in localStorage
 */
export async function loginAsTestUser(page: Page) {
  await page.addInitScript(() => {
    // Mock environment variables
    window.process = {
      ...window.process,
      env: {
        ...window.process?.env,
        NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
      }
    };
  });

  await page.evaluate(() => {
    // Mock Supabase auth state
    const key = `sb-${window.location.hostname}-auth-token`;
    window.localStorage.setItem(key, JSON.stringify({
      currentSession: {
        ...MOCK_TOKEN,
        expires_at: Date.now() + 3600000
      },
      expiresAt: Date.now() + 3600000
    }));
  });
}

/**
 * Mock GitHub OAuth callback
 */
export async function mockGitHubOAuth(page: Page, success = true) {
  if (success) {
    await page.route('**/auth/callback/github**', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(MOCK_TOKEN)
      });
    });
  } else {
    await page.route('**/auth/callback/github**', route =>
      route.fulfill({
        status: 401,
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Authentication failed'
        })
      })
    );
  }
}

/**
 * Logout by removing Supabase auth token
 */
export async function logout(page: Page) {
  await page.evaluate(() => {
    const key = `sb-${window.location.hostname}-auth-token`;
    window.localStorage.removeItem(key);
  });
} 
