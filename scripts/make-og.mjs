// Builds the 1200 by 630 share image (SEO-05) from the tokens and the Sparkwing mark.
// Run with: npm run build:og   Output: public/assets/og-image.png
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = new URL('../', import.meta.url);
const tokens = await readFile(new URL('src/styles/tokens.css', root), 'utf8');
const mark = (await readFile(new URL('public/assets/sparkwing-mark.png', root))).toString('base64');

const html = `<!doctype html>
<html lang="en-AU"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,500;9..40,700;9..40,800&display=swap">
<style>
${tokens}
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; background: var(--sw-color-deep); color: var(--sw-color-on-deep); font-family: var(--sw-font-sans); }
.card { position: relative; display: flex; flex-direction: column; justify-content: space-between; width: 100%; height: 100%; padding: 72px 80px; }
.brand { display: flex; align-items: center; gap: 20px; }
.brand img { width: 84px; height: 84px; }
.name { font-size: 44px; font-weight: 700; letter-spacing: -0.01em; }
.tag { margin-top: 4px; font-size: 18px; font-weight: 700; letter-spacing: 0.08em; color: var(--sw-color-accent); }
h1 { max-width: 900px; font-size: 104px; font-weight: 800; line-height: 1; letter-spacing: -0.035em; }
.bar { width: 220px; height: 12px; margin-top: 32px; border-radius: 6px; background: var(--sw-color-accent); }
.foot { font-size: 28px; font-weight: 500; color: var(--sw-color-tint); }
</style></head>
<body><div class="card">
<div class="brand"><img src="data:image/png;base64,${mark}" alt=""><div><div class="name">Sparkwing</div><div class="tag">AN AI TRANSFORMATION COMPANY</div></div></div>
<div><h1>Less paperwork, more business.</h1><div class="bar"></div></div>
<div class="foot">sparkwing.com.au</div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: fileURLToPath(new URL('public/assets/og-image.png', root)), type: 'png' });
await browser.close();
console.log('Wrote public/assets/og-image.png');
