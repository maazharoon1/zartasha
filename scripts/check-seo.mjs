import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const base = process.env.BASE_URL || 'http://localhost:3011';
const production = 'https://zartasha-tau.vercel.app';
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const context = await browser.newContext({ javaScriptEnabled: false });
await context.route('https://res.cloudinary.com/**', (route) => route.abort());
const page = await context.newPage();
const internalLinks = new Map();
try {
  for (const route of ['/', '/about']) {
    assert.equal((await page.goto(base + route)).status(), 200);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('link[rel=canonical]').count(), 1);
    assert.equal(
      new URL(await page.locator('link[rel=canonical]').getAttribute('href')).href,
      new URL(route, production).href,
    );
    assert.equal(
      new URL(await page.locator('meta[property="og:url"]').getAttribute('content')).href,
      new URL(route, production).href,
    );
    assert.equal(
      await page.locator('meta[property="og:title"]').getAttribute('content'),
      await page.title(),
    );
    assert.equal(
      await page.locator('meta[name="twitter:title"]').getAttribute('content'),
      await page.title(),
    );
    assert.equal(
      await page.locator('meta[name="twitter:card"]').getAttribute('content'),
      'summary_large_image',
    );
    assert.ok(await page.locator('meta[name=description]').getAttribute('content'));
    const sharingImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute('content');
    assert.equal(
      (await context.request.get(base + new URL(sharingImage).pathname)).status(),
      200,
    );
    const data = JSON.parse(
      await page.locator('script[type="application/ld+json"]').textContent(),
    );
    assert.equal(data['@context'], 'https://schema.org');
    assert.deepEqual(
      data['@graph'].map((item) => item['@type']),
      ['Person', 'WebSite'],
    );
    assert.equal(data['@graph'][0].name, 'Zartasha Khan');
    for (const href of await page
      .locator('a[href]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
      const url = new URL(href, base + route);
      if (url.origin === new URL(base).origin) internalLinks.set(url.href, url);
    }
  }
  for (const url of internalLinks.values()) {
    assert.equal((await context.request.get(url.href)).status(), 200, url.href);
    await page.goto(url.href);
    if (url.hash)
      assert.equal(
        await page.locator(`[id="${url.hash.slice(1)}"]`).count(),
        1,
        url.href,
      );
  }
  const sitemap = await context.request.get(base + '/sitemap.xml');
  assert.equal(sitemap.status(), 200);
  const urls = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(urls, [production + '/', production + '/about']);
  const robots = await context.request.get(base + '/robots.txt');
  assert.equal(robots.status(), 200);
  assert.match(await robots.text(), /User-Agent: \*/i);
  assert.ok((await robots.text()).includes(`Sitemap: ${production}/sitemap.xml`));
  assert.equal((await page.goto(base + '/missing-page')).status(), 404);
  assert.ok((await page.locator('meta[name=robots]').all()).length > 0);
  assert.match(
    (await page.locator('meta[name=robots]').all()).length
      ? await page.locator('meta[name=robots]').first().getAttribute('content')
      : '',
    /noindex/,
  );
  console.log(
    'Passed: server-rendered titles, canonical/social metadata, structured data, sharing asset, sitemap, robots, internal links and fragment targets, no-JavaScript content, 404 noindex.',
  );
} finally {
  await browser.close();
}
