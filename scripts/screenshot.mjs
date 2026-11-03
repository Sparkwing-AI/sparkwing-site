// Local helper for comparing a page with design/screens at 390, 768, 1024 and 1440.
// Usage: node scripts/screenshot.mjs /privacy Privacy
// Needs the site running (npm run dev or npm run preview). Writes .shots/<Name>-<width>.png.
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const [route = '/', name = 'Page'] = process.argv.slice(2);
const base = process.env.BASE_URL ?? 'http://localhost:4321';
const widths = [390, 768, 1024, 1440];

await mkdir('.shots', { recursive: true });
const browser = await chromium.launch();
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `.shots/${name}-${width}.png`, fullPage: true });
  await page.close();
}
await browser.close();
console.log(`Saved .shots/${name}-{${widths.join(',')}}.png`);
