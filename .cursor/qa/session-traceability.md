# QA Session Traceability

> Living document. Update during implementation, not only at the end.

## Task summary

Build the Sparkwing marketing website (CORE-173) as static Astro on GitHub Pages. Current step: 1, repo setup, tokens and CI (CORE-174).

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
- [ ] AC-7: Preview deploys. Blocked: needs a hosting decision from Elly
- [x] AC-8: Bracketed placeholders fail the build (FR-107 guard, `check-dist.mjs`)

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
- src/config/site.ts, src/styles/tokens.css, src/styles/base.css, src/layouts/BaseLayout.astro, src/pages/index.astro
- scripts/check-source.mjs, scripts/check-dist.mjs, tests/a11y.spec.ts, tests/routes.ts
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
| Rose | | | |
| Senior Reviewer | n/a | | Tier 2 |
| Judge | | | |
