import type { Service } from '@/data/portfolio';
import { showcaseProjects } from '@/data/showcase';
import { serviceShowcaseTabs } from '@/data/showcase-mapping';
import { PortfolioShowcase } from '@/components/portfolio-showcase';

export function ServiceGallery({ service }: { service: Service }) {
  const tab = serviceShowcaseTabs[service.slug];
  const projects = showcaseProjects.filter((project) => project.filter === tab);
  return (
    <section
      className="service-gallery section-pad"
      aria-label={service.name + ' portfolio'}
    >
      <span className="eyebrow">PORTFOLIO</span>
      {projects.length ? (
        <PortfolioShowcase projects={projects} />
      ) : (
        <div className="gallery-empty">
          <h2>Work to come.</h2>
          <p>
            Portfolio images for {service.name.toLowerCase()} have not been added yet.
          </p>
        </div>
      )}
    </section>
  );
}
