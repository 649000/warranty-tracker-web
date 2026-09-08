import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

test.describe('smoke', () => {
  test('landing page renders the headline', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Know what.s covered/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('guarded route redirects anonymous users to sign in', async ({ page }) => {
    await page.goto('/warranties');
    await expect(page).toHaveURL(/\/login/);
  });

  test('sign up and add a product', async ({ page }) => {
    const email = `user-${Date.now()}@example.com`;

    await page.goto('/signup');
    await expectNoHorizontalOverflow(page);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByRole('button', { name: 'Create account' }).click();

    // Land on the warranty list (empty state).
    await expect(page.getByRole('heading', { name: 'Add your first product' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    // Add a product.
    await page.getByRole('link', { name: 'Add a product' }).first().click();
    await expect(page.getByRole('heading', { name: 'Add product' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.getByLabel('Product name').fill('Sony WH-1000XM4');
    await page.getByLabel('Category').click();
    await page.getByRole('option', { name: 'Audio' }).click();

    // Brand autocomplete suggests and fills, price validates.
    const brandInput = page.locator('mat-form-field', { hasText: 'Brand' }).locator('input');
    await brandInput.fill('Son');
    await expect(page.getByRole('option', { name: 'Sony' })).toBeVisible();
    await page.getByRole('option', { name: 'Sony' }).click();
    await expect(brandInput).toHaveValue('Sony');
    const priceInput = page.locator('mat-form-field', { hasText: 'Price' }).locator('input');
    await priceInput.fill('0.00099');
    await priceInput.press('Tab');
    await expect(page.getByText('Price Can Have at Most 2 Decimal Places')).toBeVisible();
    await priceInput.fill('399.99');

    await page.getByRole('button', { name: 'Add product' }).click();

    // Back on the list, the product appears.
    await expect(page.getByText('Sony WH-1000XM4')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    // Accessibility: the populated list passes AXE.
    const listResults = await new AxeBuilder({ page }).analyze();
    expect(listResults.violations).toEqual([]);

    // Open the detail page and check it too.
    await page.getByText('Sony WH-1000XM4').click();
    await expect(page.getByRole('heading', { name: 'Product Details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Coverage' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    const detailResults = await new AxeBuilder({ page }).analyze();
    expect(detailResults.violations).toEqual([]);
  });

  test('sign in with email lands on the warranty list', async ({ page }) => {
    const email = `user-${Date.now()}@example.com`;
    const password = 'password123';

    // Create the account first.
    await page.goto('/signup');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('heading', { name: 'Add your first product' })).toBeVisible();

    // Sign out back to the landing page.
    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { name: /Know what.s covered/i })).toBeVisible();

    // Sign back in and land on the warranty list without a blank screen.
    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('heading', { name: 'Add your first product' })).toBeVisible();
  });
});
