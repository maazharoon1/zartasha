export const categories = [
  'Branding',
  'Marketing Design',
  'UI/UX Design',
  'Editorial Design',
  'Packaging & Print',
  'Illustrations',
] as const;
export type ServiceCategory = (typeof categories)[number];
export const categorySlugs: Record<ServiceCategory, string> = {
  Branding: 'branding',
  'Marketing Design': 'marketing-design',
  'UI/UX Design': 'ui-ux-design',
  'Editorial Design': 'editorial-design',
  'Packaging & Print': 'packaging-print',
  Illustrations: 'illustrations',
};
export const filterTabs = [
  'Logo Design',
  'Editorials',
  'Stationery',
  'Social Media Post',
  'Banners',
  'Menu',
  'Merchandise',
  'Packaging',
  'Flyers & Brochures',
  'Brand Guidelines',
  'Pitch Deck',
  'UI/UX Design',
] as const;
export type PortfolioFilter = (typeof filterTabs)[number];
export type PortfolioImage = { src: string; alt: string; width: number; height: number };
export type Service = {
  code: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  filter: PortfolioFilter | null;
  description: string;
  images: PortfolioImage[];
};
// Add only verified work supplied by Zartasha. No client projects are assumed.
export const services: Service[] = [
  {
    code: 'LG',
    slug: 'logo-design',
    name: 'Logo Design',
    category: 'Branding',
    filter: 'Logo Design',
    description:
      'Distinctive marks with thoughtful typography, a clear visual idea and the flexibility to work at every size.',
    images: [],
  },
  {
    code: 'ED',
    slug: 'editorials',
    name: 'Editorials',
    category: 'Editorial Design',
    filter: 'Editorials',
    description:
      'Considered covers, publications and page layouts that balance expressive typography with comfortable reading.',
    images: [],
  },
  {
    code: 'ST',
    slug: 'stationery',
    name: 'Stationery',
    category: 'Branding',
    filter: 'Stationery',
    description:
      'Business cards, letterheads and everyday brand materials brought together through a consistent visual language.',
    images: [],
  },
  {
    code: 'SM',
    slug: 'social-media-post',
    name: 'Social Media Post',
    category: 'Marketing Design',
    filter: 'Social Media Post',
    description:
      'Clear, recognizable social visuals that connect your message with your brand’s personality.',
    images: [],
  },
  {
    code: 'BN',
    slug: 'banners',
    name: 'Banners',
    category: 'Marketing Design',
    filter: 'Banners',
    description:
      'Focused campaign layouts with readable type and a strong visual hierarchy, across digital and print formats.',
    images: [],
  },
  {
    code: 'MN',
    slug: 'menu-design',
    name: 'Menu',
    category: 'Packaging & Print',
    filter: 'Menu',
    description:
      'Inviting menus with considered typography and an easy-to-follow structure.',
    images: [],
  },
  {
    code: 'MR',
    slug: 'merchandise',
    name: 'Merchandise',
    category: 'Packaging & Print',
    filter: 'Merchandise',
    description:
      'Brand graphics for apparel and merchandise, with attention to scale, placement and production.',
    images: [],
  },
  {
    code: 'PK',
    slug: 'packaging',
    name: 'Packaging',
    category: 'Packaging & Print',
    filter: 'Packaging',
    description:
      'Packaging and labels that bring a product’s character into a cohesive, practical design.',
    images: [],
  },
  {
    code: 'FL',
    slug: 'flyers-brochures',
    name: 'Flyers & Brochures',
    category: 'Marketing Design',
    filter: 'Flyers & Brochures',
    description:
      'Accessible information layouts with purposeful imagery and a clear reading order.',
    images: [],
  },
  {
    code: 'BG',
    slug: 'brand-guidelines',
    name: 'Brand Guidelines',
    category: 'Branding',
    filter: 'Brand Guidelines',
    description:
      'A clear reference for your identity, covering typography, colour, logo use and visual consistency.',
    images: [],
  },
  {
    code: 'PD',
    slug: 'pitch-deck',
    name: 'Pitch Deck',
    category: 'Marketing Design',
    filter: 'Pitch Deck',
    description:
      'Thoughtful presentation design that gives complex ideas a clear narrative and visual rhythm.',
    images: [],
  },
  {
    code: 'UI',
    slug: 'ui-ux-design',
    name: 'UI/UX Design',
    category: 'UI/UX Design',
    filter: 'UI/UX Design',
    description:
      'Considered interface layouts and user journeys that make digital experiences clear, coherent and easy to navigate.',
    images: [],
  },
  {
    code: 'IL',
    slug: 'illustrations',
    name: 'Illustrations',
    category: 'Illustrations',
    filter: null,
    description:
      'Expressive visual storytelling shaped around your message, format and creative direction.',
    images: [],
  },
];
export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}
