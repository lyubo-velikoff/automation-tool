import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in with Google/i })).toBeVisible();
  });

  test('should redirect to dashboard after login', async ({ page }) => {
    // Mock successful Google OAuth flow
    await page.route('**/auth/callback/google', async (route) => {
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
    });

    await page.goto('/');
    await page.getByRole('button', { name: /Sign in with Google/i }).click();

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText(/Welcome, Test User/i)).toBeVisible();
  });

  test('should handle failed authentication', async ({ page }) => {
    // Mock failed Google OAuth flow
    await page.route('**/auth/callback/google', async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({
          error: 'Authentication failed'
        })
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: /Sign in with Google/i }).click();

    // Verify error message
    await expect(page.getByText(/Authentication failed/i)).toBeVisible();
  });

  test('should maintain session across page reloads', async ({ page }) => {
    // Set up authenticated session
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          access_token: 'mock-token',
          user: {
            id: 'test-user-123',
            email: 'test@example.com'
          }
        }
      }));
    });

    // Verify session persistence
    await page.goto('/dashboard');
    await expect(page).not.toHaveURL(/.*login/);
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
  });
}); 
