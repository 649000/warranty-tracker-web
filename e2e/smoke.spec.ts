import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('smoke', () => {
  test('landing page renders the headline', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Know what.s covered/ })).toBeVisible();
  });

  test('guarded route redirects anonymous users to sign in', async ({ page }) => {
    await page.goto('/warranties');
    await expect(page).toHaveURL(/\/login/);
  });

  test('sign up and add a product', async ({ page }) => {
    const email = `user-${Date.now()}@example.com`;

    await page.goto('/signup');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByRole('button', { name: 'Create account' }).click();

    // Land on the warranty list (empty state).
    await expect(page.getByRole('heading', { name: 'Add your first product' })).toBeVisible();

    // Add a product.
    await page.getByRole('link', { name: 'Add a product' }).first().click();
    await page.getByLabel('Product name').fill('Sony WH-1000XM4');
    await page.getByRole('button', { name: 'Add product' }).click();

    // Back on the list, the product appears.
    await expect(page.getByText('Sony WH-1000XM4')).toBeVisible();

    // Accessibility: the populated list passes AXE.
    const listResults = await new AxeBuilder({ page }).analyze();
    expect(listResults.violations).toEqual([]);

    // Open the detail page and check it too.
    await page.getByText('Sony WH-1000XM4').click();
    await expect(page.getByRole('heading', { name: 'Coverage' })).toBeVisible();
    const detailResults = await new AxeBuilder({ page }).analyze();
    expect(detailResults.violations).toEqual([]);
  });
});
