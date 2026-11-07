/**
 * Company details and site-wide settings. Footer, legal pages and metadata read from here,
 * so this is the only place to change them (FR-006). The ACN is deliberately not listed.
 */
export const company = {
  legalName: 'Sparkwing Pty Ltd',
  abn: '90 703 825 370',
  location: 'Sydney, Australia',
  /** For structured data (SEO-07). */
  addressLocality: 'Sydney',
  addressCountry: 'AU',
  email: 'info@sparkwing.com.au',
} as const;

export const site = {
  name: 'Sparkwing',
  url: 'https://sparkwing.com.au',
  lang: 'en-AU',
  /** Share image (SEO-05), built by npm run build:og. */
  ogImage: {
    path: '/assets/og-image.png',
    width: 1200,
    height: 630,
    alt: 'Sparkwing: less paperwork, more business.',
  },
  logoPath: '/assets/sparkwing-mark.png',
  /** Sparkkeeper login. Launch blocker: confirm the address before launch. Override with PUBLIC_APP_URL. */
  appUrl: import.meta.env.PUBLIC_APP_URL || 'https://sparkkeeper.com.au/',
  /** Pending: replace with a Sparkwing domain or remove before launch. Override with PUBLIC_DEMO_URL. */
  demoUrl: import.meta.env.PUBLIC_DEMO_URL || 'https://sparkkeeper.moxie-strife.workers.dev/',
  /** Base URL of the forms Worker, with no trailing slash (CORE-189). Unset until the Worker exists. */
  formEndpoint: (import.meta.env.PUBLIC_FORM_ENDPOINT || '').replace(/\/$/, ''),
  /** Ask Sparky. Off until Elly turns it on (CHATBOT.md). Production builds stay off unless this is set at build time. */
  chatEnabled: import.meta.env.PUBLIC_CHAT_ENABLED === 'true',
  /** Public Turnstile site key for the forms and chat. Not a secret. Production builds use the Sparkwing widget. */
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || (import.meta.env.PROD ? '0x4AAAAAAF3fblYFlnCkBSdf' : ''),
  /** Base URL of the chat endpoint, including /api/chat, with no trailing slash. */
  chatEndpoint: (import.meta.env.PUBLIC_CHAT_ENDPOINT || '').replace(/\/$/, ''),
  showPlaceholders: import.meta.env.PUBLIC_SHOW_PLACEHOLDERS === 'true',
} as const;

/** Both render in production builds only, and only when their token is set. */
export const integrations = {
  cloudflareAnalyticsToken: import.meta.env.PROD ? import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN || '' : '',
  googleSiteVerification: import.meta.env.PROD ? import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION || '' : '',
} as const;

export const mailto = `mailto:${company.email}`;
