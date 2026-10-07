import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { PageMotion } from '@/components/page-motion';
import {
  homeDescription,
  homeTitle,
  pageSeo,
  siteStructuredData,
  siteUrl,
} from '@/data/seo';
import './globals.css';
import './motion.css';
import './showcase.css';

// Fonts project ke andar hain: visitors ko Google Fonts request nahi bhejni parti.
const sans = localFont({
  src: './fonts/manrope-normal.woff2',
  variable: '--font-body',
  display: 'swap',
  weight: '200 800',
});
const serif = localFont({
  src: [
    {
      path: './fonts/cormorant-garamond-normal.woff2',
      weight: '300 700',
      style: 'normal',
    },
    {
      path: './fonts/cormorant-garamond-italic.woff2',
      weight: '300 700',
      style: 'italic',
    },
  ],
  variable: '--font-display',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});
// Browser tab ka title aur search engine description yahan set hota hai.
export const metadata: Metadata = {
  ...pageSeo('/', homeTitle, homeDescription),
  metadataBase: new URL(siteUrl),
  icons: { icon: { url: '/images/zartasha.webp', type: 'image/webp' } },
  title: { default: homeTitle, template: '%s — Zartasha Khan' },
};
// Har page isi shared HTML structure ke andar render hota hai.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteStructuredData).replace(/</g, '\\u003c'),
          }}
        />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
        <PageMotion />
      </body>
    </html>
  );
}
