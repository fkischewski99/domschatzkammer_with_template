import { test, expect } from '@playwright/test';

test.describe('Marketing Site - German Translation', () => {
  test('should display German content on /de homepage', async ({ page }) => {
    await page.goto('http://localhost:3001/de');

    // Check navigation items are in German
    await expect(page.getByRole('button', { name: 'Produkt' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ressourcen' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Preise' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Blog' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Unsere Geschichte' })).toBeVisible();

    // Check hero section
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toContainText('Next.js SaaS');

    // Check CTA buttons
    await expect(page.getByRole('link', { name: 'Jetzt starten' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mehr erfahren' })).toBeVisible();
  });

  test('should display English content on /en homepage', async ({ page }) => {
    await page.goto('http://localhost:3001/en');

    // Check navigation items are in English
    await expect(page.getByRole('button', { name: 'Product' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Resources' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Pricing' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Blog' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Story' })).toBeVisible();

    // Check hero section
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toContainText('Next.js SaaS');

    // Check CTA buttons
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Learn more' })).toBeVisible();
  });

  test('should have language switcher button', async ({ page }) => {
    await page.goto('http://localhost:3001/de');

    // Verify German content is visible
    await expect(page.getByRole('button', { name: 'Sprache wechseln' })).toBeVisible();
  });

  test('should maintain language preference across navigation', async ({ page }) => {
    await page.goto('http://localhost:3001/de');

    // Navigate to pricing page
    await page.getByRole('link', { name: 'Preise' }).click();

    // Verify we're still on German version
    await expect(page).toHaveURL(/\/de\/pricing/);
  });

  test('should display German footer content', async ({ page }) => {
    await page.goto('http://localhost:3001/de');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer links are in German
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: 'Nutzungsbedingungen' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Datenschutzerklärung' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Cookie-Richtlinie' })).toBeVisible();
  });

  test('should display German FAQ section', async ({ page }) => {
    await page.goto('http://localhost:3001/de');

    // Scroll to FAQ section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1000));

    // Check for German FAQ heading
    await expect(page.getByRole('heading', { name: 'Häufig gestellte Fragen' })).toBeVisible();
  });
});

test.describe('Marketing Site - English Translation', () => {
  test('should display correct metadata for German pages', async ({ page }) => {
    await page.goto('http://localhost:3001/de');

    // Check page title
    await expect(page).toHaveTitle(/Acme/);
  });

  test('should display correct metadata for English pages', async ({ page }) => {
    await page.goto('http://localhost:3001/en');

    // Check page title
    await expect(page).toHaveTitle(/Acme/);
  });

  test('should display English FAQ section', async ({ page }) => {
    await page.goto('http://localhost:3001/en');

    // Scroll to FAQ section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1000));

    // Check for English FAQ heading
    await expect(page.getByRole('heading', { name: 'Frequently Asked Questions' })).toBeVisible();
  });
});

test.describe('Marketing Site - Locale Switching', () => {
  test('should switch from German to English when navigating', async ({ page }) => {
    // Start on German homepage
    await page.goto('http://localhost:3001/de');
    await expect(page.getByRole('button', { name: 'Produkt' })).toBeVisible();

    // Navigate to English version by changing URL
    await page.goto('http://localhost:3001/en');
    await expect(page.getByRole('button', { name: 'Product' })).toBeVisible();
  });

  test('should maintain locale in auth links', async ({ page }) => {
    await page.goto('http://localhost:3001/de');

    // Check that sign-in and sign-up links maintain locale
    const signInLink = page.getByRole('link', { name: 'Anmelden' });
    await expect(signInLink).toBeVisible();
  });
});
