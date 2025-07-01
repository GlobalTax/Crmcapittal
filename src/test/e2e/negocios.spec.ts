
import { test, expect } from '@playwright/test';

test.describe('Negocios Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/negocios');
  });

  test('should display negocios table', async ({ page }) => {
    // Check if negocios table is visible
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=Nombre del Negocio')).toBeVisible();
    await expect(page.locator('text=Empresa')).toBeVisible();
  });

  test('should open create negocio dialog', async ({ page }) => {
    // Click create negocio button
    await page.click('text=Nuevo Negocio');
    
    // Check if dialog is open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Crear Nuevo Negocio')).toBeVisible();
  });

  test('should create a new negocio', async ({ page }) => {
    // Open create dialog
    await page.click('text=Nuevo Negocio');
    
    // Fill form
    await page.fill('input[id="nombre_negocio"]', 'Negocio Test');
    await page.fill('input[id="valor_negocio"]', '100000');
    await page.selectOption('select', 'venta');
    
    // Submit form
    await page.click('text=Crear Negocio');
    
    // Check if negocio appears in table
    await expect(page.locator('text=Negocio Test')).toBeVisible();
  });

  test('should filter negocios', async ({ page }) => {
    // Use search filter
    await page.fill('input[placeholder*="Buscar"]', 'Test');
    await page.keyboard.press('Enter');
    
    // Check if results are filtered
    await expect(page.locator('text=Test')).toBeVisible();
  });

  test('should open negocio details', async ({ page }) => {
    // Click on first negocio
    await page.click('a[href*="/negocios/"]');
    
    // Check if details page loads
    await expect(page.locator('text=Editar Negocio')).toBeVisible();
    await expect(page.locator('text=Información del Negocio')).toBeVisible();
  });
});
