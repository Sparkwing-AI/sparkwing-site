# sparkwing-site

The Sparkwing marketing website for [sparkwing.com.au](https://sparkwing.com.au). Static Astro, served from GitHub Pages.

Start with `docs/website/REQUIREMENTS.md` and `AGENTS.md`. The holding page (`index.html`, `styles.css`, `assets/`) stays live on `main` until launch.

## Run it

Needs Node 22.12 or later.

```bash
npm install
npm run dev        # http://localhost:4321
```

Copy `.env.example` to `.env` to change the demo link or show placeholders in dev.

## Checks

These run on every pull request in `.github/workflows/ci.yml`.

| Command | What it checks |
| --- | --- |
| `npm run lint` | Stylelint (no raw colours), raw colours and inline styles in markup, `astro check` |
| `npm run build` | Runs the lint checks first, builds, then fails if a bracketed placeholder or inline style renders |
| `npm run test:links` | Internal links in `dist` |
| `npm run test:a11y` | axe (WCAG 2.2 AA), skip link and sideways scroll at 390 and 1440 wide |
| `npm run test:lighthouse` | Performance 90+, accessibility 100, best practices 90+, SEO 100 |

Add each new route to `tests/routes.ts` and `lighthouserc.cjs`.

## Where things live

- `src/styles/tokens.css`: the only file with raw colour, font and size values
- `src/config/site.ts`: company details, the demo link, and the analytics and Search Console tokens
- `docs/website/LAUNCH-CHECKLIST.md`: what Elly does at launch
- `public/assets/logos/`: app marks. Replacing an SVG updates it everywhere
- `design/`: screens, canvas source and tokens from the handoff
