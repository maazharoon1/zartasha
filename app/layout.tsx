import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { PageMotion } from '@/components/page-motion';
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
  icons: { icon: { url: '/images/zartasha.webp', type: 'image/webp' } },
  title: { default: 'Zartasha Khan — Design Portfolio', template: '%s — Zartasha Khan' },
  description:
    'Zartasha Khan’s design portfolio: branding, marketing design, UI/UX, editorial, packaging, print and illustration.',
};
// Har page isi shared HTML structure ke andar render hota hai.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
        <PageMotion />
      </body>
    </html>
  );
}
