import { site } from './site';

/** Enquiry topics. The value is what the modal sends and what a button's data-enquiry attribute names. */
export const enquiryTopics = [
  { value: 'call', label: 'Book a discovery call' },
  { value: 'app', label: 'Ask about an app' },
  { value: 'studio', label: 'Spark Studio' },
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
        logo: logo('sparkkeeper'),
        badge: { label: 'Beta', tone: 'success' },
      },
      {
        label: 'Magnet',
        href: '/apps/magnet',
        summary: 'Fewer missed follow-ups and renewals',
        logo: logo('magnet'),
        badge: { label: 'Coming soon', tone: 'neutral' },
      },
      {
        label: 'Academy',
        href: '/apps/academy',
        summary: 'Your team learns AI before using it on real work',
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
      { label: 'Hive', href: '/trust#hive', summary: 'Your business knowledge library', logo: logo('hive') },
      { label: 'AI Crew', href: '/trust#ai-crew', summary: 'AI specialists and bots you approve', logo: logo('ai-crew') },
      {
        label: 'Control Tower',
        href: '/trust#control-tower',
        summary: 'Governance and guardrails',
        logo: logo('control-tower'),
      },
    ],
  },
  {
    heading: 'AI CONSULTING',
    items: [
      {
        label: 'Spark Studio',
        href: '/spark-studio',
        summary: 'AI setup, custom apps and AI agents',
        logo: logo('spark-studio'),
      },
    ],
  },
];

/** Page links shown inline at 1200px and wider. */
export const pageLinks = [
  { label: 'Bring AI in', href: '/bring-ai-in' },
  { label: 'Scale responsibly', href: '/scale-ai' },
  { label: 'Spark Studio', href: '/spark-studio' },
  { label: 'Trust', href: '/trust' },
] as const;

/** Page links shown first in the Menu panel below 1200px. Spark Studio sits in the Products groups. */
export const menuPageLinks = [
  { label: 'Bring AI in', href: '/bring-ai-in' },
  { label: 'Scale responsibly', href: '/scale-ai' },
  { label: 'Trust', href: '/trust' },
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
      { label: 'Bring AI into my business', href: '/bring-ai-in' },
      { label: 'Scale AI responsibly', href: '/scale-ai' },
      { label: 'Spark Studio: AI consulting', href: '/spark-studio' },
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

export const demoUrl = site.demoUrl;
