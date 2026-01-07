import { test, expect } from '@playwright/test';

// Note: These tests require authentication. In a real scenario, you'd need to
// set up auth state or use a test user. For now, these tests verify the UI structure.

test.describe('Ticket Management - Admin Views', () => {
  test('Tickets page shows correct German translations', async ({ page }) => {
    // Navigate to tickets management (assumes logged in or accessible)
    await page.goto('http://localhost:3000/de/organizations/test-org/settings/organization/tickets');

    // Check for key German translations
    await expect(page.getByText('Ticket-Verwaltung')).toBeVisible();
    await expect(page.getByText('Verwalten Sie Ticket-Typen für Ihre Organisation')).toBeVisible();

    // Check table headers if tickets exist
    const nameHeader = page.getByRole('columnheader', { name: 'Name' });
    const priceHeader = page.getByRole('columnheader', { name: 'Preis' });

    if (await nameHeader.isVisible()) {
      await expect(nameHeader).toBeVisible();
      await expect(priceHeader).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Bestand' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Aktionen' })).toBeVisible();
    }
  });

  test('Tickets page shows correct English translations', async ({ page }) => {
    await page.goto('http://localhost:3000/en/organizations/test-org/settings/organization/tickets');

    await expect(page.getByText('Ticket Management')).toBeVisible();
    await expect(page.getByText('Manage ticket types for your organization')).toBeVisible();
  });

  test('Create ticket button navigates to create page', async ({ page }) => {
    await page.goto('http://localhost:3000/de/organizations/test-org/settings/organization/tickets');

    const createButton = page.getByRole('link', { name: /Ticket erstellen|Erstes Ticket erstellen/i });
    await expect(createButton).toBeVisible();

    await createButton.click();
    await expect(page).toHaveURL(/\/tickets\/create/);
  });
});

test.describe('Purchase Management - Admin Views', () => {
  test('Purchases page shows correct German translations', async ({ page }) => {
    await page.goto('http://localhost:3000/de/organizations/test-org/settings/organization/purchases');

    await expect(page.getByText('Kaufverwaltung')).toBeVisible();
    await expect(page.getByText(/Alle Ticketkäufe für Ihre Organisation/)).toBeVisible();

    // Check action buttons
    await expect(page.getByRole('link', { name: 'Analytik' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ticket ausstellen' })).toBeVisible();
  });

  test('Purchases page shows correct English translations', async ({ page }) => {
    await page.goto('http://localhost:3000/en/organizations/test-org/settings/organization/purchases');

    await expect(page.getByText('Purchase Management')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Analytics' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Issue Ticket' })).toBeVisible();
  });

  test('Analytics button navigates to analytics page', async ({ page }) => {
    await page.goto('http://localhost:3000/de/organizations/test-org/settings/organization/purchases');

    await page.getByRole('link', { name: 'Analytik' }).click();
    await expect(page).toHaveURL(/\/purchases\/analytics/);

    // Verify analytics page content
    await expect(page.getByText('Analytik')).toBeVisible();
    await expect(page.getByText('Gesamtumsatz')).toBeVisible();
    await expect(page.getByText('Verkaufte Tickets')).toBeVisible();
    await expect(page.getByText('Durchschnittlicher Bestellwert')).toBeVisible();
  });

  test('Issue Ticket button navigates to issue page', async ({ page }) => {
    await page.goto('http://localhost:3000/de/organizations/test-org/settings/organization/purchases');

    await page.getByRole('link', { name: 'Ticket ausstellen' }).click();
    await expect(page).toHaveURL(/\/purchases\/issue/);

    // Verify issue ticket form content
    await expect(page.getByText('Freiticket ausstellen')).toBeVisible();
    await expect(page.getByText('Kostenloses Ticket ohne Zahlung an einen Kunden ausstellen')).toBeVisible();
    await expect(page.getByLabel('Ticket-Typ')).toBeVisible();
    await expect(page.getByLabel('E-Mail-Adresse')).toBeVisible();
  });
});

test.describe('Analytics Dashboard', () => {
  test('Analytics page shows all metric cards', async ({ page }) => {
    await page.goto('http://localhost:3000/de/organizations/test-org/settings/organization/purchases/analytics');

    // Verify metric cards
    await expect(page.getByText('Gesamtumsatz')).toBeVisible();
    await expect(page.getByText('Verkaufte Tickets')).toBeVisible();
    await expect(page.getByText('Durchschnittlicher Bestellwert')).toBeVisible();

    // Verify chart sections
    await expect(page.getByText('Verkaufsverlauf')).toBeVisible();
    await expect(page.getByText('Verkäufe nach Ticket-Typ')).toBeVisible();
  });

  test('Date range selector works', async ({ page }) => {
    await page.goto('http://localhost:3000/de/organizations/test-org/settings/organization/purchases/analytics');

    // Click on the date range selector
    const selector = page.getByRole('combobox');
    await expect(selector).toBeVisible();
    await selector.click();

    // Verify options are available
    await expect(page.getByRole('option', { name: 'Letzte 7 Tage' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Letzte 30 Tage' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Letzte 90 Tage' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Gesamter Zeitraum' })).toBeVisible();
  });
});

test.describe('Issue Complimentary Ticket Form', () => {
  test('Form has all required fields', async ({ page }) => {
    await page.goto('http://localhost:3000/de/organizations/test-org/settings/organization/purchases/issue');

    // Verify all form fields
    await expect(page.getByText('Ticket-Typ')).toBeVisible();
    await expect(page.getByText('E-Mail-Adresse')).toBeVisible();
    await expect(page.getByText('Kundenname (optional)')).toBeVisible();
    await expect(page.getByText('Telefonnummer (optional)')).toBeVisible();
    await expect(page.getByText('Grund (optional)')).toBeVisible();

    // Verify action buttons
    await expect(page.getByRole('button', { name: 'Abbrechen' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Freiticket ausstellen' })).toBeVisible();
  });

  test('Cancel button navigates back', async ({ page }) => {
    await page.goto('http://localhost:3000/de/organizations/test-org/settings/organization/purchases/issue');

    await page.getByRole('button', { name: 'Abbrechen' }).click();

    // Should navigate back to purchases page
    await expect(page).toHaveURL(/\/purchases$/);
  });
});
