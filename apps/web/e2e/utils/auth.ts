import { Page } from '@playwright/test';

export async function loginAsTestUser(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      currentSession: {
        access_token: 'mock-token',
        user: {
          id: 'test-user-123',
          email: 'test@example.com',
          name: 'Test User'
        }
      }
    }));
  });
}

export async function mockGoogleOAuth(page: Page, success = true) {
  await page.route('**/auth/callback/google', async (route) => {
    if (success) {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: {
            id: 'test-user-123',
            email: 'test@example.com',
            name: 'Test User'
          },
          session: {
            access_token: 'mock-token'
          }
        })
      });
    } else {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({
          error: 'Authentication failed'
        })
      });
    }
  });
}

export async function logout(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('supabase.auth.token');
  });
} 
