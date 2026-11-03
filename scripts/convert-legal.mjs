// Builds src/pages/privacy.astro and src/pages/terms.astro from the canvas source, so the wording is
// copied by machine and never retyped (FR-503). Only styling hooks and internal links change.
// Run `node scripts/convert-legal.mjs` if Elly supplies new wording in design/source, then run
// `npm run test:legal` to confirm the built page still matches the canvas word for word.
import { readFileSync, writeFileSync } from 'node:fs';

const pages = [
  {
    source: 'Privacy',
    out: 'privacy',
    title: 'Privacy policy, Sparkwing',
    description: 'How Sparkwing Pty Ltd collects, uses, shares and protects personal information.',
  },
  {
    source: 'Terms',
    out: 'terms',
    title: 'Terms of use, Sparkwing',
    description: 'The terms for using the Sparkwing website.',
  },
];

const internalLinks = { 'Privacy.dc.html': '/privacy', 'Terms.dc.html': '/terms' };

for (const page of pages) {
  const html = readFileSync(new URL(`../design/source/${page.source}.dc.html`, import.meta.url), 'utf8');
  let main = html.match(/<main[^>]*>([\s\S]*)<\/main>/)[1];

  // Cards are the white boxes. Everything else is a plain block.
  main = main.replace(/<div style="[^"]*background: var\(--sw-brand-white\)[^"]*">/g, '<div class="sw-legal-card">');
  main = main.replace(/<section aria-labelledby="([^"]+)" style="[^"]*">/, '<section class="sw-legal-head" aria-labelledby="$1">');
  main = main.replace(/<section aria-label="([^"]+)" style="[^"]*">/, '<section class="sw-legal-body" aria-label="$1">');
  main = main.replace(/<h1 id="([^"]+)" style="[^"]*">/, '<h1 id="$1">');
  main = main.replace(/<p style="[^"]*color: var\(--sw-color-text-muted\)[^"]*">/, '<p class="sw-legal-updated">');
  main = main.replace(/<p style="[^"]*font-size: 20px[^"]*">/, '<p class="sw-legal-lead">');
  main = main.replace(/<div style="[^"]*max-width: 760px[^"]*">/g, '<div class="sw-legal-inner">');
  main = main.replace(/\sstyle="[^"]*"/g, '');
  main = main.replace(/<div>/g, '<div class="sw-legal-block">');
  main = main.replace(/href="([^"]+\.dc\.html)"/g, (_, file) => `href="${internalLinks[file]}"`);
  main = main.replace(/<a href="(https:\/\/[^"]+)">/g, '<a href="$1" rel="noopener">');
  if (/style=|\.dc\.html/.test(main)) throw new Error(`${page.source}: unconverted style or link left in markup`);

  const body = main
    .split('\n')
    .map((line) => (line.trim() ? `  ${line.replace(/\s+$/, '')}` : ''))
    .join('\n')
    .trim();

  const astro = `---
// Generated from design/source/${page.source}.dc.html by scripts/convert-legal.mjs. Do not reword by hand.
import BaseLayout from '../layouts/BaseLayout.astro';
import '../styles/legal.css';
---

<BaseLayout
  title=${JSON.stringify(page.title)}
  description=${JSON.stringify(page.description)}
>
  ${body}
</BaseLayout>
`;
  writeFileSync(new URL(`../src/pages/${page.out}.astro`, import.meta.url), astro);
  console.log(`Wrote src/pages/${page.out}.astro`);
}
