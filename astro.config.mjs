import { copyFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';

/** GitHub Pages needs CNAME in the deployed folder. The repo root copy stays the source. */
const copyCname = {
  name: 'sparkwing-copy-cname',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      await copyFile(new URL('./CNAME', import.meta.url), new URL('CNAME', dir));
    },
  },
};

export default defineConfig({
  site: 'https://sparkwing.com.au',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  integrations: [copyCname],
});
