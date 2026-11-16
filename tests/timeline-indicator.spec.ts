import { test, expect, type Page } from '@playwright/test';

async function readEntry(page: Page, timeline: string, index: number) {
  const root = page.locator(`[data-timeline="${timeline}"]`);
  await expect(root).toHaveAttribute('data-timeline-ready', '');
  await page.evaluate(({ timeline, index }) => {
    const root = document.querySelector<HTMLElement>(`[data-timeline="${timeline}"]`)!;
    const entry = root.querySelectorAll<HTMLElement>(':scope > [data-timeline-entry]')[index];
    const title = entry.querySelector('h3')!.getBoundingClientRect();
    window.scrollTo({ top: scrollY + title.top + title.height / 2 - innerHeight * 0.5, behavior: 'instant' });
  }, { timeline, index });
  await expect(root).toHaveAttribute('data-timeline-index', String(index));
  await expect(root.locator(':scope > [data-timeline-active]')).toHaveCount(1);
  await expect(root.locator(':scope > [data-timeline-entry]').nth(index)).toHaveAttribute('data-timeline-active', '');
  return root;
}

test('experience light follows the reading position and reverses up the rail', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const root = await readEntry(page, 'experience', 0);
  const firstY = await root.evaluate(element => parseFloat(element.style.getPropertyValue('--timeline-marker-y')));
  await readEntry(page, 'experience', 2);
  const amazonY = await root.evaluate(element => parseFloat(element.style.getPropertyValue('--timeline-marker-y')));
  expect(amazonY).toBeGreaterThan(firstY);
  await expect.poll(() => root.evaluate(element => {
    const light = getComputedStyle(element, '::after');
    const position = new DOMMatrixReadOnly(light.transform);
    return Math.abs(position.m42 + parseFloat(light.height) / 2 - parseFloat(element.style.getPropertyValue('--timeline-marker-y')));
  })).toBeLessThan(1);
  // The existing CURRENT badge still denotes employment, not reading position.
  await expect(page.locator('.current-tag')).toHaveText('CURRENT');
  await expect(root.locator(':scope > article').first()).not.toHaveAttribute('data-timeline-active', '');
  await page.screenshot({ path: `test-results/timeline-experience-${info.project.name}.png` });
  await readEntry(page, 'experience', 3);
  await page.locator('[data-timeline="experience"] > article').last().evaluate(entry => {
    const end = entry.querySelector(':scope > p:last-of-type')!.getBoundingClientRect().bottom;
    window.scrollTo({ top: scrollY + end - innerHeight * 0.5 + 2, behavior: 'instant' });
  });
  await expect.poll(() => root.evaluate(element => Number(element.style.getPropertyValue('--timeline-progress')))).toBe(1);
  await readEntry(page, 'experience', 1);
  expect(await root.evaluate(element => parseFloat(element.style.getPropertyValue('--timeline-marker-y')))).toBeLessThan(amazonY);
});

test('education light aligns with its milestone and preserves list semantics', async ({ page }, info) => {
  await page.goto('/');
  const root = await readEntry(page, 'education', 1);
  await expect(root).toHaveJSProperty('tagName', 'OL');
  await expect(root.locator(':scope > li')).toHaveCount(3);
  const horizontalError = await root.evaluate(element => {
    const entry = element.querySelector<HTMLElement>('[data-timeline-active]')!;
    const dot = getComputedStyle(entry, '::before');
    const light = getComputedStyle(element, '::after');
    const dotX = entry.getBoundingClientRect().left + parseFloat(dot.left) + parseFloat(dot.width) / 2;
    const lightX = element.getBoundingClientRect().left + element.clientLeft + parseFloat(light.left);
    return Math.abs(dotX - lightX);
  });
  expect(horizontalError).toBeLessThan(1);
  const titleDoesNotOverlap = await root.locator('[data-timeline-active]').evaluate(entry => {
    const title = entry.querySelector('h3')!.getBoundingClientRect();
    const degree = entry.querySelector('p')!.getBoundingClientRect();
    return title.bottom <= degree.top + 1;
  });
  expect(titleDoesNotOverlap).toBe(true);
  await page.screenshot({ path: `test-results/timeline-education-${info.project.name}.png` });
  await readEntry(page, 'education', 2);
  await expect(root.locator('[data-timeline-active]')).toContainText('Kurukshetra');
});

test('the central entry activates before its date reaches the old upper reading threshold', async ({ page }) => {
  await page.goto('/');
  for (const timeline of ['experience', 'education']) {
    const root = page.locator(`[data-timeline="${timeline}"]`);
    await expect(root).toHaveAttribute('data-timeline-ready', '');
    await page.evaluate(timeline => {
      const entry = document.querySelector(`[data-timeline="${timeline}"] > [data-timeline-entry]:nth-child(2)`)!;
      const body = entry.querySelector('p')!.getBoundingClientRect();
      window.scrollTo({ top: scrollY + body.top + body.height / 2 - innerHeight * 0.5, behavior: 'instant' });
    }, timeline);
    await expect(root).toHaveAttribute('data-timeline-index', '1');
    const centralPosition = await root.evaluate(element => {
      const entry = element.querySelector<HTMLElement>('[data-timeline-active]')!;
      const date = entry.querySelector('.experience-meta, .micro')!.getBoundingClientRect();
      return {
        lightY: element.getBoundingClientRect().top + parseFloat(element.style.getPropertyValue('--timeline-marker-y')),
        middle: innerHeight * 0.5,
        dateStillBelowOldThreshold: date.top > innerHeight * 0.38,
      };
    });
    expect(centralPosition.dateStillBelowOldThreshold).toBe(true);
    expect(Math.abs(centralPosition.lightY - centralPosition.middle)).toBeLessThan(1);
  }
});

