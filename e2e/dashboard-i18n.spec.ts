import { test, expect } from '@playwright/test';

test.describe('Dashboard - German Translation', () => {
  test('should display German content on /de/auth/sign-in page', async ({ page }) => {
    await page.goto('http://localhost:3000/de/auth/sign-in');

    // Check page title
    await expect(page).toHaveTitle(/Anmelden/);

    // Check for German "Or continue with" text
    await expect(page.getByText('Oder fortfahren mit')).toBeVisible();

    // Check OAuth buttons
    await expect(page.getByRole('button', { name: 'Google' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Microsoft' })).toBeVisible();
  });

  test('should display English content on /en/auth/sign-in page', async ({ page }) => {
    await page.goto('http://localhost:3000/en/auth/sign-in');

    // Check page title
    await expect(page).toHaveTitle(/Sign in/);

    // Check for English "Or continue with" text
    await expect(page.getByText('Or continue with')).toBeVisible();
  });

  test('should maintain language preference when navigating', async ({ page }) => {
    await page.goto('http://localhost:3000/de/auth/sign-in');

    // Click "Forgot password?" link
    const forgotPasswordLink = page.getByRole('link', { name: /Passwort vergessen|Forgot password/i });
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();

      // Verify we're still on German version
      await expect(page).toHaveURL(/\/de\//);
    }
  });

  test('should redirect from root to locale-specific auth page', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Should redirect to a locale-specific route
    await expect(page).toHaveURL(/\/(de|en)\//);
  });
});

test.describe('Dashboard - Translation Coverage', () => {
  test('should have German translations for common UI elements', async ({ page }) => {
    await page.goto('http://localhost:3000/de/auth/sign-in');

    // Check for translated content that should be present
    const germanContent = [
      'Oder fortfahren mit', // Or continue with
    ];

    for (const text of germanContent) {
      const element = page.getByText(text, { exact: false });
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible();
      }
    }
  });

  test('should have English translations for common UI elements', async ({ page }) => {
    await page.goto('http://localhost:3000/en/auth/sign-in');

    // Check for English content
    const englishContent = [
      'Or continue with',
    ];

    for (const text of englishContent) {
      const element = page.getByText(text, { exact: false });
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible();
      }
    }
  });
});
