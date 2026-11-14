/** Enquiry topics. The value is what the modal sends and what a button's data-enquiry attribute names. */
export const enquiryTopics = [
  { value: 'call', label: 'Book a discovery call' },
  { value: 'app', label: 'Ask about an app' },
  { value: 'studio', label: 'AI strategy or transformation for my business' },
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
    heading: 'TEAM APPS',
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
      {
        label: 'Nest',
        href: '/apps/nest',
        summary: 'One place your whole team checks in',
        logo: logo('nest'),
        badge: { label: 'Coming soon', tone: 'neutral' },
      },
    ],
  },
  {
    heading: 'INCLUDED WITH EVERY APP',
    items: [
      { label: 'Hive', href: '/trust#hive', summary: 'Your business context layer', logo: logo('hive') },
      { label: 'AI Crew', href: '/trust#ai-crew', summary: 'AI tooling that does the work, with helpers you approve', logo: logo('ai-crew') },
      {
        label: 'Control Tower',
        href: '/trust#control-tower',
        summary: 'Governance and guardrails',
        logo: logo('control-tower'),
      },
    ],
  },
  {
    heading: 'AI STRATEGY AND CONSULTING',
    items: [
      {
        label: 'Spark Studio',
        href: '/spark-studio',
        summary: 'AI strategy, setup, custom apps and AI agents',
        logo: logo('spark-studio'),
      },
    ],
  },
];

/** Page links shown inline at 1200px and wider. */
export const pageLinks = [
  { label: 'Cut manual admin', href: '/bring-ai-in' },
  { label: 'Use AI safely', href: '/scale-ai' },
  { label: 'AI strategy', href: '/spark-studio' },
  { label: 'Trust', href: '/trust' },
] as const;

/** Page links shown first in the Menu panel below 1200px. */
export const menuPageLinks = [
  { label: 'Cut manual admin', href: '/bring-ai-in' },
  { label: 'Use AI safely', href: '/scale-ai' },
  { label: 'AI strategy', href: '/spark-studio' },
  { label: 'Trust', href: '/trust' },
  { label: 'Contact', href: '/contact' },
] as const;

export const footerColumns = [
  {
    heading: 'APPS',
    links: [
      { label: 'Sparkkeeper', href: '/sparkkeeper' },
      { label: 'Magnet', href: '/apps/magnet' },
      { label: 'Academy', href: '/apps/academy' },
      { label: 'Nest', href: '/apps/nest' },
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
    heading: 'TRUST',
    links: [
      { label: 'Hive', href: '/trust#hive' },
      { label: 'AI Crew', href: '/trust#ai-crew' },
      { label: 'Control Tower', href: '/trust#control-tower' },
    ],
  },
] as const;
