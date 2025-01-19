import { test, expect } from '@playwright/test';

test.describe('Workflow Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the workflow editor', async ({ page }) => {
    await expect(page).toHaveTitle(/Automation Tool/);
    await expect(page.getByRole('heading', { name: /Workflow Editor/i })).toBeVisible();
  });

  test('should be able to add a new node', async ({ page }) => {
    const addNodeButton = page.getByRole('button', { name: /Add Node/i });
    await expect(addNodeButton).toBeVisible();
    await addNodeButton.click();

    const nodeMenu = page.getByRole('menu');
    await expect(nodeMenu).toBeVisible();
  });

  test('should be able to connect nodes', async ({ page }) => {
    // Add first node
    await page.getByRole('button', { name: /Add Node/i }).click();
    await page.getByRole('menuitem', { name: /Gmail Trigger/i }).click();
    
    // Add second node
    await page.getByRole('button', { name: /Add Node/i }).click();
    await page.getByRole('menuitem', { name: /OpenAI/i }).click();

    // Verify nodes are present
    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(2);
  });

  test('should save workflow changes', async ({ page }) => {
    // Add a node
    await page.getByRole('button', { name: /Add Node/i }).click();
    await page.getByRole('menuitem', { name: /Gmail Trigger/i }).click();

    // Save workflow
    await page.getByRole('button', { name: /Save/i }).click();

    // Verify success message
    await expect(page.getByText(/Workflow saved/i)).toBeVisible();
  });
}); 