test('the light tracks the middle continuously while reading within one long entry', async ({ page }) => {
  await page.goto('/');
  await page.locator('.experience details').nth(1).evaluate((details: HTMLDetailsElement) => { details.open = true; });
  const root = await readEntry(page, 'experience', 2);
  const initial = await root.evaluate(element => parseFloat(element.style.getPropertyValue('--timeline-marker-y')));
  await page.evaluate(() => window.scrollBy({ top: 70, behavior: 'instant' }));
  await expect.poll(() => root.evaluate(element => parseFloat(element.style.getPropertyValue('--timeline-marker-y')))).toBeGreaterThan(initial + 65);
  await expect(root).toHaveAttribute('data-timeline-index', '2');
  await expect.poll(() => root.evaluate(element => {
    const light = getComputedStyle(element, '::after');
    const matrix = new DOMMatrixReadOnly(light.transform);
    return Math.abs(element.getBoundingClientRect().top + matrix.m42 + parseFloat(light.height) / 2 - innerHeight * 0.5);
  })).toBeLessThan(1);
  expect(await root.evaluate(element => getComputedStyle(element, '::after').transitionProperty)).not.toContain('transform');
  await page.evaluate(() => window.scrollBy({ top: -40, behavior: 'instant' }));
  await expect.poll(() => root.evaluate(element => parseFloat(element.style.getPropertyValue('--timeline-marker-y')))).toBeLessThan(initial + 35);
});

test('small movements between entries do not flicker, and reverse scrolling switches symmetrically', async ({ page }) => {
  await page.goto('/');
  const root = await readEntry(page, 'experience', 0);
  const crossover = await root.evaluate(element => {
    const entries = element.querySelectorAll(':scope > [data-timeline-entry]');
    const blocks = [...entries[0].querySelectorAll(':scope > h3, :scope > p, :scope > details, :scope > .small-copy')];
    const firstEnd = Math.max(...blocks.map(block => block.getBoundingClientRect().bottom));
    const secondStart = entries[1].querySelector('h3')!.getBoundingClientRect().top;
    return scrollY + (firstEnd + secondStart) / 2 - innerHeight * 0.5;
  });
  for (const [offset, index] of [[-20, 0], [-1, 0], [1, 0], [18, 1], [1, 1], [-1, 1], [-18, 0]]) {
    await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), crossover + offset);
    await expect(root).toHaveAttribute('data-timeline-index', String(index));
    // Let the coalesced scroll update run even when the active index is unchanged.
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await expect(root).toHaveAttribute('data-timeline-index', String(index));
  }
});

test('expanding experience and resizing recompute the rail rather than leaving a stale marker', async ({ page }) => {
  await page.goto('/');
  const root = await readEntry(page, 'experience', 3);
  const initialSpan = await root.evaluate(element => parseFloat(element.style.getPropertyValue('--timeline-span')));
  await page.locator('.experience details').first().evaluate((details: HTMLDetailsElement) => { details.open = true; });
  await expect.poll(() => root.evaluate(element => parseFloat(element.style.getPropertyValue('--timeline-span')))).toBeGreaterThan(initialSpan + 20);
  await readEntry(page, 'experience', 3);
  await page.setViewportSize({ width: 375, height: 812 });
  await readEntry(page, 'experience', 2);
  await page.getByText('A closer look at the engineering', { exact: false }).focus();
  await expect(root).toHaveAttribute('data-timeline-index', '2');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('glow pauses offscreen and switches to a static highlight for reduced motion and print', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const root = await readEntry(page, 'experience', 1);
  await expect(root).toHaveAttribute('data-timeline-visible', '');
  expect(await root.evaluate(element => getComputedStyle(element, '::after').animationPlayState)).toBe('running');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(root).not.toHaveAttribute('data-timeline-visible', '');
  expect(await root.evaluate(element => getComputedStyle(element, '::after').animationPlayState)).toBe('paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await readEntry(page, 'experience', 2);
  expect(await root.evaluate(element => getComputedStyle(element, '::after').display)).toBe('none');
  expect(await root.locator('[data-timeline-active]').evaluate(element => getComputedStyle(element, '::before').transitionDuration)).toBe('0s');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  expect(await root.evaluate(element => getComputedStyle(element, '::after').display)).not.toBe('none');
  await page.emulateMedia({ media: 'print' });
  expect(await root.evaluate(element => getComputedStyle(element, '::after').display)).toBe('none');
});

test('without JavaScript both timelines remain readable and have no animated marker', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/');
  for (const name of ['experience', 'education']) {
    const root = page.locator(`[data-timeline="${name}"]`);
    await expect(root).not.toHaveAttribute('data-timeline-ready', '');
    expect(await root.evaluate(element => getComputedStyle(element, '::after').content)).toBe('none');
  }
  await expect(page.locator('.timeline > article')).toHaveCount(4);
  await expect(page.locator('.education-list > li')).toHaveCount(3);
  await context.close();
});
