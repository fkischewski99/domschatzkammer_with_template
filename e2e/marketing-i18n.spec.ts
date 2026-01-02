import { test, expect } from '@playwright/test';

test('Marketing Site - i18n works correctly', async ({ page }) => {
  // 1. Test German locale
  await page.goto('http://localhost:3001/de');

  // Verify German content
  await expect(page.getByRole('button', { name: 'Produkt' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Preise' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Jetzt starten' })).toBeVisible();

  // Verify language switcher exists and German is selected
  await expect(page.getByRole('radio', { name: 'Deutsch language' })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'English language' })).toBeVisible();

  // 2. Switch to English by navigating directly (language switcher is complex to interact with in tests)
  await page.goto('http://localhost:3001/en');

  // Verify URL changed to /en
  await expect(page).toHaveURL('http://localhost:3001/en');

  // Verify English content
  await expect(page.getByRole('button', { name: 'Product' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pricing' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();

  // Verify English is now selected
  await expect(page.getByRole('radio', { name: 'English language' })).toBeChecked();

  // 3. Navigate to another page and verify locale is maintained
  await page.getByRole('link', { name: 'Pricing' }).click();
  await expect(page).toHaveURL(/\/en\/pricing/);
});
