// Checks the built site. Fails the build if a bracketed placeholder renders (FR-107)
// or if any page carries an inline style attribute (NFR-07).
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const distPath = fileURLToPath(new URL('../dist/', import.meta.url));

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    }),
  );
  return files.flat();
}

const placeholder = /\[[^\]\n<>]{2,}\]/g;
const readableAttributes = /\s(?:alt|title|aria-label|placeholder|content)\s*=\s*"([^"]*)"/gi;

function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}

const pages = (await walk(distPath)).filter((file) => file.endsWith('.html'));
const problems = [];

for (const file of pages) {
  const name = relative(distPath, file).split(sep).join('/');
  const html = await readFile(file, 'utf8');
  const attributes = [...html.matchAll(readableAttributes)].map((match) => match[1]).join(' ');
  for (const match of `${visibleText(html)} ${attributes}`.matchAll(placeholder)) {
    problems.push(`${name}: placeholder ${match[0]}`);
  }
  const body = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  if (/<[a-z][^>]*\sstyle\s*=/i.test(body)) problems.push(`${name}: inline style attribute`);
}

if (problems.length) {
  console.error(`check-dist failed:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`check-dist: ${pages.length} pages clean.`);
