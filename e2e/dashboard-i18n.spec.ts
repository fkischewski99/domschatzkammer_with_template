import { test, expect } from '@playwright/test';

test('Dashboard - i18n works correctly', async ({ page }) => {
  // 1. Test root redirect to default locale
  await page.goto('http://localhost:3000/');
  await expect(page).toHaveURL(/\/(de|en)\//);

  // 2. Test German locale on sign-in page
  await page.goto('http://localhost:3000/de/auth/sign-in');

  // Verify page title and content in German
  await expect(page).toHaveTitle(/Anmelden/);
  await expect(page.getByText('Oder fortfahren mit')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Google' })).toBeVisible();

  // 3. Test English locale on sign-in page
  await page.goto('http://localhost:3000/en/auth/sign-in');

  // Verify page title and content in English
  await expect(page).toHaveTitle(/Sign in/);
  await expect(page.getByText('Or continue with')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Google' })).toBeVisible();

  // 4. Verify locale is maintained in navigation
  await page.goto('http://localhost:3000/de/auth/sign-in');

  // Check for any internal links and verify they maintain the /de/ prefix
  const signUpLink = page.getByRole('link', { name: /registrieren|sign up/i }).first();
  if (await signUpLink.isVisible()) {
    const href = await signUpLink.getAttribute('href');
    expect(href).toContain('/de/');
  }
});
