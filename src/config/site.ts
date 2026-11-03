/**
 * Company details and site-wide settings. Footer, legal pages and metadata read from here,
 * so this is the only place to change them (FR-006). The ACN is deliberately not listed.
 */
export const company = {
  legalName: 'Sparkwing Pty Ltd',
  abn: '90 703 825 370',
  location: 'Sydney, Australia',
  email: 'info@sparkwing.com.au',
} as const;

export const site = {
  name: 'Sparkwing',
  url: 'https://sparkwing.com.au',
  lang: 'en-AU',
  /** Pending: replace with a Sparkwing domain before launch. Override with PUBLIC_DEMO_URL. */
  demoUrl: import.meta.env.PUBLIC_DEMO_URL || 'https://sparkkeeper.moxie-strife.workers.dev/',
  /** Placeholders such as "[First client story]" only render when this is on. Production builds fail if any render. */
  showPlaceholders: import.meta.env.PUBLIC_SHOW_PLACEHOLDERS === 'true',
} as const;

export const mailto = `mailto:${company.email}`;
