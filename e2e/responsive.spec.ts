import { expect, test, type Page } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/terms', '/privacy'];

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

for (const viewport of viewports) {
  test.describe(`responsive: ${viewport.name} (${viewport.width}px)`, () => {
    test.use({ viewport });

    for (const route of publicRoutes) {
      test(`no horizontal overflow on ${route}`, async ({ page }) => {
        await page.goto(route);
        await expect(page.locator('app-root > *')).not.toHaveCount(0);
        await expectNoHorizontalOverflow(page);
      });
    }
  });
}
