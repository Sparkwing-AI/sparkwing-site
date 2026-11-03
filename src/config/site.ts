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
  /** Base URL of the forms Worker, with no trailing slash (CORE-189). Unset until the Worker exists. */
  formEndpoint: (import.meta.env.PUBLIC_FORM_ENDPOINT || '').replace(/\/$/, ''),
  /** Placeholders such as "[First client story]" only render when this is on. Production builds fail if any render. */
  showPlaceholders: import.meta.env.PUBLIC_SHOW_PLACEHOLDERS === 'true',
} as const;

/** Both render in production builds only, and only when their token is set. */
export const integrations = {
  cloudflareAnalyticsToken: import.meta.env.PROD ? import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN || '' : '',
  googleSiteVerification: import.meta.env.PROD ? import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION || '' : '',
} as const;

export const mailto = `mailto:${company.email}`;
