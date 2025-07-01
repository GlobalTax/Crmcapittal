
import { test, expect } from '@playwright/test';

test.describe('Operations Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/operaciones');
  });

  test('should display operations grid', async ({ page }) => {
    // Check if operations are displayed
    await expect(page.locator('[data-testid="operations-grid"]')).toBeVisible();
  });

  test('should toggle between grid and table view', async ({ page }) => {
    // Click table view toggle
    await page.click('[data-testid="view-toggle-table"]');
    await expect(page.locator('table')).toBeVisible();
    
    // Click grid view toggle
    await page.click('[data-testid="view-toggle-grid"]');
    await expect(page.locator('[data-testid="operations-grid"]')).toBeVisible();
  });

  test('should filter operations', async ({ page }) => {
    // Use search filter
    await page.fill('input[placeholder*="Buscar"]', 'M&A');
    await page.keyboard.press('Enter');
    
    // Check if results are filtered
    await expect(page.locator('text=M&A')).toBeVisible();
  });

  test('should open operation details', async ({ page }) => {
    // Click on first operation card
    await page.click('[data-testid="operation-card"]:first-child');
    
    // Check if details dialog opens
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Detalles de la Operación')).toBeVisible();
  });
});
