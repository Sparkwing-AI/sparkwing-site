# QA Session Traceability

> Living document. Update during implementation, not only at the end.

## Task summary

Build the Sparkwing marketing website (CORE-173) as static Astro on GitHub Pages. Current steps: 2 to 4, shell, legal pages and Home (see the Steps 2 to 4 section). Step 1 shipped in PR #3.

## Work type

[x] Other: marketing website build, multi-file, CI

## QA tier

**Tier:** 2. New feature, multi-file change, CI. Not NAB platform work.

## User intent (verbatim, abridged)

"Build the Sparkwing marketing website in Sparkwing-AI/sparkwing-site." Setup: copy the handoff into the root, branch, keep CNAME, read AGENTS.md, the Cursor rule and REQUIREMENTS.md. Build order step 1: repo setup, tokens and CI. Rules: static Astro, minimal JS, tokens only with no raw hex in components, lint, build, link check, axe and Lighthouse must pass. Work on branches and open PRs. Don't merge to main or deploy to production.

## Acceptance criteria (CORE-174)

- [x] AC-1: Astro with static output on `feature/website-build` lineage
- [x] AC-2: `design/tokens/tokens.css` copied to `src/styles/tokens.css`
- [x] AC-3: CNAME, favicons and logo assets kept. Holding page files untouched
- [x] AC-4: One config file for company details and `PUBLIC_DEMO_URL` (`src/config/site.ts`)
- [x] AC-5: CI runs lint, build, link check, axe and Lighthouse on pull requests
- [x] AC-6: A raw hex value fails the build (stylelint in CSS, `check-source.mjs` in markup)
- [ ] AC-7: Preview deploys. Elly chose Cloudflare Pages previews (8:15 PM). `preview.yml` is written and skips until `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets exist. Still to verify: a real deploy, and `X-Robots-Tag: noindex` on the preview URL. Other decisions: Storybook after step 2, and meta-refresh redirects for `/apps` and old paths in step 8
- [x] AC-8: Bracketed placeholders fail the build (FR-107 guard, `check-dist.mjs`)
- [x] AC-9 (added 8:09 PM): Cloudflare Web Analytics JS snippet in `BaseLayout.astro`, from `PUBLIC_CF_ANALYTICS_TOKEN`, rendered only in production builds with the token set. Verified: absent with no token, present with token, absent in dev with token
- [x] AC-10 (added 8:09 PM): `google-site-verification` meta tag from `PUBLIC_GOOGLE_SITE_VERIFICATION`, production only, no script. Same three cases verified
- [x] AC-11 (added 8:09 PM): `docs/website/LAUNCH-CHECKLIST.md` with the analytics token and Search Console items (verify domain, submit sitemap.xml)

## Functional requirements in scope

NFR-07, NFR-12, FR-006, FR-107 (guard only), FR-004 (skip link in layout), SEO-06 (`lang="en-AU"`), NFR-05 (DM Sans with display=swap).

## Experience / UX expectations

Blank page renders in DM Sans on Morning Silk using tokens. Skip link is first focusable and visible on focus.

## Architecture notes

- `build.format: 'file'` and `trailingSlash: 'never'`, so routes match REQUIREMENTS (`/sparkkeeper`) and GitHub Pages serves them without a redirect hop.
- CNAME copied into `dist` by a build hook. Root CNAME stays the source.
- Step PRs target `feature/website-build`, not `main`. `main` uses legacy Jekyll Pages from root, so merging there would publish `docs/` and `design/`.

## Files and areas touched

- package.json, package-lock.json, astro.config.mjs, tsconfig.json, .stylelintrc.json, linkinator.config.json, lighthouserc.cjs, playwright.config.ts, .gitignore, .env.example, README.md
- src/config/site.ts, src/env.d.ts, src/styles/tokens.css, src/styles/base.css, src/layouts/BaseLayout.astro, src/pages/index.astro
- scripts/check-source.mjs, scripts/check-dist.mjs, tests/a11y.spec.ts, tests/routes.ts, tests/routes.json
- .github/workflows/preview.yml
- .github/workflows/ci.yml
- public/ (favicons and brand logos copied from assets/, handoff assets)
- Handoff copied to root: AGENTS.md, .cursor/rules/sparkwing-site.mdc, design/, docs/, public/assets/

## Regression risks

- Live holding page on `main`: untouched, as nothing merges to `main`.
- Hex check false positives on `href="#abc"` anchors (handled), or on other `#` text that looks like hex.

## Deferred / out of scope

- Preview deploys (blocked), Storybook (CORE-176, Proposed), deploy workflow (launch, CORE-183)
- CSP meta tag and SEO-10 claims check: step 8

## Test ideas

- Raw hex in a style block fails stylelint. Raw hex in an attribute and an inline style fail check-source. "[First client story]" fails check-dist. Broken internal link fails linkinator. All verified locally.

## Agent QA status

