// Builds the 1200 by 630 share image (SEO-05) from the tokens, the Sparkwing mark and a capture of the Services hero (design/og/hero-cube-bg.png).
// Run with: npm run build:og   Output: public/assets/og-image.png
// The background is the Services hero with its text hidden, shifted and scaled so the cube sits right of the copy.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = new URL('../', import.meta.url);
const tokens = await readFile(new URL('src/styles/tokens.css', root), 'utf8');
const mark = (await readFile(new URL('public/assets/sparkwing-mark.png', root))).toString('base64');
const bg = (await readFile(new URL('design/og/hero-cube-bg.png', root))).toString('base64');

const html = `<!doctype html>
<html lang="en-AU"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,500;9..40,700;9..40,800&display=swap">
<style>
${tokens}
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; background: var(--sw-color-deep) url(data:image/png;base64,${bg}) -204px -170px / 1560px 819px no-repeat; color: var(--sw-color-on-deep); font-family: var(--sw-font-sans); }
.card { position: relative; display: flex; flex-direction: column; justify-content: space-between; width: 100%; height: 100%; padding: 52px 80px 60px; }
.brand { display: flex; align-items: center; gap: 20px; }
.brand img { width: 140px; height: 140px; }
.name { font-size: 84px; line-height: 1; font-weight: 700; letter-spacing: -0.01em; }
.tag { margin-top: 6px; font-size: 38px; font-weight: 800; letter-spacing: 0.1em; color: var(--sw-color-accent); }
h1 { max-width: 660px; font-size: 92px; font-weight: 800; line-height: 1; letter-spacing: -0.035em; }
.grad { background: linear-gradient(90deg, #5CCFC4 0%, #9FA9E8 55%, #E9A872 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.bar { width: 220px; height: 12px; margin-top: 24px; border-radius: 6px; background: var(--sw-color-accent); }
</style></head>
<body><div class="card">
<div class="brand"><img src="data:image/png;base64,${mark}" alt=""><div><div class="name">Sparkwing</div><div class="tag">AI CONSULTING</div></div></div>
<div><h1>AI <span class="grad">made easy</span><br>for you and<br>your team.</h1><div class="bar"></div></div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: fileURLToPath(new URL('public/assets/og-image.png', root)), type: 'png' });
await browser.close();
console.log('Wrote public/assets/og-image.png');
