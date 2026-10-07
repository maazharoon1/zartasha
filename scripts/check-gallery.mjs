import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const image = fs.readFileSync('public/images/zartasha-about.png');
let failNext = true;
await context.route('https://res.cloudinary.com/**', async (route) => {
  const url = route.request().url();
  const gallery = url.includes('w_1920');
  await new Promise((resolve) => setTimeout(resolve, gallery ? 900 : 100));
  if (url.endsWith('/L02') && failNext && (gallery || !url.includes('w_'))) {
    if (!gallery) failNext = false;
    return route.fulfill({ status: 503, body: 'Temporary image failure' });
  }
  if (url.endsWith('/L03')) {
    return route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="6000"><rect width="600" height="6000" fill="#6cd0d0"/><text x="40" y="100" font-size="50">Tall project</text></svg>',
    });
  }
  await route.fulfill({ contentType: 'image/png', body: image });
});
try {
  await page.goto(process.env.BASE_URL || 'http://localhost:3004');
  assert.equal(
    await page
      .locator('.showcase-web-grid')
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length),
    2,
  );
  await page.getByRole('button', { name: 'Logo Design', exact: true }).click();
  const card = page.locator('button.showcase-card').first();
  await card.click();
  const modal = page.getByRole('dialog');
  await modal.waitFor();
  await modal.getByRole('status').waitFor();
  assert.equal(
    await modal.locator('.gallery-image-frame').getAttribute('aria-busy'),
    'true',
  );
  fs.mkdirSync('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/gallery-loader-mobile.png' });
  await modal.locator('.gallery-image-frame.is-ready').waitFor();
  assert.equal(await modal.getByRole('status').count(), 0);
  assert.equal(
    await modal.locator('img').evaluate((el) => getComputedStyle(el).objectFit),
    'contain',
  );
  assert.equal(
    await modal.locator('img').evaluate((el) => getComputedStyle(el).animationName),
    'gallery-turn-in',
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'test-results/gallery-ready-mobile.png' });
  await page.getByRole('button', { name: 'Next image' }).click();
  await modal.getByRole('alert').waitFor();
  await modal.getByRole('button', { name: 'Try again' }).click();
  await modal.getByRole('status').waitFor();
  await modal.locator('.gallery-image-frame.is-ready').waitFor();
  // Navigate past an in-flight image: only the final selection may become visible.
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await modal.locator('.gallery-image-frame.is-ready').waitFor();
  assert.ok((await modal.locator('img').getAttribute('src')).endsWith('/L04'));
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  assert.equal(
    await page.getByRole('button', { name: 'Zoom out', exact: true }).isEnabled(),
    true,
  );
  await page.keyboard.press('ArrowLeft');
  assert.equal(
    await page
      .getByRole('button', { name: 'Zoom in', exact: true })
      .locator('..')
      .locator('span')
      .textContent(),
    '100%',
  );
  await modal.locator('.gallery-image-frame.is-ready').waitFor();
  await page.getByRole('button', { name: 'Fit width', exact: true }).click();
  const zoomLabel = modal.locator('.gallery-zoom-controls span');
  assert.ok(
    parseInt(await zoomLabel.textContent()) > 300,
    'Tall images must fit screen width beyond 2x',
  );
  await page.getByRole('button', { name: 'Fit image', exact: true }).click();
  const area = modal.locator('.gallery-lightbox-viewport');
  await area.hover();
  await page.mouse.wheel(0, -100);
  await page.waitForTimeout(100);
  assert.ok(parseInt(await zoomLabel.textContent()) > 100, 'Mouse wheel must zoom');
  await page.getByRole('button', { name: 'Fit image', exact: true }).click();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: 145, y: 400, id: 1 },
      { x: 245, y: 400, id: 2 },
    ],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [
      { x: 95, y: 400, id: 1 },
      { x: 295, y: 400, id: 2 },
    ],
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(100);
  assert.ok(
    parseInt(await zoomLabel.textContent()) >= 190,
    'Two fingers must pinch to zoom',
  );
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 195, y: 420, id: 3 }],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: 195, y: 320, id: 3 }],
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(100);
  assert.ok(
    await modal
      .locator('.gallery-lightbox-art')
      .evaluate((el) => new DOMMatrix(el.style.transform).m42 < -10),
    'Zoomed image must pan with a finger',
  );
  await page.getByRole('button', { name: 'Fit image', exact: true }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(
    await modal.locator('img').evaluate((el) => getComputedStyle(el).animationName),
    'none',
  );
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await modal.evaluate((el) => el.scrollWidth > innerWidth), false);
  }
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog').count(), 0);
  assert.equal(await card.evaluate((el) => el === document.activeElement), true);
  assert.deepEqual(errors, []);
  console.log(
    'Passed: delayed-image loader, image fitting, 3D entrance, retry, rapid navigation, zoom reset, reduced motion, responsive dialog and focus return. External images replaced with local fixtures.',
  );
} finally {
  await browser.close();
}