| Agent | Run | Verdict | Notes |
|-------|-----|---------|-------|
| Rose | 1 (commit 9e14d91 plus working tree) | PASS WITH NOTES | No Critical or High. Fixed M1 (skip link must be in the viewport, proven by breaking the focus rule), M2 (one route list in tests/routes.json), M4 (named colour attributes, `color(`, more file types), L1 to L4, L7, L8. M3: Elly approved branch protection. Both main and feature/website-build now require a PR and the CI check, with no force pushes or deletions. Admins can still bypass. L5 and L6 deferred |
| Senior Reviewer | n/a | | Tier 2 |
| Judge | | | |

## Steps 2 to 4 (branch website/02-shell-legal, Tier 2)

User intent: "keep going until I can view an entire page". Header, footer, buttons, badges and the enquiry modal (step 2), Privacy and Terms (step 3) and Home (step 4).

Acceptance criteria covered:
- FR-101 to FR-108 on Home: two doors, stats with sources and disclaimer, Ask/Upload/Create tabs with aria-pressed, marquee with Pause, story animation with Pause, three equal team cards, placeholder hidden behind PUBLIC_SHOW_PLACEHOLDERS, whole-band Spark Studio link.
- Animations are applied only under prefers-reduced-motion: no-preference and when html has no data-paused. The base styles are the static end state.
- Marquee static state wraps one set of items. The duplicate set is hidden from assistive tech and from view when static.
- Legal text is machine-copied from the canvas and checked word for word (npm run test:legal).

UX notes and deviations to flag to Elly:
- Pause button label changes to "Play animations" and also sets aria-pressed, as on the canvas. A screen reader may announce both. Candidate for a keep-one-label decision.
- Token mapping: h1 uses --sw-text-h1 (78px max, canvas 76px). Gold heading is h2 x 1.15. Door titles are h3 x 0.85. 28px radius maps to 24px. Hero animation durations (5s, 3.6s, 3.2s, 1.6s) have no token.
- Spark Studio logo on the Home band is the shared SVG asset.
- Without JavaScript the Pause buttons and tabs do nothing. The first tab shows by default.

Files: src/pages/index.astro, src/components/PauseButton.astro, src/styles/home.css, tests/home.spec.ts (plus the step 2 and 3 files from the previous commit).

Regression risks: header or footer changes affect every page. home.css is only imported by Home. Lighthouse must use its own port (4323), because a running dev server on 4321 made SEO fail.

Gates run locally: lint, build, test:legal, test:links, Playwright (wide and compact, axe) and Lighthouse all pass.

### Rose run 2 findings and fixes (steps 2 to 4)

- H1 fixed: the Spark Studio band's gold focus ring on a white section is removed. A test checks it uses the deep focus colour.
- M1: linkinator still skips routes that do not exist yet (/sparkkeeper, /apps, /spark-studio, /trust, /bring-ai-in, /scale-ai). Remove each skip when its page lands in steps 5 and 6. A new Home test asserts every Home href against the requirements link table.
- M2: new tests prove every loop runs when motion is allowed and stops on Pause, the paused end state of the story and marquee, and no sideways scroll at 390, 768, 1024 and 1440.
- M4: `.sw-pause` moved to components.css so later pages can use it.
- M5: loops start only after JavaScript has run (`html[data-motion]`). Without JavaScript the page is static and the Pause buttons are hidden. Tabs show the first panel only.
- M6: the enquiry modal shows its failure state with the email address until `PUBLIC_FORM_ENDPOINT` exists (CORE-189). Expected on previews.
- L1, L3, L4, L6 fixed: legal body text token, ABN and legal name read from config in the generated legal pages (rendered text unchanged), `main` takes focus from the skip link, below-fold images lazy.
- Open for Elly: M3, the Pause label swap with aria-pressed. L5, list semantics with `display: contents` in Safari and VoiceOver, goes into the manual screen reader pass.
| Rose | Steps 2 to 4, run 1 then run 2 (commit 49bbec2) | FAIL, then PASS WITH NOTES | Run 1: H1 focus ring, M1 to M6. All fixed or recorded. Run 2: no Critical, High or Medium. Notes: extend loop and link tests, hide Pause under reduced motion (open), marquee layout shift not measured, line-height values outside tokens (flag to Elly) |

### Click-to-pause (Elly's change, after Rose run 2)

- The three "Pause animations" buttons are gone. Each looping area (hero art, marquee, story) has a transparent real button laid over it. Click, Enter or Space opens a small dialog: "Pause animation?" with Yes and No, or "Resume animation?" when paused. Esc and No close it and return focus. Yes applies to every loop on the page (html[data-paused]).
- Keeps WCAG 2.2.2 and keyboard access, because the trigger is focusable and named "Pause animation" or "Resume animation". Resolves Rose M3 (no label swap with aria-pressed) and L-d (triggers hidden under reduced motion and without JS).
- Risk: nothing on screen says the animation is clickable beyond the pointer cursor and a hover tint. Ask Elly whether to add a hint.
- Tests rewritten in tests/home.spec.ts (77 pass). Rose has not re-run on this change.
