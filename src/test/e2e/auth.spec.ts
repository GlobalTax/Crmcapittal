
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to auth page or show login form
    await expect(page).toHaveURL(/\/auth|login/);
    
    // Check for login elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should navigate to dashboard after successful login', async ({ page }) => {
    await page.goto('/auth');
    
    // Fill in login form (adjust selectors based on your actual form)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should navigate to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});
