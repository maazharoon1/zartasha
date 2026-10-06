import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getService, services } from '@/data/portfolio';
import { ServiceDetail } from '@/components/service-detail';

// Har service ka apna shareable URL aur page title hai.
export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  return {
    title: service ? service.name : 'Service not found',
    description: service?.description,
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  return <ServiceDetail service={service} />;
}
