import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './utils/auth';

test.describe('Workflow Execution', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard');
  });

  test('should execute a workflow', async ({ page }) => {
    // Create a simple workflow
    await page.getByRole('button', { name: /Add Node/i }).click();
    await page.getByRole('menuitem', { name: /Gmail Trigger/i }).click();
    await page.getByRole('button', { name: /Add Node/i }).click();
    await page.getByRole('menuitem', { name: /OpenAI/i }).click();

    // Configure nodes
    await page.getByText(/Gmail Trigger/).click();
    await page.getByLabel(/Subject Filter/).fill('Test Email');
    await page.getByRole('button', { name: /Save Node/i }).click();

    await page.getByText(/OpenAI/).click();
    await page.getByLabel(/Prompt/).fill('Analyze the email content');
    await page.getByRole('button', { name: /Save Node/i }).click();

    // Execute workflow
    await page.getByRole('button', { name: /Execute/i }).click();

    // Verify execution started
    await expect(page.getByText(/Execution started/i)).toBeVisible();

    // Mock successful execution
    await page.route('**/api/workflow/status/**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          status: 'completed',
          nodes: {
            'gmail-trigger': { status: 'success', output: ['Test email received'] },
            'openai': { status: 'success', output: ['Analysis complete'] }
          }
        })
      });
    });

    // Verify execution completed
    await expect(page.getByText(/Execution completed/i)).toBeVisible();
    await expect(page.getByText(/Test email received/i)).toBeVisible();
    await expect(page.getByText(/Analysis complete/i)).toBeVisible();
  });

  test('should handle execution errors', async ({ page }) => {
    // Create a workflow with invalid configuration
    await page.getByRole('button', { name: /Add Node/i }).click();
    await page.getByRole('menuitem', { name: /Gmail Trigger/i }).click();

    // Execute workflow without configuration
    await page.getByRole('button', { name: /Execute/i }).click();

    // Mock failed execution
    await page.route('**/api/workflow/status/**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          status: 'failed',
          error: 'Invalid node configuration',
          nodes: {
            'gmail-trigger': { status: 'error', error: 'Missing required fields' }
          }
        })
      });
    });

    // Verify error handling
    await expect(page.getByText(/Execution failed/i)).toBeVisible();
    await expect(page.getByText(/Invalid node configuration/i)).toBeVisible();
    await expect(page.getByText(/Missing required fields/i)).toBeVisible();
  });

  test('should show execution history', async ({ page }) => {
    // Mock execution history
    await page.route('**/api/workflow/history/**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'exec-1',
            status: 'completed',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            nodes: {
              'gmail-trigger': { status: 'success' },
              'openai': { status: 'success' }
            }
          },
          {
            id: 'exec-2',
            status: 'failed',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            error: 'Network error'
          }
        ])
      });
    });

    // Navigate to history
    await page.getByRole('link', { name: /History/i }).click();

    // Verify history display
    await expect(page.getByText(/Execution History/i)).toBeVisible();
    await expect(page.getByText(/completed/i)).toBeVisible();
    await expect(page.getByText(/failed/i)).toBeVisible();
    await expect(page.getByText(/Network error/i)).toBeVisible();
  });
}); 
