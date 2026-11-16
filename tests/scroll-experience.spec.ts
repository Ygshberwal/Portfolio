import { test, expect, type Page } from '@playwright/test';

async function desktopStory(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('#projects')).toHaveClass(/is-scroll-story/);
  await page.evaluate(() => document.fonts.ready);
}

async function chapterPosition(page: Page, index: number) {
  // Use the chapter controls to locate the actual pinned-scroll position.
  await page.locator(`[data-chapter="${index}"]`).click();
  await expect(page.locator('#projects')).toHaveAttribute('data-active-chapter', String(index));
  await expect.poll(async () => {
    const card = page.locator('.featured-project').nth(index);
    const box = await card.boundingBox();
    return box ? Math.abs(box.x - 100) < 4 : false;
  }).toBe(true);
}

test('desktop scroll story advances, reverses, and links to project notes', async ({ page }) => {
  await desktopStory(page);
  await chapterPosition(page, 1);
  await expect(page.locator('[data-chapter="1"]')).toHaveAttribute('aria-current', 'step');
  await chapterPosition(page, 2);
  await page.screenshot({ path: `test-results/scroll-research-${test.info().project.name}.png` });
  await chapterPosition(page, 0);
  await page.locator('#featured-flowboard .project-intro a').first().click();
  await expect(page).toHaveURL(/\/work\/flowboard\/$/);
});

test('keyboard focus brings an offscreen project into view without trapping focus', async ({ page }) => {
  await desktopStory(page);
  await page.locator('#featured-flowboard .project-actions a').last().focus();
  await page.keyboard.press('Tab');
  const nextProject = page.locator('#featured-vehicle-parking .cover-link');
  await expect(nextProject).toBeFocused();
  await expect(page.locator('#projects')).toHaveAttribute('data-active-chapter', '1');
  await expect.poll(async () => {
    const box = await nextProject.boundingBox();
    return !!box && box.x >= 0 && box.x + box.width <= 1440 && box.y >= 0 && box.y + box.height <= 1000;
  }).toBe(true);
  await page.getByRole('link', { name: 'Explore all 9 projects' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/work\/$/);
});

test('native wheel scrolling scrubs the project sequence in both directions', async ({ page }) => {
  await desktopStory(page);
  await chapterPosition(page, 0);
  const start = await page.evaluate(() => scrollY);
  await page.mouse.move(1300, 500);
  await page.mouse.wheel(0, 900);
  await expect.poll(async () => (await page.evaluate(() => scrollY)) - start).toBeGreaterThan(500);
  await expect.poll(() => page.locator('#featured-flowboard').evaluate(element => element.getBoundingClientRect().x)).toBeLessThan(-400);
  const forward = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, -500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(forward - 300);
  await expect.poll(() => page.locator('#featured-flowboard').evaluate(element => element.getBoundingClientRect().x)).toBeGreaterThan(-500);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('mobile, short screens, and reduced motion use the normal vertical layout', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 650 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/motion-ready/);
    await expect(page.locator('#projects')).not.toHaveClass(/is-scroll-story/);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#projects')).not.toHaveClass(/is-scroll-story/);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('.story-navigation')).toBeHidden();
  await expect(page.locator('.featured-project')).toHaveCount(3);
});

test('resizing and changing motion preference cleanly tears down and restores pins', async ({ page }) => {
  await desktopStory(page);
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  await chapterPosition(page, 2);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#projects')).not.toHaveClass(/is-scroll-story/);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('.featured-grid')).not.toHaveAttribute('style', /translate/);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('#projects')).toHaveClass(/is-scroll-story/);
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveClass(/motion-ready/);
  await expect(page.locator('.hero-copy')).not.toHaveAttribute('style', /translate/);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
});

test('print and no-JavaScript layouts never retain horizontal clipping or pin spacers', async ({ page, browser }) => {
  await desktopStory(page);
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('#projects')).not.toHaveClass(/is-scroll-story/);
  await page.emulateMedia({ media: 'screen' });
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  await expect(page.locator('.pin-spacer')).toHaveCount(1);

  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  const fallback = await context.newPage();
  await fallback.goto('http://127.0.0.1:4322/');
  expect(await fallback.locator('.featured-grid').evaluate(element => getComputedStyle(element).display)).toBe('grid');
  await expect(fallback.locator('.pin-spacer')).toHaveCount(0);
  await expect(fallback.locator('.story-navigation')).toBeHidden();
  await context.close();
});
