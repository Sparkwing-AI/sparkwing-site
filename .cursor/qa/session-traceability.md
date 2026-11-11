# QA Session Traceability

> Living document. Update during implementation, not only at the end.

## Task summary

Contact page at `/contact` and the business mobile in the footer and Organization JSON-LD. Branch `feature/contact-page`. Copy and structure from `design/source/Contact.dc.html` and the Say hello block in `design/source/Footer.dc.html`. Privacy and Terms already regenerated. Do not merge.

## Acceptance criteria

- [x] `company.phone` and `company.phoneE164` in `src/config/site.ts`, with `tel` and `sms` helpers next to `mailto`
- [x] Organization JSON-LD includes `telephone` (`+61467765508`)
- [x] `/contact` matches the canvas: dark "Let's talk." hero, Call or text, Email, Book a discovery call. Discovery button uses `enquiry="call"`. Wording unchanged. Modal opens with topic "Book a discovery call"
- [x] Footer Say hello lists the mobile (`tel`) and "Contact us" under the email, values from `site.ts`
- [x] Menu panel includes Contact (`aria-current` on `/contact`). Desktop header links unchanged
- [x] `privacy.astro` and `terms.astro` untouched. `npm run test:legal` matches the canvas
- [x] Ask Sparky does not cover the card buttons at 390. Below 520px on this page the launcher shows the star only, so Call us, Send a text and Book a discovery call stay one line and clear of it
- [x] Checked at 390, 768, 1024 and 1440. No sideways overflow. 1024 and 768 use two card columns. 1440 uses three
- [x] `npm run lint`, `npm run build`, `npm run test:legal` pass

## Work type

[x] Other: marketing website page, multi-file UI

## QA tier

**Tier:** 2. New page, multi-file UI. Not NAB platform work.

## User intent (verbatim, abridged)

Pull `feature/contact-page`. Build the 11 Nov 2026 contact page and business mobile from DESIGN-CHANGES and `design/source`. Phone in `site.ts`, contact page, footer, menu link. Do not touch Privacy or Terms. Lint, build, test:legal. Check four widths and Ask Sparky on phones. Commit, push, open a PR into main. Don't merge.

## Files touched

src/config/site.ts, src/config/nav.ts, src/layouts/BaseLayout.astro, src/components/Footer.astro, src/styles/components.css, src/styles/contact.css, src/pages/contact.astro, tests/routes.json

## Regression risks

Footer link underline rule now keeps `tel:` and `/contact` underlined, like the email. Sitemap picks up `/contact` from the page glob. Below 520px on this page the Ask Sparky launcher shows the star only (`font-size: 0` on the label) so the card buttons stay clear. The button name stays Ask Sparky.

## UX notes

Card buttons stay left of the Ask Sparky launcher on a phone. Discovery call opens the existing enquiry modal. No call hours on the page.

---

## Earlier task summary

Remove Sparkkeeper login and the public demo from the site. Home gold section now invites people to the beta or a discovery call. Ask Sparky's knowledge pack says there is no demo and no login. Latest earlier pass: design handoff of 4 Nov 2026 on branch `website/08-design-handoff`.

## Acceptance criteria (login and demo removal)

- [x] No Sparkkeeper login link in the header, phone menu or footer. Book a call stays.
- [x] No Try the demo button. PUBLIC_DEMO_URL stays unused. No link to workers.dev.
- [x] Home gold section uses the new heading, text, Join the beta, and Book a discovery call.
- [x] Sparkkeeper hero keeps Join the beta and adds Book a discovery call.
- [x] Ask Sparky knowledge pack and system prompt do not offer a demo or login.
- [x] Privacy and Terms unchanged. Other demo wording listed for Elly.
- [x] Link test passes. No overflow at 1440, 768 and 390.
- [x] Rose: PASS WITH NOTES ([review](a74ac0e1-e21a-47bd-a67c-ccc980246f6f)). Preview replies now check demo and login before the generic "book a call" reply.

## Work type

[x] Other: marketing website design update, multi-file UI

## QA tier

**Tier:** 2. Multi-file UI change. Not NAB platform work.

## User intent (verbatim, abridged)

Unpack sparkwing-site-handoff.zip, read DESIGN-CHANGES, REQUIREMENTS and CHATBOT, and update the site to match design/source and design/screens. Shared canvas hero module, new Home order, new stats footnotes, header labels Save hours and Use AI safely, Sparky off-topic rules and chat note. Do not merge /preview/home. Do not deploy. Review at http://127.0.0.1:4321/.

## Acceptance criteria (this pass)

