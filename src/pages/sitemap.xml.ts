import type { APIRoute } from 'astro';
import { site } from '../config/site';

/** Pages that exist but must not be listed: the 404 and the /apps redirect to /apps/magnet. */
const notListed = new Set(['/404', '/apps']);

const pages = import.meta.glob('./**/*.astro');

const routes = Object.keys(pages)
  .map((file) =>
    file
      .replace(/^\.\//, '/')
      .replace(/\.astro$/, '')
      .replace(/\/index$/, ''),
  )
  .map((route) => route || '/')
  .filter((route) => !notListed.has(route))
  .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));

export const GET: APIRoute = () => {
  const urls = routes.map((route) => `  <url><loc>${new URL(route, site.url).href}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
