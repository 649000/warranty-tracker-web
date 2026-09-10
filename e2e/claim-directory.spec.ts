import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('claim directory', () => {
  test('suggests a claim route, honours an override, and resets', async ({ page }) => {
    const email = `claim-${Date.now()}@example.com`;

    // Create an account.
    await page.goto('/signup');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/warranties/);

    // Add an Apple product (matches a seeded claim contact).
    await page.getByRole('link', { name: 'Add Product' }).first().click();
    await expect(page.getByRole('heading', { name: 'Add product' })).toBeVisible();
    await page.getByLabel('Product name').fill('MacBook Pro');
    await page.getByLabel('Category').click();
    await page.getByRole('option', { name: 'Computers' }).click();
    const brandInput = page.locator('mat-form-field', { hasText: 'Brand' }).locator('input');
    await brandInput.fill('Apple');
    await page.getByRole('option', { name: 'Apple', exact: true }).click();
    await page.getByRole('button', { name: 'Add product' }).click();

    // Open the detail page and expand the coverage.
    await page.getByText('MacBook Pro').first().click();
    await expect(page.getByRole('heading', { name: 'Coverage' })).toBeVisible();
    await page.locator('.coverage-summary').first().click();

    // The directory suggestion appears.
    const claimBlock = page.locator('.claim-block');
    await expect(claimBlock.getByText('How to Claim')).toBeVisible({ timeout: 15_000 });
    await expect(claimBlock.getByText('Suggested')).toBeVisible();
    await expect(claimBlock.getByText(/Locate your proof of purchase/)).toBeVisible();
    await expect(claimBlock.getByRole('link', { name: /support\.apple\.com/ }).first()).toBeVisible();

    // Accessibility: the expanded claim panel passes AXE.
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);

    // Override the contact through the coverage dialog.
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit Coverage' })).toBeVisible();
    const emailField = page.locator('mat-form-field', { hasText: 'Email' }).locator('input');
    await emailField.fill('my-warranty@example.com');
    await page.getByRole('button', { name: 'Save' }).click();

    // The user override wins.
    await expect(page.locator('.claim-block').getByText('Your Contact')).toBeVisible();
    await expect(page.locator('.claim-block').getByText('my-warranty@example.com')).toBeVisible();

    // Reset restores the suggestion.
    await page.getByRole('button', { name: 'Reset to Suggested' }).click();
    await expect(page.locator('.claim-block').getByText('Suggested')).toBeVisible();
    await expect(
      page.locator('.claim-block').getByRole('link', { name: /support\.apple\.com/ }).first(),
    ).toBeVisible();
  });
});
