import { test, expect } from '@playwright/test';

test.describe('Lead Closure Action Dialog - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to leads page and ensure authenticated
    await page.goto('/auth');
    // Add auth flow here based on your auth setup
    await page.goto('/leads');
  });

  test('Pipeline: move to Closed → dialog → create mandate → navigate to detail', async ({ page }) => {
    // Find a lead in pipeline view
    await page.waitForSelector('[data-testid="lead-card"]');
    const leadCard = page.locator('[data-testid="lead-card"]').first();
    
    // Drag to "Perdido/Cerrado" stage or use menu
    await leadCard.locator('[data-testid="lead-menu"]').click();
    await page.locator('text=Marcar como Perdido').click();
    
    // Dialog should open
    await expect(page.locator('[data-testid="lead-closure-dialog"]')).toBeVisible();
    
    // Select mandate type
    await page.locator('text=Mandato de Venta').click();
    
    // Create mandate
    await page.locator('text=Crear Mandato de Venta').click();
    
    // Should navigate to mandate detail
    await expect(page).toHaveURL(/\/mandatos\/.*/, { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Mandato');
  });

  test('Lead detail: close → create valuation → stay in lead detail', async ({ page }) => {
    // Navigate to specific lead detail
    await page.goto('/leads/[lead-id]'); // Replace with actual route
    
    // Click "Crear desde lead" button in header
    await page.locator('text=Crear desde lead').click();
    
    // Dialog appears
    await expect(page.locator('[data-testid="lead-closure-dialog"]')).toBeVisible();
    
    // Select valuation
    await page.locator('text=Valoración').click();
    
    // Uncheck "Link to lead" to stay
    await page.locator('input[type="checkbox"]').uncheck();
    
    // Create valuation
    await page.locator('text=Crear Valoración').click();
    
    // Should stay on lead detail page
    await expect(page).toHaveURL(/\/leads\/.*/, { timeout: 3000 });
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('Handle validation errors in dialog', async ({ page }) => {
    // Go to lead with minimal data
    await page.goto('/leads');
    await page.locator('[data-testid="lead-with-missing-data"]').click();
    
    // Open closure dialog
    await page.locator('text=Crear desde lead').click();
    
    // Try to create without filling required fields
    await page.locator('text=Crear Valoración').click();
    
    // Should show validation errors
    await expect(page.locator('text=nombre es requerido')).toBeVisible();
    await expect(page.locator('text=email es requerido')).toBeVisible();
    
    // Dialog remains open
    await expect(page.locator('[data-testid="lead-closure-dialog"]')).toBeVisible();
  });

  test('Complete flow with analytics tracking', async ({ page }) => {
    // Enable network interception to verify analytics calls
    await page.route('**/analytics/**', route => {
      route.fulfill({ status: 200, body: 'OK' });
    });
    
    await page.goto('/leads');
    await page.locator('[data-testid="lead-card"]').first().click();
    
    // Open dialog
    await page.locator('text=Crear desde lead').click();
    
    // Should track dialog opened
    await page.waitForRequest('**/analytics/**');
    
    // Change selection to track type selected
    await page.locator('text=Mandato de Compra').click();
    
    // Create
    await page.locator('text=Crear Mandato de Compra').click();
    
    // Should track creation success
    await page.waitForRequest('**/analytics/**');
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });
});