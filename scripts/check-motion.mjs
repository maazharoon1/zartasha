import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const installed = chromium.executablePath();
const executablePath =
  process.env.BROWSER_PATH ||
  (fs.existsSync(installed)
    ? installed
    : 'C:/Program Files/Google/Chrome/Application/chrome.exe');
const browser = await chromium.launch({ executablePath, headless: true });
const base = process.env.BASE_URL || 'http://localhost:3000';
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
try {
  await page.goto(base);
  assert.notEqual(
    await page
      .locator('.hero h1 span')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
    'none',
  );
  // Original fade-up starts transparent, but must finish with all hero content visible.
  await page.waitForFunction(() =>
    [
      ...document.querySelectorAll(
        '.hero h1 > span, .hero-copy > p, .hero-copy > .button, .portrait-wrap',
      ),
    ].every((el) => getComputedStyle(el).opacity === '1'),
  );
  await page.locator('.hero .button').hover();
  await page.waitForTimeout(450);
  assert.notEqual(
    await page.locator('.hero .button').evaluate((el) => getComputedStyle(el).transform),
    'none',
  );
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Packaging Design', exact: true }).click();
  await page.locator('.showcase-card').first().hover();
  await page.waitForTimeout(850);
  assert.ok(
    await page
      .locator('.showcase-card')
      .first()
      .evaluate((el) => Number(getComputedStyle(el).opacity) === 1),
  );
  assert.notEqual(
    await page
      .locator('.showcase-image img')
      .first()
      .evaluate((el) => getComputedStyle(el).transform),
    'none',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.waitForFunction(() => document.querySelector('.process-stack'));
  const listTop = await page
    .locator('.design-process-grid')
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(
    (top) => window.scrollTo({ top: top + 160, behavior: 'instant' }),
    listTop,
  );
  await page.waitForTimeout(100);
  const firstTop = await page
    .locator('.design-process-step')
    .first()
    .evaluate((el) => el.getBoundingClientRect().top);
  assert.ok(
    Math.abs(firstTop - 34) < 2,
    'First process card must pin at its reading position',
  );
  assert.ok(
    await page
      .locator('.design-process-step')
      .first()
      .evaluate((el) => Number(el.style.getPropertyValue('--icon-progress')) > 0),
  );
  const cards = await page
    .locator('.design-process-card')
    .evaluateAll((elements) =>
      elements.map((el) => ({ height: el.offsetHeight, textHeight: el.scrollHeight })),
    );
  assert.ok(
    cards.every(({ height, textHeight }) => height + 100 < 844 && textHeight <= height),
    'Stacked cards must fit without clipped copy',
  );
  assert.equal(
    await page
      .locator('.design-process-card')
      .first()
      .evaluate((el) => getComputedStyle(el).transform),
    'none',
    'Original mobile stack must not shrink or tilt the cards',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => !document.querySelector('.process-stack'));
  assert.equal(
    await page.evaluate(
      () =>
        document.getAnimations().filter((animation) => animation.playState === 'running')
          .length,
    ),
    0,
  );
  assert.equal(
    await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
    'auto',
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(() => document.querySelector('.process-stack'));
  await page.setViewportSize({ width: 390, height: 480 });
  await page.waitForFunction(() => !document.querySelector('.process-stack'));
  assert.equal(
    await page
      .locator('.design-process-step')
      .first()
      .evaluate((el) => getComputedStyle(el).position),
    'static',
  );
  const noScript = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const fallback = await noScript.newPage();
  await fallback.goto(base);
  assert.equal(await fallback.locator('.design-process-step').count(), 4);
  assert.equal(
    await fallback
      .locator('.design-process-step')
      .first()
      .evaluate((el) => getComputedStyle(el).opacity),
    '1',
  );
  await noScript.close();
  assert.deepEqual(errors, []);
  console.log(
    'Passed: hero entrances, visible content, hover motion, filter replacement, mobile sticky positioning, progress rings, full card text, live reduced-motion changes, short-screen fallback and no-JavaScript content.',
  );
} finally {
  await browser.close();
}
