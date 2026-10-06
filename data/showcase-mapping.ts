import type { ServiceCategory } from '@/data/portfolio';
import type { ShowcaseTab } from '@/data/showcase';
export const categoryShowcaseTabs: Record<ServiceCategory, ShowcaseTab[]> = {
  Branding: ['Logo Design', 'Brand Identity & Guide', 'stationery Design'],
  'Marketing Design': ['Flyers & Brochures'],
  'UI/UX Design': ['UI/UX Design'],
  'Editorial Design': ['Book Cover'],
  'Packaging & Print': ['Packaging Design', 'stationery Design', 'Flyers & Brochures'],
  Illustrations: [],
};
export const serviceShowcaseTabs: Record<string, ShowcaseTab> = {
  'ui-ux-design': 'UI/UX Design',
  'logo-design': 'Logo Design',
  'brand-guidelines': 'Brand Identity & Guide',
  stationery: 'stationery Design',
  packaging: 'Packaging Design',
  'flyers-brochures': 'Flyers & Brochures',
  editorials: 'Book Cover',
};
// Cloudinary handles format/quality and responsive resizing directly; no SDK is needed.
export function portfolioImageUrl(id: string, width: number) {
  return `https://res.cloudinary.com/fd9kyggd/image/upload/f_auto,q_auto:good,c_limit,w_${width}/${id.split('/').map(encodeURIComponent).join('/')}`;
}
