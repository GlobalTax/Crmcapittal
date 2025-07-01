
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display KPI metrics', async ({ page }) => {
    // Check if KPI cards are visible
    await expect(page.locator('text=Operaciones Disponibles')).toBeVisible();
    await expect(page.locator('text=En Proceso')).toBeVisible();
    await expect(page.locator('text=Vendidas')).toBeVisible();
    await expect(page.locator('text=Comisiones Generadas')).toBeVisible();
  });

  test('should display recent activities', async ({ page }) => {
    // Check if activity section is visible
    await expect(page.locator('text=Actividad Reciente')).toBeVisible();
  });

  test('should display quick actions', async ({ page }) => {
    // Check if quick actions are visible
    await expect(page.locator('text=Ver Pipeline')).toBeVisible();
    await expect(page.locator('text=Gestionar Leads')).toBeVisible();
    await expect(page.locator('text=Mi Agenda')).toBeVisible();
  });

  test('should navigate from quick actions', async ({ page }) => {
    // Click on "Ver Pipeline" action
    await page.click('text=Ver Pipeline');
    await expect(page).toHaveURL('/portfolio');
    
    // Go back to dashboard
    await page.goto('/');
    
    // Click on "Gestionar Leads" action
    await page.click('text=Gestionar Leads');
    await expect(page).toHaveURL('/leads');
  });
});
