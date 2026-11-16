import { test, expect } from '@playwright/test';
import { researchPapers } from '../src/data/portfolio';

test('education is an ordered timeline and papers distinguish authorship and publication status', async ({ page }) => {
  await page.goto('/');
  const education = page.getByRole('list', { name: 'Education timeline, most recent first' });
  await expect(education.getByRole('listitem')).toHaveCount(3);
  await expect(education.getByRole('listitem').first()).toContainText('IIT Mandi');
  await expect(education).toContainText('Diplomas');
  const papers = page.getByRole('list', { name: 'Research papers' });
  await expect(papers.getByRole('listitem')).toHaveCount(2);
  await expect(papers.getByRole('listitem').first()).toContainText('First author');
  await expect(papers.getByRole('listitem').nth(1)).toContainText('Co-author');
  for (let index = 0; index < researchPapers.length; index++) {
    const paper = papers.getByRole('listitem').nth(index);
    await expect(paper).toContainText('May 2026');
    await expect(paper).toContainText('MBCC · IIT Mandi');
    await expect(paper).toContainText('Presented & accepted · Publication pending');
    await expect(paper.getByRole('link')).toHaveAttribute('href', researchPapers[index].documentUrl);
  }
});

test('selected photos and screenshots load, with contextual captions and no original-image publication', async ({ page, request }, info) => {
  await page.goto('/');
  const profile = page.getByRole('img', { name: /Black-and-white portrait of Yogesh/ });
  await profile.scrollIntoViewIfNeeded();
  await expect(profile).toBeVisible();
  const hockey = page.locator('.hockey-gallery');
  await hockey.scrollIntoViewIfNeeded();
  await expect(hockey.getByRole('img')).toHaveCount(2);
  await expect(hockey).toContainText('final whistle');
  await expect(hockey).toContainText('trophies');
  const images = await page.locator('img').evaluateAll(elements => elements.map(image => image.getAttribute('src')!));
  for (const src of images) {
    expect(src).toMatch(/^\/images\/.+\.webp$/);
    expect((await request.get(src)).status()).toBe(200);
  }
  await expect(page.locator('img[src^="/photos/"]')).toHaveCount(0);
  await page.locator('#education').screenshot({ path: `test-results/education-${info.project.name}.png` });
  await page.locator('#research').screenshot({ path: `test-results/research-${info.project.name}.png` });
  await page.locator('#beyond-code').screenshot({ path: `test-results/hockey-${info.project.name}.png` });
});

test('case studies show real screenshots, owner stories, and manuscript links', async ({ page }) => {
  await page.goto('/work/flowboard/');
  await expect(page.getByRole('region', { name: 'Application screenshots' }).getByRole('img')).toHaveCount(2);
  await expect(page.locator('.owner-story')).toContainText('I now use it every day');
  await expect(page.locator('.project-gallery')).toContainText('full planner workspace');
  await page.goto('/work/vehicle-parking/');
  await expect(page.getByRole('region', { name: 'Application screenshots' }).getByRole('img')).toHaveCount(1);
  await expect(page.locator('.project-gallery')).toContainText('fictional demo data');
  await expect(page.locator('.owner-story')).toContainText('original coursework implementation');
  await page.goto('/work/sanskrit-pitch/');
  await expect(page.locator('.paper-callout')).toContainText('Publication pending');
  await expect(page.getByRole('link', { name: 'Read manuscript', exact: true })).toHaveAttribute('href', researchPapers[0].documentUrl);
});
