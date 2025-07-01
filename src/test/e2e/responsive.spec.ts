
import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if mobile navigation works
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('should work on tablet devices', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check if layout adapts to tablet
    await expect(page.locator('main')).toBeVisible();
    
    // Navigation should still be accessible
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should work on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Check if sidebar is visible on desktop
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    
    // Check if main content is properly laid out
    await expect(page.locator('main')).toBeVisible();
  });
});
