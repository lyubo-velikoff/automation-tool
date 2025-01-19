import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './utils/auth';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show login page for unauthenticated users', async ({ page }) => {
    // Check for auth elements using exact text from the page
    await expect(page.getByText('Please log in to continue')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login with GitHub' })).toBeVisible();
  });

  test('should redirect to workflows after login', async ({ page }) => {
    // Set auth token before navigation
    await loginAsTestUser(page);
    await page.goto('/');
    
    // Navigate to workflows and wait for auth check
    await page.goto('/workflows');
    
    // Wait for auth check to complete and page to load
    await page.waitForFunction(() => {
      const loginText = document.querySelector('h1')?.textContent;
      const workflowInput = document.querySelector('#workflow-name');
      return !loginText?.includes('Please log in') && !!workflowInput;
    }, { timeout: 15000 });
    
    // Verify we see workflow-specific elements
    await expect(page.locator('#workflow-name')).toBeVisible();
    await expect(page.getByRole('button', { name: /Save Workflow/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Test Workflow/i })).toBeVisible();
  });

  test('should handle failed authentication', async ({ page }) => {
    // Clear any existing auth
    await page.evaluate(() => localStorage.clear());
    
    // Try to access protected route
    await page.goto('/workflows');
    
    // Should show login page
    await expect(page.getByText('Please log in to continue')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login with GitHub' })).toBeVisible();
  });

  test('should maintain session across page reloads', async ({ page }) => {
    // Set auth token before navigation
    await loginAsTestUser(page);
    await page.goto('/');
    
    // Navigate to workflows and wait for auth check
    await page.goto('/workflows');
    
    // Wait for auth check to complete and page to load
    await page.waitForFunction(() => {
      const loginText = document.querySelector('h1')?.textContent;
      const workflowInput = document.querySelector('#workflow-name');
      return !loginText?.includes('Please log in') && !!workflowInput;
    }, { timeout: 15000 });
    
    // Verify we see workflow-specific elements
    await expect(page.locator('#workflow-name')).toBeVisible();
    await expect(page.getByRole('button', { name: /Save Workflow/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Test Workflow/i })).toBeVisible();
    
    // Reload and verify we're still authenticated
    await page.reload();
    
    // Wait for auth check to complete and page to load
    await page.waitForFunction(() => {
      const loginText = document.querySelector('h1')?.textContent;
      const workflowInput = document.querySelector('#workflow-name');
      return !loginText?.includes('Please log in') && !!workflowInput;
    }, { timeout: 15000 });
    
    await expect(page.locator('#workflow-name')).toBeVisible();
    await expect(page.getByRole('button', { name: /Save Workflow/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Test Workflow/i })).toBeVisible();
  });
}); 
