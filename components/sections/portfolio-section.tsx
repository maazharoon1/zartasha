'use client';
import { useEffect, useState } from 'react';
import { showcaseTabs, showcaseProjects, type ShowcaseTab } from '@/data/showcase';
import { categoryShowcaseTabs } from '@/data/showcase-mapping';
import type { ServiceCategory } from '@/data/portfolio';
import { PortfolioShowcase } from '@/components/portfolio-showcase';

const showcaseTabHashes: Record<ShowcaseTab, string> = {
  'UI/UX Design': 'ui-ux',
  'Logo Design': 'logo',
  'Brand Identity & Guide': 'branding',
  'stationery Design': 'stationery',
  'Packaging Design': 'packaging',
  'Flyers & Brochures': 'flyers-brochures',
  'Book Cover': 'book-cover',
};

export function PortfolioSection({ category }: { category?: ServiceCategory }) {
  const tabs = category ? categoryShowcaseTabs[category] : showcaseTabs;
  const [filter, setFilter] = useState<ShowcaseTab | undefined>(tabs[0]);
  const filtered = showcaseProjects.filter((project) => project.filter === filter);

  useEffect(() => {
    function syncFromHash() {
      const hash = window.location.hash.slice(1).toLowerCase();
      const selectedTab = tabs.find(
        (tab) =>
          showcaseTabHashes[tab] === hash ||
          tab.toLowerCase().replace(/[^a-z0-9]+/g, '-') === hash,
      );
      if (!selectedTab) return;

      setFilter(selectedTab);
      document.getElementById('projects')?.scrollIntoView();
    }

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, [tabs]);

  function selectTab(tab: ShowcaseTab) {
    setFilter(tab);
    const url = new URL(window.location.href);
    url.hash = showcaseTabHashes[tab];
    window.history.replaceState(window.history.state, '', url);
  }

  return (
    <section
      id="projects"
      className="work section-pad services-gallery"
      aria-labelledby="services-title"
    >
      <div className="services-heading">
        <div>
          <span className="eyebrow">SELECTED WORK</span>
          {category ? (
            <h1 id="services-title">
              {category}
              <span>.</span>
            </h1>
          ) : (
            <h2 id="services-title">
              Selected projects<span>.</span>
            </h2>
          )}
        </div>
        <p>
          Different disciplines.
          <br />
          The same attention to detail.
        </p>
      </div>
      {tabs.length > 0 ? (
        <>
          <div className="service-filters" role="group" aria-label="Filter portfolio">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => selectTab(tab)}
                aria-pressed={filter === tab}
                aria-controls="portfolio-results"
                className={filter === tab ? 'active' : ''}
              >
                {tab}
              </button>
            ))}
          </div>
          <div id="portfolio-results">
            <PortfolioShowcase key={filter} projects={filtered} />
          </div>
        </>
      ) : (
        <p className="portfolio-note">
          Portfolio work for this category will be added when available.
        </p>
      )}
    </section>
  );
}
