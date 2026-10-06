import { SiteHeader } from '@/components/sections/site-header';
import { HeroSection } from '@/components/sections/hero-section';
import { AboutSection } from '@/components/sections/about-section';
import { PortfolioSection } from '@/components/sections/portfolio-section';
import { DesignProcessSection } from '@/components/sections/design-process-section';
import { SiteFooter } from '@/components/sections/site-footer';

// Yeh file sirf homepage ke sections ka order set karti hai.
// Kisi section ki text ya layout badalne ke liye uski component file kholein.
export default function Home() {
  return (
    <div id="home">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <AboutSection />
        <PortfolioSection />
        <DesignProcessSection />
      </main>
      <SiteFooter />
    </div>
  );
}
