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
    
    // Connect nodes
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

  test('should configure Gmail node settings', async ({ page }) => {
    // Add Gmail node
    await page.getByRole('button', { name: /add node/i }).click()
    await page.getByRole('button', { name: /gmail/i }).click()
    
    // Open node settings
    await page.getByTestId('node-gmail').click()
    
    // Configure settings
    await page.getByLabel(/from filter/i).fill('test@example.com')
    await page.getByLabel(/subject filter/i).fill('Test Subject')
    await page.getByRole('button', { name: /save/i }).click()
    
    // Verify settings are saved
    await expect(page.getByTestId('node-gmail')).toContainText('test@example.com')
  })

  test('should configure OpenAI node settings', async ({ page }) => {
    // Add OpenAI node
    await page.getByRole('button', { name: /add node/i }).click()
    await page.getByRole('button', { name: /openai/i }).click()
    
    // Open node settings
    await page.getByTestId('node-openai').click()
    
    // Configure settings
    await page.getByLabel(/prompt/i).fill('Generate a response about {{topic}}')
    await page.getByLabel(/model/i).selectOption('gpt-3.5-turbo')
    await page.getByLabel(/max tokens/i).fill('100')
    await page.getByRole('button', { name: /save/i }).click()
    
    // Verify settings are saved
    await expect(page.getByTestId('node-openai')).toContainText('gpt-3.5-turbo')
  })

  test('should save workflow', async ({ page }) => {
    // Add node
    await page.getByRole('button', { name: /add node/i }).click()
    await page.getByRole('button', { name: /gmail/i }).click()
    
    // Set workflow name
    await page.getByLabel(/workflow name/i).fill('Test Workflow')
    
    // Save workflow
    await page.getByRole('button', { name: /save workflow/i }).click()
    
    // Verify success message
    await expect(page.getByText(/workflow saved successfully/i)).toBeVisible()
  })

  test('should execute workflow', async ({ page }) => {
    // Add and configure nodes
    await page.getByRole('button', { name: /add node/i }).click()
    await page.getByRole('button', { name: /gmail/i }).click()
    
    // Save workflow first
    await page.getByLabel(/workflow name/i).fill('Test Workflow')
    await page.getByRole('button', { name: /save workflow/i }).click()
    
    // Execute workflow
    await page.getByRole('button', { name: /test workflow/i }).click()
    
    // Verify execution started
    await expect(page.getByText(/executing/i)).toBeVisible()
    
    // Wait for execution to complete and verify results
    await expect(page.getByTestId('execution-history')).toBeVisible()
    await expect(page.getByTestId('execution-status')).toContainText(/completed/i)
  })

  test('should handle authentication', async ({ page }) => {
    // Verify login required message
    await expect(page.getByText(/please log in to continue/i)).toBeVisible()
    
    // Click login button
    await page.getByRole('button', { name: /login with github/i }).click()
    
    // Verify redirect to GitHub
    await expect(page.url()).toContain('github.com')
  })
}) 
