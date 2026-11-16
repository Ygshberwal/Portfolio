import { test, expect } from '@playwright/test';

// Subject regions reviewed against the supplied images (normalized coordinates),
// not face detection or an alteration of the original files.
const subjectRegions: Record<string, { left: number; top: number; right: number; bottom: number }> = {
  'yogesh-portrait': { left: .2, top: .12, right: .9, bottom: .65 },
  'yogesh-candid': { left: .38, top: .29, right: .7, bottom: .55 },
  'iit-mandi': { left: .33, top: .35, right: .7, bottom: .99 },
  'hockey-medals': { left: .035, top: .3, right: .975, bottom: .98 },
  'hockey-final': { left: .025, top: .46, right: .98, bottom: .79 },
  'trekking': { left: .16, top: .45, right: .84, bottom: .98 },
  'travel-window': { left: .13, top: .5, right: .66, bottom: .8 },
};

test('photo crops preserve the reviewed subjects at phone, tablet, and desktop widths', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const frames = page.locator('.photo-frame');
    await expect(frames).toHaveCount(7);
    for (const frame of await frames.all()) {
      await frame.scrollIntoViewIfNeeded();
      const image = frame.locator('img');
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      const crop = await frame.evaluate(element => {
        const viewport = element.querySelector('.photo-viewport')!.getBoundingClientRect();
        const img = element.querySelector('img')!;
        const style = getComputedStyle(img);
        const positions = style.objectPosition.split(' ').map(value => parseFloat(value) / 100);
        const scale = Math.max(viewport.width / img.naturalWidth, viewport.height / img.naturalHeight);
        const fullWidth = img.naturalWidth * scale;
        const fullHeight = img.naturalHeight * scale;
        const left = (fullWidth - viewport.width) * positions[0];
        const top = (fullHeight - viewport.height) * positions[1];
        const bounds = element.getBoundingClientRect();
        return {
          name: element.getAttribute('data-photo')!,
          left: left / fullWidth, top: top / fullHeight,
          right: (left + viewport.width) / fullWidth, bottom: (top + viewport.height) / fullHeight,
          withinPage: bounds.left >= -1 && bounds.right <= innerWidth + 1,
          fit: style.objectFit,
        };
      });
      const subject = subjectRegions[crop.name];
      expect(crop.withinPage, `${crop.name} at ${width}px`).toBe(true);
      expect(crop.fit).toBe('cover');
      expect(crop.left, `${crop.name}: left edge`).toBeLessThanOrEqual(subject.left);
      expect(crop.top, `${crop.name}: top edge`).toBeLessThanOrEqual(subject.top);
      expect(crop.right, `${crop.name}: right edge`).toBeGreaterThanOrEqual(subject.right);
      expect(crop.bottom, `${crop.name}: bottom edge`).toBeGreaterThanOrEqual(subject.bottom);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('gallery frames align evenly and portrait borders stay inside their figures', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const selector of ['.hockey-gallery', '.outdoor-gallery']) {
    const gallery = page.locator(selector);
    await gallery.scrollIntoViewIfNeeded();
    const geometry = await gallery.evaluate(element => {
      const frames = [...element.querySelectorAll('.photo-frame')].map(frame => frame.getBoundingClientRect());
      return { width: innerWidth, frames: frames.map(frame => ({ top: frame.top, width: frame.width, height: frame.height, bottom: frame.bottom })) };
    });
    expect(Math.abs(geometry.frames[0].width - geometry.frames[1].width)).toBeLessThan(1);
    expect(Math.abs(geometry.frames[0].height - geometry.frames[1].height)).toBeLessThan(1);
    if (geometry.width > 760) expect(Math.abs(geometry.frames[0].top - geometry.frames[1].top)).toBeLessThan(1);
    else expect(geometry.frames[1].top).toBeGreaterThan(geometry.frames[0].bottom);
  }
  for (const selector of ['.hero-portrait', '.profile-photo', '.education-photo']) {
    const figure = page.locator(selector);
    await figure.scrollIntoViewIfNeeded();
    const contained = await figure.evaluate(element => {
      const outer = element.getBoundingClientRect();
      const frame = element.querySelector('.photo-frame')!.getBoundingClientRect();
      const caption = element.querySelector('figcaption')!.getBoundingClientRect();
      return frame.left >= outer.left - 1 && frame.right <= outer.right + 1 && caption.top >= frame.bottom;
    });
    expect(contained).toBe(true);
  }
  for (const [selector, name] of [['.hero', 'hero'], ['#about', 'about'], ['#education', 'education'], ['#beyond-code', 'personal']]) {
    await page.locator(selector).screenshot({ path: `test-results/framing-${name}-${info.project.name}.png` });
  }
});

test('project screenshots and the presentation photo retain their full image proportions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const slug of ['flowboard', 'vehicle-parking', 'sanskrit-pitch']) {
    await page.goto(`/work/${slug}/`);
    for (const image of await page.locator('.project-gallery img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      const heightError = await image.evaluate((img: HTMLImageElement) => {
        const box = img.getBoundingClientRect();
        // naturalWidth/naturalHeight are density-corrected and rounded for
        // responsive srcsets. The declared source dimensions are exact.
        const ratio = Number(img.getAttribute('width')) / Number(img.getAttribute('height'));
        return Math.abs(box.height - box.width / ratio);
      });
      expect(heightError).toBeLessThan(1);
    }
  }
  await page.goto('/work/');
  for (const image of await page.locator('.screenshot-frame img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    const fullImageFits = await image.evaluate((img: HTMLImageElement) => {
      const image = img.getBoundingClientRect();
      const frame = img.parentElement!.getBoundingClientRect();
      const style = getComputedStyle(img);
      const contentWidth = image.width - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth);
      const contentHeight = image.height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth);
      const ratio = Number(img.getAttribute('width')) / Number(img.getAttribute('height'));
      return Math.abs(contentHeight - contentWidth / ratio) < 1
        && image.left >= frame.left - 1 && image.right <= frame.right + 1
        && image.top >= frame.top - 1 && image.bottom <= frame.bottom + 1;
    });
    expect(fullImageFits).toBe(true);
  }
});
