import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { type Service, services } from '@/data/portfolio';
import { ServiceGallery } from '@/components/service-gallery';
import { SiteHeader } from '@/components/sections/site-header';
import { SiteFooter } from '@/components/sections/site-footer';

export function ServiceDetail({ service }: { service: Service }) {
  const index = services.findIndex((item) => item.code === service.code);
  const nextService = services[(index + 1) % services.length];
  const relatedServices = services.filter((item) => item.category === service.category);

  return (
    <div id="home" className="service-detail-page">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="service-detail-intro section-pad">
          <Link href="/#projects" className="service-back">
            <ArrowLeft size={16} /> All Services
          </Link>
          <div className="service-detail-heading">
            <div>
              <span className="eyebrow">{service.category}</span>
              <h1>
                {service.name}
                <span>.</span>
              </h1>
            </div>
            <div>
              <p>{service.description}</p>
              <a href="#contact" className="text-link">
                Contact information <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
          <nav
            className="service-sibling-tabs"
            aria-label={`${service.category} services`}
          >
            {relatedServices.map((item) => (
              <Link
                key={item.code}
                href={`/services/${item.slug}`}
                aria-current={item.slug === service.slug ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </section>
        <ServiceGallery service={service} />
        <div className="service-next section-pad">
          <Link href="/#projects">
            <ArrowLeft size={17} /> Back to all services
          </Link>
          <Link href={`/services/${nextService.slug}`}>
            <span>
              <small>EXPLORE NEXT</small>
              {nextService.name}
            </span>
            <ArrowUpRight size={25} />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
