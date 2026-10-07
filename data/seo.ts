import type { Metadata } from 'next';

// Production domain supplied by the site owner. Keep all SEO URLs in one place.
export const siteUrl = 'https://zartasha-tau.vercel.app';
export const siteName = 'Zartasha Khan';
export const homeTitle = 'Zartasha Khan — Design Portfolio';
export const homeDescription =
  'Zartasha Khan’s design portfolio: branding, marketing design, UI/UX, editorial, packaging, print and illustration.';
export const aboutDescription =
  'Meet Zartasha Khan, a freelance graphic designer offering brand identity, packaging, print, marketing creatives and UI/UX design.';
export const siteStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: siteName,
      url: `${siteUrl}/`,
      image: `${siteUrl}/images/zartasha-about.png`,
      jobTitle: 'Independent creative designer',
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: homeTitle,
      publisher: { '@id': `${siteUrl}/#person` },
    },
  ],
};
const sharingImage = {
  url: `${siteUrl}/images/zartasha-about.png`,
  width: 1086,
  height: 1448,
  alt: 'Portrait of Zartasha Khan, independent creative designer',
};

export function pageSeo(
  path: '/' | '/about',
  title: string,
  description: string,
): Metadata {
  const url = new URL(path, siteUrl).href;
  return {
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName,
      title,
      description,
      images: [sharingImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [sharingImage.url],
    },
  };
}
