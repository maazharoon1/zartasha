import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { chromium } from '@playwright/test';
function readData(path) {
  const out = {};
  new Function(
    'exports',
    ts.transpileModule(fs.readFileSync(path, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
  )(out);
  return out;
}
const { showcaseTabs: tabs, showcaseProjects: projects } = readData('data/showcase.ts');
const { services, categorySlugs } = readData('data/portfolio.ts');
const base = process.env.BASE_URL || 'http://localhost:3000';
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
});
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const failedResponses = [];
page.on('response', (r) => {
  if (r.status() >= 400) failedResponses.push(r.status() + ' ' + r.url());
});
try {
  await page.goto(base);
  assert.deepEqual(await page.locator('.service-filters button').allTextContents(), tabs);
  assert.equal(await page.locator('.hero a').getAttribute('href'), '#projects');
  for (const tab of tabs) {
    const button = page.getByRole('button', { name: tab, exact: true });
    await button.focus();
    await page.keyboard.press('Enter');
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    const filtered = projects.filter((p) => p.filter === tab);
    assert.equal(
      await page.locator('.showcase-card').count(),
      Math.min(12, filtered.length),
    );
    const card = page.locator('.showcase-card').first();
    await card.click();
    const modal = page.getByRole('dialog');
    await modal.waitFor();
    assert.equal(await modal.locator('h2').textContent(), tab);
    console.log('Checking images:', tab);
    await modal.locator('img').evaluate((img) => img.decode());
    const before = await modal.locator('img').getAttribute('src');
    await page.keyboard.press('ArrowRight');
    assert.notEqual(await modal.locator('img').getAttribute('src'), before);
    await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
    assert.equal(
      await page
        .getByRole('button', { name: 'Zoom out', exact: true })
        .getAttribute('aria-pressed'),
      'true',
    );
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog').count(), 0);
    assert.equal(await card.evaluate((el) => el === document.activeElement), true);
    if (filtered.length > 12) {
      await page.getByRole('button', { name: 'Load more projects' }).click();
      assert.equal(
        await page.locator('.showcase-card').count(),
        Math.min(24, filtered.length),
      );
    }
  }
  const routes = [
    '/',
    '/about',
    ...Object.values(categorySlugs).map((s) => '/services/category/' + s),
    ...services.map((s) => '/services/' + s.slug),
  ];
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const res = await page.goto(base + route);
      assert.equal(res.status(), 200, route);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('h1').count(), 1, route);
      assert.match(await page.title(), /Zartasha Khan/);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
        false,
        route,
      );
    }
  }
  for (const width of [320, 700, 1024, 1251]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
      false,
    );
    if (width <= 1250) {
      await page.getByRole('button', { name: 'Open menu' }).click();
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.navigation').isVisible(), false);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.locator('.showcase-card').first().click();
  assert.equal(
    await page.getByRole('dialog').evaluate((el) => el.scrollWidth > innerWidth),
    false,
  );
  await page.keyboard.press('Escape');
  fs.mkdirSync('test-results', { recursive: true });
  await page
    .locator('#projects')
    .screenshot({ path: 'test-results/showcase-mobile.png' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .locator('#projects')
    .screenshot({ path: 'test-results/showcase-desktop.png' });
  assert.deepEqual(errors, []);
  assert.deepEqual(failedResponses, []);
  console.log(
    'Passed: seven keyboard filters, project counts, load more, Arsal modal, image loading, zoom, arrows, Escape/focus return, all routes at desktop/mobile widths, responsive menu, no overflow or failed responses.',
  );
} finally {
  await browser.close();
}
