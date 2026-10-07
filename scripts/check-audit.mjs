import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const phase = process.env.AUDIT_PHASE || 'baseline';
const base = process.env.BASE_URL || 'http://localhost:3010';
const buildDir = process.env.AUDIT_BUILD_DIR || '.next';
const output = `test-results/audit/${phase}`;
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const context = await browser.newContext();
// Use identical fixtures in both runs; external CDN latency is excluded.
const fixture = fs.readFileSync('public/images/zartasha-about.png');
await context.route('https://res.cloudinary.com/**', (route) =>
  route.fulfill({ contentType: 'image/png', body: fixture }),
);
await context.addInitScript(() => {
  const NativeObserver = window.IntersectionObserver;
  window.__auditObservers = [];
  window.IntersectionObserver = class extends NativeObserver {
    targets = new Set();
    constructor(...args) {
      super(...args);
      window.__auditObservers.push(this);
    }
    observe(target) {
      this.targets.add(target);
      super.observe(target);
    }
    unobserve(target) {
      this.targets.delete(target);
      super.unobserve(target);
    }
    disconnect() {
      this.targets.clear();
      super.disconnect();
    }
  };
  const nativeSetProperty = CSSStyleDeclaration.prototype.setProperty;
  window.__auditProgressWrites = 0;
  CSSStyleDeclaration.prototype.setProperty = function (name, ...args) {
    if (name === '--icon-progress') window.__auditProgressWrites++;
    return nativeSetProperty.call(this, name, ...args);
  };
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const results = {
  phase,
  externalImages: 'identical local fixtures',
  screenshots: {},
  routes: {},
  metrics: {},
};
try {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/about']) {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200);
      await page.evaluate(() => document.fonts.ready);
      // Responsive image selection can reuse a larger prefetched candidate from
      // browser cache. Normalize only the test candidate, never application code.
      await page.locator('img').evaluateAll((images) => {
        for (const img of images) {
          if (!img.src.includes('zartasha-about') || !img.src.includes('/_next/image')) continue;
          const url = new URL(img.currentSrc || img.src);
          url.searchParams.set('w', '640');
          img.removeAttribute('srcset');
          img.src = url.href;
        }
      });
      await page.waitForTimeout(1600);
      const label = `${route === '/' ? 'home' : 'about'}-${width}`;
      results.routes[label] = await page.evaluate(() => ({
        title: document.title,
        h1: document.querySelectorAll('h1').length,
        overflow: document.documentElement.scrollWidth > innerWidth,
        links: [...document.querySelectorAll('a[href]')].map((el) =>
          el.getAttribute('href'),
        ),
        localImages: [...document.images]
          .filter((img) => img.src.startsWith(location.origin))
          .map((img) => ({
            src: img.currentSrc,
            width: img.naturalWidth,
            complete: img.complete,
          })),
      }));
      assert.equal(results.routes[label].h1, 1);
      assert.equal(results.routes[label].overflow, false);
      for (const selector of route === '/'
        ? ['.hero', '#about', '#projects', '.design-process', '.site-footer']
        : [
            '.about-page-hero',
            '.about-page-background',
            '.about-page-expertise',
            '.site-footer',
          ]) {
        const element = page.locator(selector);
        await element.scrollIntoViewIfNeeded();
        await page.waitForTimeout(850);
        await element
          .locator('img')
          .evaluateAll((images) =>
            Promise.all(images.map((img) => img.decode().catch(() => {}))),
          );
        const filename = `${label}-${selector.replace(/[^a-z0-9]/gi, '')}.png`;
        await element.screenshot({
          path: `${output}/${filename}`,
          animations: 'disabled',
        });
        if (phase === 'after') {
          const prior = await sharp(`test-results/audit/baseline/${filename}`)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });
          const current = await sharp(`${output}/${filename}`)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });
          assert.deepEqual(
            current.info,
            prior.info,
            `${filename}: image dimensions changed`,
          );
          let changedPixels = 0;
          let significantPixels = 0;
          let maxChannelDelta = 0;
          for (let i = 0; i < current.data.length; i += 4) {
            if (!current.data.subarray(i, i + 4).equals(prior.data.subarray(i, i + 4))) {
              changedPixels++;
              const delta = Math.max(
                ...[0, 1, 2, 3].map((channel) =>
                  Math.abs(current.data[i + channel] - prior.data[i + channel]),
                ),
              );
              maxChannelDelta = Math.max(maxChannelDelta, delta);
              if (delta > 2) significantPixels++;
            }
          }
          // Chrome can round GPU antialiasing by 1–2 levels between otherwise identical runs.
          results.screenshots[filename] = {
            changedPixels,
            maxChannelDelta,
            significantPixels,
          };
          assert.equal(
            significantPixels,
            0,
            `${filename}: visual pixels changed beyond antialiasing tolerance`,
          );
        } else results.screenshots[filename] = 'captured';
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.locator('.design-process-grid').waitFor();
  const listTop = await page
    .locator('.design-process-grid')
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(
    (top) => scrollTo({ top: top + 160, behavior: 'instant' }),
    listTop,
  );
  await page.waitForTimeout(300);
  results.metrics.stableScrollStyleWrites = await page.evaluate(async () => {
    window.__auditProgressWrites = 0;
    for (let i = 0; i < 20; i++) {
      dispatchEvent(new Event('scroll'));
      await new Promise(requestAnimationFrame);
    }
    return window.__auditProgressWrites;
  });
  for (let i = 0; i < 12; i++) {
    await page
      .getByRole('button', { name: i % 2 ? 'UI/UX Design' : 'Logo Design', exact: true })
      .click();
    await page.waitForTimeout(40);
  }
  results.metrics.detachedObservedTargets = await page.evaluate(() =>
    window.__auditObservers.reduce(
      (count, observer) =>
        count + [...observer.targets].filter((el) => !el.isConnected).length,
      0,
    ),
  );
  const files = fs.readdirSync(path.join(buildDir, 'static'), { recursive: true });
  for (const extension of ['.css', '.js']) {
    const buffers = files
      .filter((file) => file.endsWith(extension))
      .map((file) => fs.readFileSync(path.join(buildDir, 'static', file)));
    results.metrics[`${extension.slice(1)}Bytes`] = buffers.reduce(
      (total, buffer) => total + buffer.length,
      0,
    );
    results.metrics[`${extension.slice(1)}GzipBytes`] = buffers.reduce(
      (total, buffer) => total + gzipSync(buffer).length,
      0,
    );
  }
  const missing = await page.goto(`${base}/this-route-does-not-exist`);
  assert.equal(missing.status(), 404);
  results.routes.notFound = 404;
  const redirect = await context.request.get(`${base}/services/web-design`, {
    maxRedirects: 0,
  });
  results.routes.legacyRedirect = {
    status: redirect.status(),
    location: redirect.headers().location,
  };
  assert.equal(redirect.status(), 308);
  assert.deepEqual(errors, []);
  fs.writeFileSync(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(
    JSON.stringify(
      {
        phase,
        screenshots: Object.keys(results.screenshots).length,
        metrics: results.metrics,
        errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
