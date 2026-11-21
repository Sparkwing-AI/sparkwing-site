import { copyFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';

/** GitHub Pages needs CNAME in the deployed folder. The repo root copy stays the source. */
const copyCname = {
  name: 'sparkwing-copy-cname',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      await copyFile(new URL('./CNAME', import.meta.url), new URL('CNAME', dir));
      // /apps.html sits beside the /apps folder (Magnet, Academy, Nest). A static check looks up the folder and misses the page.
      await copyFile(new URL('apps.html', dir), new URL('apps/index.html', dir));
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
  redirects: {
    '/how-it-works': { status: 301, destination: '/services' },
    '/spark-studio': { status: 301, destination: '/services' },
    '/bring-ai-in': { status: 301, destination: '/apps' },
    '/scale-ai': { status: 301, destination: '/services' },
    '/trust': { status: 301, destination: '/services#trust' },
  },
  integrations: [copyCname],
});
