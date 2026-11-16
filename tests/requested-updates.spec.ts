import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { identity } from '../src/data/portfolio';
import { projectImages } from '../src/data/media';

test('hero is portrait-led with LinkedIn and a genuine résumé download', async ({ page, request }, info) => {
  await page.goto('/');
  await expect(page.locator('.hero-portrait img')).toBeVisible();
  await expect(page.locator('.hero-portrait img')).toHaveAttribute('loading', 'eager');
  await expect(page.locator('.engineering-index')).toHaveCount(0);
  const linkedin = page.locator('.hero-socials').getByRole('link', { name: 'LinkedIn' });
  await expect(linkedin).toBeVisible();
  await expect(linkedin).toHaveAttribute('href', identity.linkedin);
  const downloadEvent = page.waitForEvent('download');
  await page.locator('.hero .resume-link').click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('Yogesh_Berwal_Resume.pdf');
  const response = await request.get('/resume.pdf');
  expect(response.status()).toBe(200);
  const body = await response.body();
  expect(body.subarray(0, 5).toString()).toBe('%PDF-');
  expect(body.equals(await readFile('public/resume.pdf'))).toBe(true);
  await page.screenshot({ path: `test-results/portrait-hero-${info.project.name}.png` });
});

test('FlowBoard has all three requested links and an uncropped planner', async ({ page }) => {
  await page.goto('/work/flowboard/');
  const actions = page.getByRole('group', { name: 'FlowBoard links' });
  await expect(actions.getByRole('link')).toHaveCount(3);
  await expect(actions.getByRole('link', { name: 'View source' })).toHaveAttribute('href', 'https://github.com/Ygshberwal/FlowBoard');
  await expect(actions.getByRole('link', { name: 'Live demo' })).toHaveAttribute('href', 'https://flowboard-fontend.vercel.app/');
  await expect(actions.getByRole('link', { name: 'Backend' })).toHaveAttribute('href', 'https://flowboard-backend-v65t.onrender.com/api/health');
  const source = projectImages.flowboard.find(image => image.base === 'flowboard-planner')!;
  const prepared = await sharp('public/images/flowboard-planner-1800.webp').metadata();
  expect(prepared.width! / prepared.height!).toBeCloseTo(source.width! / source.height!, 2);
  expect(prepared.exif).toBeUndefined();
  await expect(page.getByRole('img', { name: /full FlowBoard planner/ })).toHaveAttribute('width', String(source.width));
});

test('parking, pitch research, and game expose their requested destinations', async ({ page }) => {
  await page.goto('/work/vehicle-parking/');
  await expect(page.getByRole('link', { name: 'Live demo', exact: true })).toHaveAttribute('href', 'https://vehicle-parking-q9h1.onrender.com/#/');
  await page.goto('/work/sanskrit-pitch/');
  await expect(page.getByRole('link', { name: 'Certificate', exact: true })).toHaveAttribute('href', 'https://drive.google.com/file/d/1XompCTFRd1DKdWavPDiHy8Kwg1LlrAL_/view?usp=share_link');
  await expect(page.getByRole('region', { name: 'Research presentation photo' }).getByRole('img')).toBeVisible();
  await page.goto('/work/tic-tac-toe/');
  await expect(page.getByRole('link', { name: 'Play game', exact: true })).toHaveAttribute('href', 'https://ygshberwal.github.io/Tic-Tac-Toe-AI/');
  await page.goto('/work/');
  const framesFit = await page.locator('.has-screenshot').evaluateAll(covers => covers.every(cover => {
    const frame = cover.querySelector('.screenshot-frame')!.getBoundingClientRect();
    const meta = cover.querySelector('.cover-meta')!.getBoundingClientRect();
    const footer = cover.querySelector('.cover-bottom')!.getBoundingClientRect();
    return frame.top >= meta.bottom && frame.bottom <= footer.top;
  }));
  expect(framesFit).toBe(true);
});

test('experience includes confirmed Ethara and earlier STEMpedia roles without invented scope', async ({ page }) => {
  await page.goto('/');
  const jobs = page.getByRole('list', { name: 'Selected work experience, most recent first' }).locator(':scope > article');
  await expect(jobs).toHaveCount(4);
  await expect(jobs.nth(0)).toContainText('KPI Partners');
  await expect(jobs.nth(1)).toContainText('Ethara AI');
  await expect(jobs.nth(1)).toContainText('JUN — AUG 2026');
  await expect(jobs.nth(1).locator('p')).toHaveCount(1);
  await expect(jobs.nth(2)).toContainText('Amazon');
  await expect(jobs.nth(3)).toContainText('STEMpedia');
  await expect(jobs.nth(3)).toContainText('AI & Robotics Instructor');
});

test('personal section includes the outdoors, cricket, and both Instagram profiles', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#beyond-code');
  await expect(section).toContainText('cricket');
  await expect(section.locator('.outdoor-gallery img')).toHaveCount(2);
  await expect(section.getByRole('link', { name: 'Personal Instagram' })).toHaveAttribute('href', identity.instagram);
  await expect(section.getByRole('link', { name: 'Photography Instagram' })).toHaveAttribute('href', identity.photography);
  await page.goto('/work/attendance/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('AI Attendance Management');
  await expect(page.locator('.case-subtitle')).toContainText('classroom photo or video');
  await expect(page.locator('#approach')).toContainText('video workflow');
});
