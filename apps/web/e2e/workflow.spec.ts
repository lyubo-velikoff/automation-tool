import { test, expect } from '@playwright/test'

test.describe('Workflow Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workflows')
  })

  test('should display workflow canvas', async ({ page }) => {
    await expect(page.getByRole('button', { name: /add node/i })).toBeVisible()
    await expect(page.getByTestId('workflow-canvas')).toBeVisible()
  })

  test('should allow adding a new node', async ({ page }) => {
    // Click add node button
    await page.getByRole('button', { name: /add node/i }).click()
    
    // Node selector dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible()
    
    // Select Gmail node type
    await page.getByRole('button', { name: /gmail/i }).click()
    
    // Node should be added to canvas
    await expect(page.getByTestId('node-gmail')).toBeVisible()
  })

  test('should allow connecting nodes', async ({ page }) => {
    // Add two nodes
    await page.getByRole('button', { name: /add node/i }).click()
    await page.getByRole('button', { name: /gmail/i }).click()
    
    await page.getByRole('button', { name: /add node/i }).click()
    await page.getByRole('button', { name: /openai/i }).click()
    
    // Connect nodes (this will need to be implemented based on your UI)
    const sourceNode = page.getByTestId('node-gmail')
    const targetNode = page.getByTestId('node-openai')
    
    await sourceNode.hover()
    const sourceHandle = page.getByTestId('source-handle')
    await sourceHandle.hover()
    await page.mouse.down()
    
    await targetNode.hover()
    const targetHandle = page.getByTestId('target-handle')
    await targetHandle.hover()
    await page.mouse.up()
    
    // Verify connection
    await expect(page.getByTestId('edge')).toBeVisible()
  })
}) 
