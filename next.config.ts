import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  devIndicators: false,
  images: { qualities: [75, 85] },
  poweredByHeader: false,
  async redirects() {
    const aliases: Record<string, string> = {
      'business-cards': 'stationery',
      'brand-guide-identity': 'brand-guidelines',
      'social-media': 'social-media-post',
      flyers: 'flyers-brochures',
      'pitch-decks': 'pitch-deck',
      'book-covers': 'editorials',
      'book-interiors': 'editorials',
      documentation: 'editorials',
      'packaging-label': 'packaging',
      'web-design': 'ui-ux-design',
      'web-development': 'ui-ux-design',
      'web-dev': 'ui-ux-design',
      'logo-animation': 'category/branding',
      posters: 'category/marketing-design',
      'youtube-thumbnails': 'category/marketing-design',
      'vehicle-wraps': 'category/packaging-print',
    };
    return Object.entries(aliases).map(([source, destination]) => ({
      source: `/services/${source}`,
      destination: `/services/${destination}`,
      permanent: true,
    }));
  },
};
export default nextConfig;
