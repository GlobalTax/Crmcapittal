
import { test, expect } from '@playwright/test';

test.describe('Contacts Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacts');
  });

  test('should display contacts table', async ({ page }) => {
    // Check if contacts table is visible
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=Nombre')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
  });

  test('should open create contact dialog', async ({ page }) => {
    // Click create contact button
    await page.click('text=Crear Contacto');
    
    // Check if dialog is open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Crear Nuevo Contacto')).toBeVisible();
  });

  test('should create a new contact', async ({ page }) => {
    // Open create dialog
    await page.click('text=Crear Contacto');
    
    // Fill form
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '+1234567890');
    
    // Submit form
    await page.click('text=Crear');
    
    // Check if contact appears in table
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=john.doe@example.com')).toBeVisible();
  });
});
