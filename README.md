# sparkwing-site

Marketing site for [sparkwing.com.au](https://sparkwing.com.au): Astro static output with React components, design tokens, and Storybook for designers.

## Design tokens (source of truth)

- `tokens.css` / `tokens.json` – colours, type, spacing, motion
- `fonts.css` + `assets/fonts/` – self-hosted DM Sans (OFL)
- `components.css` – shared BEM styles used by React components
- `pricing-config.js` – PHP/AUD placeholder prices (`showPrices` flag)

## Local development

```bash
npm install
npm run dev          # Astro dev server (syncs tokens into public/)
npm run storybook    # Component library on http://localhost:6006
```

## Build and preview

```bash
npm run build        # Storybook → public/storybook, then Astro → dist/
npm run preview      # Serve dist/
```

After build, Storybook is at `/storybook/` (includes `robots.txt` disallow). The live site preview: `npm run preview` then open `/storybook/index.html`.

## Deploy (GitHub Pages)

On push to `main`, `.github/workflows/deploy.yml` runs `npm run build` and publishes `dist/` to GitHub Pages. `public/CNAME` keeps the custom domain `sparkwing.com.au`.

Enable **Pages → Build and deployment → GitHub Actions** in the repo settings once.

## Edit prices

Update `pricing-config.js` only. Components read it via `src/lib/pricing.ts`.
