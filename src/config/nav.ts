/** Enquiry topics. The value is what the modal sends and what a button's data-enquiry attribute names. */
export const enquiryTopics = [
  { value: 'call', label: 'Book a discovery call' },
  { value: 'app', label: 'Ask about an app' },
  { value: 'studio', label: 'AI strategy and coaching for my business' },
  { value: 'other', label: 'Something else' },
] as const;

export type EnquiryTopic = (typeof enquiryTopics)[number]['value'];

const logo = (name: string) => `/assets/logos/${name}.svg`;

export interface ProductLink {
  label: string;
  href: string;
  summary: string;
  logo: string;
  badge?: { label: string; tone: 'success' | 'neutral' };
}

export const productGroups: { heading: string; items: ProductLink[] }[] = [
  {
    heading: 'APPS',
    items: [
      {
        label: 'Sparkkeeper',
        href: '/sparkkeeper',
        summary: 'Your numbers and your clients in one place',
        // New mark (on light). The on-light SVG is not in the repo yet, so this is the 256px PNG.
        logo: '/assets/logos/sparkkeeper.png',
        badge: { label: 'Beta', tone: 'success' },
      },
      {
        label: 'Magnet',
        href: '/apps/magnet',
        summary: 'AI for your leads and follow-ups',
        logo: logo('magnet'),
        badge: { label: 'Coming soon', tone: 'neutral' },
      },
      {
        label: 'Academy',
        href: '/apps/academy',
        summary: 'Get your team up to speed and confident with AI',
        logo: logo('academy'),
        badge: { label: 'Coming soon', tone: 'neutral' },
      },
    ],
  },
];

/** Page links shown inline at 1200px and wider. */
export const pageLinks = [
  { label: 'Apps', href: '/apps' },
  { label: 'Services', href: '/spark-studio' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Trust', href: '/trust' },
  { label: 'About', href: '/#team' },
] as const;

/** Page links shown first in the Menu panel below 1200px. */
export const menuPageLinks = [
  { label: 'Home', href: '/' },
  ...pageLinks,
  { label: 'Contact', href: '/contact' },
] as const;

export const footerColumns = [
  {
    heading: 'APPS',
    links: [
      { label: 'Sparkkeeper', href: '/sparkkeeper' },
      { label: 'Magnet', href: '/apps/magnet' },
      { label: 'Academy', href: '/apps/academy' },
    ],
  },
  {
    heading: 'PATHS',
    links: [
      { label: 'Cut manual admin', href: '/bring-ai-in' },
      { label: 'Use AI safely', href: '/scale-ai' },
      { label: 'Build your AI strategy', href: '/spark-studio' },
    ],
  },
  {
    heading: 'HOW IT WORKS',
    links: [
      { label: 'Your business context', href: '/how-it-works#business-context' },
      { label: 'Your rules', href: '/how-it-works#rules' },
      { label: 'Approval before it goes out', href: '/how-it-works#approval' },
    ],
  },
] as const;
