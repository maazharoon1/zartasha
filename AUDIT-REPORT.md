# Preservation audit — October 7, 2026

Work stayed in the existing workspace; nothing was deployed. Existing uncommitted changes were retained. No image/video quality settings, typography, visible copy, layout, responsive rules or animation timings were changed by this audit.

## Baseline

- Next.js 16.3.6 App Router, React/React DOM 19.3.0, TypeScript; versions were read from the installed lockfile. No dependency upgrades.
- Public pages `/` and `/about` are statically rendered. Production origin supplied by the owner: `https://zartasha-tau.vercel.app`.
- Fonts are local WOFF2. Portraits use Next Image; portfolio assets use Cloudinary responsive URLs and original-image fallback. The gallery is dynamically imported.
- Framework compression and immutable caching for hashed assets already apply; no new blanket caching policy was added.
- Initial lint, typecheck and production build passed. Existing live-image motion checking failed because external requests did not load; optional local-fixture support now makes that check reproducible.
- The workspace switched About references to the PNG source during this audit. That concurrent source change was retained. An isolated control build repeats the visual/work comparison using the same latest assets with the pre-optimization lifecycle code; initial captures were kept separately.

## Optimizations and SEO

- Release detached reveal targets when filter results are removed. Selectors, intersection threshold/margins, transition timings and focus behavior remain the same.
- Cache sticky offsets on layout configuration and skip writing identical progress values. The progress formula, precision and frame scheduling remain the same.
- Avoid recreating website-preview resize observers merely because loading finishes. Keep the existing load/resize measurements; clean up when failed images are removed.
- Add canonical URLs and route-specific Open Graph/Twitter metadata using the supplied domain, existing titles/descriptions and existing portrait.
- Add static `/robots.txt` and `/sitemap.xml` for the two actual public pages. Existing 404/noindex behavior remains.
- Add Person/WebSite JSON-LD using the visible name and designer title. No unsupported ratings, reviews, addresses or business claims.

## Cleanup record

**Files and dependencies deleted by this audit: none.** Every dependency has a current runtime/build/tooling use. Required configuration, lockfiles, licenses and documentation remain.

Removed one dead CSS declaration block for `.gallery-placeholder` and `.documentation-art` within `.gallery-lightbox-art`. Neither class is emitted or referenced by source components, dynamic imports, route files, data, scripts or configuration; the current gallery emits `.gallery-image-frame`.

Retained legacy service components/data/styles because they are documented, `ServiceDetail` has existing uncommitted work, and removing its dependency would break retained source. Current source assets and reference recordings remain. The already-deleted About JPEG and the concurrent PNG/source cleanup were not deletions performed by this audit.

## Checks and measurements

See `test-results/audit/baseline/results.json` and `test-results/audit/after/results.json` for comparable work counters, compiled/gzip sizes and 18 desktop/mobile section comparisons. These ignored generated artifacts use identical local Cloudinary fixtures; they are not production network benchmarks or Lighthouse scores.

| Controlled measurement                                 |  Before |   After |
| ------------------------------------------------------ | ------: | ------: |
| Progress writes for 20 identical scroll events         |      80 |       0 |
| Detached observed targets after 12 filter replacements |     100 |       0 |
| Compiled CSS bytes                                     |  30,210 |  30,065 |
| Compiled CSS gzip bytes                                |   7,129 |   7,091 |
| Compiled JavaScript bytes                              | 651,468 | 651,659 |
| Compiled JavaScript gzip bytes                         | 200,200 | 200,284 |

Lifecycle bookkeeping adds 84 compressed JavaScript bytes while eliminating retained targets and redundant writes. Responsive About candidates are normalized to the same 640px resource in screenshots only, so browser prefetch/cache choices cannot compare different image resources. Application responsive loading and quality settings are unchanged.

Final checks cover build/lint/typecheck; filters, pagination, live new-tab links; gallery loader/retry, wheel/pinch/drag zoom, reset and focus return; hover/entrance motion, mobile stacking/progress, reduced motion and no-JavaScript content; canonical/social metadata, JSON-LD parsing, sharing asset, sitemap/robots, internal URLs/fragment targets and 404 noindex.

The screenshot comparison requires identical dimensions and no changes beyond a two-color-level Chrome rasterization tolerance. Initial comparisons were identical except for 13 hero pixels differing by one channel level. All 18 final comparisons passed using the latest PNG source on both sides. No browser runtime errors were reported. Final build, lint, typecheck, portfolio, gallery, motion and SEO checks passed.

## Remaining limits

- Production crawlability and live Cloudinary loading were not independently verified here. Application integrations were not replaced; browser tests use local fixtures.
- Existing `/services/*` redirects still target missing pages. This predates the audit; redirects and routes were preserved under the no-functionality-change rule.
- No load-time, frame-rate, ranking or Core Web Vitals improvement is claimed. Image recompression, animation changes, source-asset removal and framework upgrades were excluded.
