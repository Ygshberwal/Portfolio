import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { projects } from '../src/data/portfolio';

test('homepage is accessible, renders the portrait, and exposes professional links', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Yogesh Berwal/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Complex systems.');
  await expect(page.locator('.hero-portrait img')).toBeVisible();
  await expect(page.locator('.engineering-index')).toHaveCount(0);
  await expect(page.locator('.hero-socials').getByRole('link', { name: 'LinkedIn' })).toBeVisible();
  await page.getByText('A closer look at the engineering', { exact: false }).click();
  await expect(page.getByText(/Integrated rate limiting across 18 APIs/)).toBeVisible();
  const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(audit.violations).toEqual([]);
  expect(errors).toEqual([]);
  await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await page.screenshot({ path: `test-results/home-${info.project.name}.png`, fullPage: true });
});

test('navigation works at mobile sizes with escape and link dismissal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await menu.click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Selected work' }).click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});

test('project filters expose the correct subset and reset', async ({ page }) => {
  await page.goto('/work/');
  await expect(page.locator('.project-directory article:visible')).toHaveCount(projects.length);
  await page.getByRole('button', { name: 'Data engineering', exact: true }).click();
  await expect(page.locator('.project-directory article:visible')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'MegaMart Capstone' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Showing 1 Data engineering project.');
  await page.getByRole('button', { name: /All work/ }).click();
  await expect(page.locator('.project-directory article:visible')).toHaveCount(projects.length);
  const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(audit.violations).toEqual([]);
});

for (const project of projects) {
  test(`${project.slug}: case study, accessibility, local links, and no overflow`, async ({ page, request }) => {
    await page.goto(`/work/${project.slug}/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(project.title);
    await expect(page.getByRole('link', { name: 'View source', exact: true })).toHaveAttribute('href', `https://github.com/Ygshberwal/${project.repo}`);
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(audit.violations).toEqual([]);
    const internalLinks = await page.locator('a[href^="/"]').evaluateAll(links => [...new Set(links.map(link => link.getAttribute('href')!.split('#')[0]))]);
    for (const link of internalLinks) expect((await request.get(link)).status()).toBe(200);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('homepage has no horizontal overflow at narrow and tablet widths', async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `viewport ${width}`).toBe(true);
  }
});

test('reduced motion and keyboard skip link', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await expect(page.locator('.hero-portrait')).not.toHaveAttribute('style', /translate/);
});

test('content and navigation remain available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('link', { name: 'Explore all 9 projects' }).click();
  await expect(page.locator('.project-directory article')).toHaveCount(9);
  await context.close();
});

test('all local anchors resolve and public output contains no credentials or internal names', async ({ page }) => {
  for (const path of ['/', '/work/', ...projects.map(project => `/work/${project.slug}/`)]) {
    await page.goto(path);
    const anchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute('href')!.slice(1)));
    for (const anchor of anchors) await expect(page.locator(`[id="${anchor}"]`)).toHaveCount(1);
    const html = await page.content();
    expect(html).not.toMatch(/AQ\.Ab8|X-Goog-Api-Key|ShipperOnboardingService|Gizmo|\[ADD|yogesh@example|older brief|DO NOT PUBLISH|BUILD NOTES/);
  }
});
