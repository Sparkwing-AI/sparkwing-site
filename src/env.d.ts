interface ImportMetaEnv {
  readonly PUBLIC_DEMO_URL?: string;
  readonly PUBLIC_SHOW_PLACEHOLDERS?: string;
  readonly PUBLIC_FORM_ENDPOINT?: string;
  readonly PUBLIC_CF_ANALYTICS_TOKEN?: string;
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
