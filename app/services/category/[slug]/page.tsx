import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categories, categorySlugs } from '@/data/portfolio';
import { SiteHeader } from '@/components/sections/site-header';
import { PortfolioSection } from '@/components/sections/portfolio-section';
import { SiteFooter } from '@/components/sections/site-footer';

type Props = { params: Promise<{ slug: string }> };
function getCategory(slug: string) {
  return categories.find((category) => categorySlugs[category] === slug);
}
export function generateStaticParams() {
  return categories.map((category) => ({ slug: categorySlugs[category] }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategory((await params).slug);
  return {
    title: category ?? 'Category not found',
    description: category
      ? 'Explore Zartasha Khan’s ' + category.toLowerCase() + ' services.'
      : undefined,
  };
}
export default async function CategoryPage({ params }: Props) {
  const category = getCategory((await params).slug);
  if (!category) notFound();
  return (
    <div id="home">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <PortfolioSection key={category} category={category} />
      </main>
      <SiteFooter />
    </div>
  );
}