- [x] Heroes use one shared module from design/motion, with pause and reduced motion
- [x] Home order matches DESIGN-CHANGES. Where-will-the-apps and See-it-take-flight sections removed
- [x] Stats figures and full footnotes
- [x] Nav and footer path labels. Routes unchanged
- [x] Ask Sparky legal note and off-topic lines match the canvas and CHATBOT.md. Off unless PUBLIC_CHAT_ENABLED=true. The review server turns it on
- [x] Lint, build, legal diff, Playwright axe and overflow at 390, 768 and 1440
- [x] Rose review: PASS. Chat leads save as type `chat`. An attack, homework, code or dating request wins over small talk, including when the same message mentions dogs or a joke.

## Files touched

src/scripts/motion-engine.js, src/styles/hero-motion.css, src/styles/home.css, src/styles/ask.css, src/styles/tokens.css, src/components/CanvasHero.astro, FlowStage.astro, AskSparky.astro, AppPage.astro, Home and inner pages, nav.ts, tests.

## Regression risks

Canvas pause is wired to the existing confirm control. Story animation stays CSS inside the Upload tab. Chat posts only when PUBLIC_FORM_ENDPOINT is set. Previous WIP is in git stash, including /preview/home.

---

## Earlier task summary

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

- Sparkkeeper logo: new mark (open book with sparkles) replaces the temporary logo on Home and in the Products menu. Uses the 256px on-light PNG from the Sparkkeeper app repo, because the on-light SVG is not in either repo. The on-dark SVG is saved as public/assets/logos/sparkkeeper-on-dark.svg for the Sparkkeeper page. Site favicon stays the Sparkwing one.

## Steps 5 and 6 and the 404: Sparkkeeper, apps, Studio, Trust, paths, Beta

Tier: 2 (new pages, multi-file, new form). Work type: new feature.

User intent: "continue with the other pages". Build every remaining route from the canvas, with the Beta application form posting to the same endpoint contract as the enquiry modal.

Routes built: /sparkkeeper, /sparkkeeper/beta, /apps/magnet, /apps/academy, /apps/nest (one AppPage template), /apps (static meta-refresh redirect to Magnet, noindex), /spark-studio, /trust, /bring-ai-in, /scale-ai, /404 (noindex).

Acceptance criteria covered:
- FR-201/FR-301 sticky sub-nav with aria-current, routes not anchors (FR-303).
- FR-302 "Ask us about this app" opens the modal with topic app.
- FR-401/402 Studio: hero, four services, four steps, trust panel, no prices or names.
- FR-501/502 Trust anchors #hive, #ai-crew, #control-tower and the "how Sparkwing is designed" sentence.
- FR-901 to 903, 909 to 911 Beta: fields, errors under each field with aria-invalid and aria-describedby, focus on first error, entries kept, confirmation takes focus, honeypot company_site, two unticked tickboxes, failure message from FR-910. FAQ uses details. Server-side validation arrives with CORE-189.
- Hero animations use shared motion primitives (src/styles/motion.css), each with a click-to-pause trigger. Static end state is the base CSS.

UX notes and deviations to flag to Elly:
- check-dist allows the exact tokens [CUSTOMER 1], [EMAIL 1] and [PHONE 1] because they are real Trust copy. Any other bracketed text still fails the build.
- linkinator skips only the exact /sparkkeeper link. A directory named sparkkeeper (for /sparkkeeper/beta) next to sparkkeeper.html confuses its file server. Playwright visits /sparkkeeper and checks the links.
- Lighthouse skips /404 (noindex and status 404 cannot score 1 for SEO). axe still covers it.
- Beta posts what the business does and the first admin task as one `message` field, as the FR-906 table has no columns for them. CORE-189 can split them.
- Beta wording version is beta-v1, enquiry is enquiry-v1.
- Canvas sizes without a token map to the nearest token or a calc() of tokens. Static scene states differ slightly from the canvas first frame (for example the Trust scene shows the placeholders, not the real name).
- /apps hard-codes the canonical via site.url from config. No inline styles.

