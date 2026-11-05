// FR-503: the built Privacy and Terms pages must match the canvas word for word.
// Compares the visible text of design/source/<Page>.dc.html (main only) with dist/<page>.html (main only).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pages = [
  ['Privacy', 'privacy'],
  ['Terms', 'terms'],
];

const text = (html) =>
  html
    .match(/<main[^>]*>([\s\S]*)<\/main>/)[1]
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

let failed = false;
for (const [source, built] of pages) {
  const canvas = text(readFileSync(fileURLToPath(new URL(`../design/source/${source}.dc.html`, import.meta.url)), 'utf8'));
  const site = text(readFileSync(fileURLToPath(new URL(`../dist/${built}.html`, import.meta.url)), 'utf8'));
  if (canvas === site) {
    console.log(`check-legal: ${built} matches the canvas (${canvas.split(' ').length} words).`);
    continue;
  }
  failed = true;
  const a = canvas.split(' ');
  const b = site.split(' ');
  let i = 0;
  while (i < a.length && a[i] === b[i]) i += 1;
  console.error(`check-legal: ${built} differs from the canvas at word ${i + 1}.`);
  console.error(`  canvas: ...${a.slice(Math.max(0, i - 5), i + 10).join(' ')}`);
  console.error(`  site:   ...${b.slice(Math.max(0, i - 5), i + 10).join(' ')}`);
}
process.exit(failed ? 1 : 0);
