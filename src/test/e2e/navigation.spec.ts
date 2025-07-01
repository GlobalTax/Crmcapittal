
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication or login before each test
    await page.goto('/');
  });

  test('should navigate between main sections', async ({ page }) => {
    // Test navigation to Portfolio
    await page.click('text=Portfolio');
    await expect(page).toHaveURL('/portfolio');
    await expect(page.locator('h1')).toContainText('Portfolio');

    // Test navigation to Operations
    await page.click('text=Operaciones');
    await expect(page).toHaveURL('/operaciones');
    
    // Test navigation to Contacts
    await page.click('text=Contactos');
    await expect(page).toHaveURL('/contacts');
    
    // Test navigation to Companies
    await page.click('text=Empresas');
    await expect(page).toHaveURL('/companies');
  });

  test('should show sidebar navigation', async ({ page }) => {
    // Check if sidebar is visible
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    
    // Check main navigation items
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Portfolio')).toBeVisible();
    await expect(page.locator('text=Operaciones')).toBeVisible();
  });
});