Files: src/pages (sparkkeeper, sparkkeeper/beta, apps/*, apps, spark-studio, trust, bring-ai-in, scale-ai, 404), src/components (AppPage, ProductNav), src/config/apps.ts, src/styles (page, motion, inner, subnav, sparkkeeper, apps, studio, platform, start, scale, beta), tests/pages.spec.ts, tests/routes.json, scripts/check-dist.mjs, linkinator.config.json, lighthouserc.cjs.

Regression risks: page.css was split out of home.css, so Home imports both. Header and footer unchanged.

Gates run locally: lint, build and check-dist, test:legal, test:links, Playwright (189 pass, wide and compact, axe on all 13 routes) and Lighthouse (all routes except /404 meet 0.9, 1, 0.9, 1).

### Rose run 3 (steps 5 and 6, static review) findings and fixes

- H1 fixed: gold focus ring on the Studio and Scale hero buttons (`.ph--deep` and `.ph--navy`). A test checks the outline colour.
- M1 fixed: titles and descriptions for /trust, /bring-ai-in, /scale-ai and /sparkkeeper/beta now equal the REQUIREMENTS.md section 6 table. A test checks the titles.
- M2 fixed: the Beta form stays hidden until the script runs. Without JavaScript the page shows the FR-910 sentence with the email address. No GET submit can put details in the URL.
- M3 fixed: `scroll-padding-top` on pages with the sticky sub-nav.
- M4 fixed: both language blocks show without JavaScript.
- M5: 1440 captures compared for every new page, and 390, 768 and 1024 captured for Beta, Trust, Magnet, Scale, Start, Studio and Sparkkeeper. Beta "What to expect" heading colour fixed (it was inheriting the ink colour).
- L1: /apps no longer carries noindex, only the canonical. L3: stray aria-labelledby removed. L7: href tests added for the new pages.
- Not changed: L2 (Error prefix, helps screen readers), L5 (popover stays open on Tab out of No, Esc and outside click still close it), L6 (script-set popover position), L8 (rounded delay steps), L9 (Beta h1 33px at 390 against 38px on the canvas), L10 (raw px layout literals, as on Home), L12.
- FR-010 in REQUIREMENTS.md still says "Pause button". Elly's click-to-pause replaces it, so the wording needs her update.

Gates after fixes: lint, build, check-dist, test:legal, Playwright (211 pass).

### Rose run 4 (static re-run): PASS WITH NOTES

All six earlier findings confirmed fixed. Applied after the run: L1 (no-JS language blocks use display flex, so the gap is kept) and L5 (`method="post"` on the Beta form as a defence). Left for later: L3 (a `<style>` inside `<noscript>`, the CSP in step 8 will need to allow it or we switch to showing both blocks and letting JS hide one), L4 (no-JS sentence is the FR-910 wording, Elly to confirm), L6 (CLS of the Beta form unmeasured, Lighthouse passes), L7, L8, L9, and a keyboard test that tabs through the sub-nav.

## Lead list, scrambled source, approximate location

Tier 2. Workers and the private lead list. Not the public site pages.

User intent: All tab first and default. Type tag on every card. Enquiry topic tag from the saved value. Marketing filter and CSV work on All, and CSV includes type, topic, detected country and region. Notes and Save on their own rows. Access still fails closed. Escape lead data. HMAC-SHA-256 of the IP with IP_HASH_SECRET, never the raw IP, never in email or CSV. "Same source as N other leads" without showing the hash. Save request.cf.country and request.cf.region. "Detected: region, country". "Location differs" is a hint when the dropdown country does not match. Missing location stays empty. Do not block submissions. Do not edit Privacy until the drafted line is approved. Deploy only to account 9d662527c737f4da3e868a52641e3d09, and stop if IP_HASH_SECRET is not set.

- [x] All tab, tags, notes row, Save row, CSV columns, hash stripped before render
- [x] Forms Worker stores hash, country and region. Migration 0003
- [x] Tests: test:leads and test:forms pass. Worker typecheck passes
- [ ] IP_HASH_SECRET was not set (`wrangler secret list` returned none). Migration and both deploys stopped
- [ ] Privacy page not edited. Wording is in the reply for approval
- [x] Rose: PASS WITH NOTES ([review](575f759b-f4a5-4fc2-943c-008f4bc7b38f)). No Critical or High findings. Low notes left: chat cards still show a Topic row, enquiry cards show the saved key as well as the pill, and a failed insert could log a database error that mentions bound values.

## SEO metadata update and Trust anchors

Tier 1 (config and metadata change, no copy change). User intent: replace the page metadata table for seven routes, use the same title and description in Open Graph and Twitter tags, and fix Trust anchors that landed mid-card.

- `/bring-ai-in` uses the second, later wording the user sent. Magnet, Academy, Nest, Privacy and Terms are unchanged.
- REQUIREMENTS.md page metadata table, the seven pages and `BaseLayout` updated. `og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`, `og:locale`, `twitter:card` (summary), `twitter:title`, `twitter:description` render on every page. No `og:image` or `twitter:image` until the share image exists (SEO-05, pending).
- Trust anchors `#hive`, `#ai-crew` and `#control-tower` moved from the h2 to the card, with a small scroll margin, so the link lands on the whole card with its label. At 1440 the three cards share a row, so all three links land at the same scroll position and the target card is fully in view.
- Tests: metadata and length limits (60 and 155) for all seven routes, and the anchor landing test. 213 Playwright tests pass.
