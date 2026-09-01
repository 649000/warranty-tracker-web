import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/terms', '/privacy'];

for (const route of publicRoutes) {
  test(`accessibility: ${route} has no detectable violations`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('app-root > *')).not.toHaveCount(0);

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
