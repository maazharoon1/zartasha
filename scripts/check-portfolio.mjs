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
if (process.env.OFFLINE_IMAGES === '1') {
  await page.context().route('https://res.cloudinary.com/**', (route) =>
    route.fulfill({
      contentType: 'image/png',
      body: fs.readFileSync('public/images/zartasha-about.png'),
    }),
  );
  console.log('Offline image fixtures: external image availability is not verified.');
}
page.on('pageerror', (e) => errors.push(e.message));
const failedResponses = [];
page.on('response', (r) => {
  if (r.status() >= 400) failedResponses.push(r.status() + ' ' + r.url());
});
try {
  await page.goto(base);
  assert.deepEqual(await page.locator('.service-filters button').allTextContents(), tabs);
  assert.equal(await page.locator('.hero a').getAttribute('href'), '/#projects');
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
    const liveCards = page.locator('a.showcase-card');
    assert.equal(
      await liveCards.count(),
      filtered.slice(0, 12).filter((p) => p.liveUrl).length,
    );
    for (const link of await liveCards.all()) {
      assert.equal(await link.getAttribute('target'), '_blank');
      assert.match(await link.getAttribute('rel'), /noopener/);
    }
    if (await liveCards.count()) {
      const href = await liveCards.first().getAttribute('href');
      // Isolate external uptime from the browser's actual new-tab behavior.
      await page
        .context()
        .route(href, (route) => route.fulfill({ body: 'Live project' }));
      const popupPromise = page.waitForEvent('popup');
      await liveCards.first().click();
      const popup = await popupPromise;
      await popup.waitForLoadState();
      assert.equal(popup.url(), href);
      assert.equal(await page.locator('dialog').count(), 0);
      await popup.close();
    }
    const card = page.locator('button.showcase-card').first();
    await card.click();
    const modal = page.getByRole('dialog');
    await modal.waitFor();
    assert.equal(await modal.locator('h2').textContent(), tab);
    console.log('Checking images:', tab);
    await page.waitForFunction(() => {
      const img = document.querySelector('dialog img');
      return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
    });
    const before = await modal.locator('img').getAttribute('src');
    await page.keyboard.press('ArrowRight');
    assert.notEqual(await modal.locator('img').getAttribute('src'), before);
    await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
    assert.equal(
      await page.getByRole('button', { name: 'Zoom out', exact: true }).isEnabled(),
      true,
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
  const routes = ['/', '/about'];
  for (const width of [320, 390, 640, 700, 768, 1024, 1440, 1920]) {
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
      const portrait = page.locator(
        route === '/' ? '.about-photo img' : '.about-page-portrait img',
      );
      await portrait.scrollIntoViewIfNeeded();
      await portrait.evaluate((img) => img.decode());
      assert.ok(
        await portrait.evaluate(async (img) => {
          // srcset density-corrects naturalWidth; inspect the resource pixels instead.
          const resource = new Image();
          resource.src = img.currentSrc;
          await resource.decode();
          return resource.naturalWidth >= img.clientWidth * devicePixelRatio;
        }),
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
  await page.locator('button.showcase-card').first().click();
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
    'Passed: seven keyboard filters, direct new-tab links, gallery fallback, load more, zoom, arrows, Escape/focus return, both routes at eight widths, local portraits, responsive menu, no overflow or runtime errors.',
  );
} finally {
  await browser.close();
}
