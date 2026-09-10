import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { verifyEmailViaEmulator } from './helpers/verify-email';

const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/terms', '/privacy'];

for (const route of publicRoutes) {
  test(`accessibility: ${route} has no detectable violations`, async ({ page }) => {
    await page.goto(route);
    // Wait for the lazy-loaded route content (every route has an h1) so axe
    // never runs against an empty shell on slower viewport profiles.
    await expect(page.locator('h1').first()).toBeAttached();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('accessibility: unknown route renders the 404 page with no violations', async ({ page }) => {
  await page.goto('/this-does-not-exist');
  await expect(page.getByText('Page not found')).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('accessibility: account settings with expiry reminder control has no violations', async ({
  page,
}) => {
  const email = `axe-${Date.now()}@example.com`;
  const password = 'password123';

  await page.goto('/signup');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await verifyEmailViaEmulator(page, email);
  await expect(page.getByRole('heading', { name: 'Add your first product' })).toBeVisible();

  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('menuitem', { name: 'Account Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Account Settings' })).toBeVisible();

  const toggle = page.getByRole('switch', { name: 'Expiry email reminders' });
  await expect(toggle).toBeVisible();
  await expect(toggle).toBeEnabled();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
