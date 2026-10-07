# Zartasha Khan portfolio

The existing Next.js App Router project keeps its homepage section order in `app/page.tsx`. Components are in `components/`, copy and service mappings are in `data/`, and the shared warm editorial styles are in `app/globals.css`.

- `data/portfolio.ts`: navigation categories, filter labels, service routes and verified portfolio images.
- `data/about.ts`: introduction and design approach.
- `data/design-process.ts`: four process stages.
- `components/sections/site-footer.tsx`: contact section. No verified contact destination has been supplied yet.
- `app/services/[slug]/page.tsx`: individual services.
- `app/services/category/[slug]/page.tsx`: category navigation pages.
- `public/images/zartasha.webp`: the supplied portrait, resized without cropping or changing proportions.
- `public/images/zartasha-hero.webp`: transparent hero cutout edited from the supplied portrait.
- `public/images/zartasha-about.png`: square About composition with an ivory and olive geometric background.

No portfolio projects were supplied. Service cards describe capabilities; galleries show an honest empty state. To add verified work, put the supplied image in `public/images/` and add `{ src: '/images/file.webp', alt: 'Meaningful description', width: 1200, height: 900 }` to the appropriate service's `images` array. Use the actual dimensions. Images use Next Image responsive optimization and lazy loading.

Fonts are local WOFF2 assets. Normal and italic serif styles are used by headings; body text uses Manrope. Motion in `app/motion.css` and `components/page-motion.tsx` follows the original Arsal source from `Website Important/arsal/Important`: 900ms hero line entrances with 110ms staggering, a straight 1250ms portrait fade-up, and 700ms offscreen reveals. The original mobile stack uses 30svh spacing, a 34px sticky offset and icon-ring progress, without card scaling or tilting. `hooks/use-mobile-process.ts` retains a viewport-fit safeguard. Initial viewport content and no-JavaScript content remain visible; reduced motion disables entrances, reveals and stacking. No animation library is needed.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
npm run format:check
node scripts/check-portfolio.mjs # With the production server running on port 3000
node scripts/check-motion.mjs    # Motion, mobile stacking and reduced-motion checks
```

## Current preservation audit

The current public page routes are `/` and `/about`; the previously documented service route files are absent in this checkout. Legacy service components and redirects are retained. Portfolio IDs and live links now come from `data/showcase.ts`; `data/seo.ts` centralizes canonical/social metadata for the owner-supplied production domain. `app/robots.ts` and `app/sitemap.ts` expose the metadata endpoints.

`scripts/check-gallery.mjs` verifies loading/retry and zoom interactions; `scripts/check-seo.mjs` verifies server-rendered SEO and crawlability. Set `BASE_URL` for the local production server. Set `OFFLINE_IMAGES=1` for fixture-based portfolio/motion checks; gallery checks always use fixtures. `scripts/check-audit.mjs` records baseline/after screenshots and work counters under ignored `test-results/audit/`. Set `AUDIT_PHASE=after` to compare, and `AUDIT_BUILD_DIR` when measuring an isolated control build. See `AUDIT-REPORT.md` for cleanup decisions and limitations.
