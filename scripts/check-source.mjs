// Fails on raw colours and inline styles in source files that stylelint can't see
// (markup attributes, scripts). tokens.css is the only file allowed raw values (NFR-07).
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootPath = fileURLToPath(new URL('../src/', import.meta.url));
const allowed = new Set(['styles/tokens.css']);
const extensions = ['.astro', '.ts', '.js', '.mjs', '.css'];

const hexColour = /(?<![\w&/])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/gi;
const colourFunction = /\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch)\(/gi;
const inlineStyle = /<[a-z][^>]*\sstyle\s*=/gi;

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

const files = (await walk(rootPath)).filter((file) => extensions.some((ext) => file.endsWith(ext)));
const problems = [];

for (const file of files) {
  const name = relative(rootPath, file).split(sep).join('/');
  if (allowed.has(name)) continue;
  const lines = (await readFile(file, 'utf8')).split('\n');
  lines.forEach((line, index) => {
    const where = `src/${name}:${index + 1}`;
    for (const match of line.matchAll(hexColour)) {
      if (/href\s*=\s*["'{`]?\s*$/i.test(line.slice(0, match.index))) continue;
      problems.push(`${where} raw colour ${match[0]}`);
    }
    for (const match of line.matchAll(colourFunction)) problems.push(`${where} raw colour ${match[0]}`);
    if (name.endsWith('.astro') && inlineStyle.test(line)) problems.push(`${where} inline style attribute`);
    inlineStyle.lastIndex = 0;
  });
}

if (problems.length) {
  console.error(`Raw values found outside src/styles/tokens.css. Use a token instead:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`check-source: ${files.length} files clean.`);
