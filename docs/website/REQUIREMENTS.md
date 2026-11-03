# Sparkwing website: build requirements

**Status:** Ready for build. Items tagged **Proposed** wait for Elly's confirmation. Items tagged **Pending** wait on an outside input.
**Owner:** Elly. **Repo:** `Sparkwing-AI/sparkwing-site`. **Live domain:** `sparkwing.com.au`.
Drafted by Sunny 🤖 · ai-assisted · 3 Nov 2026.

## 1. Read this first

- **Build the deep teal design.** The canvas also holds a navy Home, Nav and Footer, on boards titled "Archive". Don't build those. Don't build the "Archive: colour options" board or the "Marquee options" board either: Home already uses option A.
- **Copy is final.** Use the words on the canvas as they are. Privacy and Terms must never be reworded.
- **Tokens only.** No raw colours, fonts or spacing values in components. See section 8.
- **Two forms only.** The beta application and the enquiry modal (section 5, Forms). The "Keep me posted" form is parked. Don't rebuild it.
- **Don't add trackers.** Cloudflare Web Analytics is the only analytics allowed. Don't add other trackers or pixels without updating the Privacy page first.
- **Sparkkeeper's public programme is a beta.** Use "beta" everywhere on the site. Client pilots run under their own agreements and aren't part of this build. Don't change the word "pilot" in Privacy or Terms.
- **Sparkkeeper doesn't issue invoices.** Don't add any wording, keyword or metadata that says it issues invoices, files taxes or is BIR accredited.

## 2. Design sources

| What | Where |
| --- | --- |
| Design canvas (all screens at three sizes) | https://claude.ai/artifact/Fp3CsHEGLdq52Mc2veFGAY |
| Design system (tokens, components, marks) | https://claude.ai/artifact/AtGmu95TVVgcwSnggVwAaf |
| Handoff bundle (screens, tokens, assets, canvas source, Cursor rules) | `sparkwing-site-handoff.zip` |

Screens in the bundle are at `design/screens/<Page>-<width>.png`, at widths 1440, 1024, 768 and 390. The canvas and design system are private until Elly shares them.

## 3. Sitemap, screens and where each one goes

| Route | Page | Canvas boards | Screens | Purpose |
| --- | --- | --- | --- | --- |
| `/` | Sparkwing: AI automation for less paperwork, more business | Hand your manual admin to AI you can check. Sparkwing helps businesses in Australia and the Philippines save hours with trusted AI. |
| `/sparkkeeper` | Sparkkeeper: AI for bookkeeping and client records | Your numbers and clients in one place, alongside your accounting software and registered books. Ask Sparky, upload paperwork, create reports. |
| `/apps/magnet` | Magnet | Apps (Magnet tab) | `Apps-*.png` | Coming soon app |
| `/apps/academy` | Academy | Apps (Academy tab) | Same template | Coming soon app |
| `/apps/nest` | Nest | Apps (Nest tab) | Same template | Coming soon app |
| `/spark-studio` | Spark Studio: AI consulting, automation and custom AI agents | AI consulting from Sydney-based Sparkwing. We set AI up around your business and build custom apps or AI agents when you need more. |
| `/trust` | AI governance built in: how Sparkwing keeps AI trustworthy | Hive, AI Crew and Control Tower sit under every Sparkwing app, with rules, records and masking designed in. |
| `/bring-ai-in` | AI for business: start with one app, Sparkwing | AI automation for small and growing businesses in Australia and the Philippines. Start with the job that eats the most hours. No IT team needed. |
| `/scale-ai` | AI strategy and governance for your team, Sparkwing | Get more from AI across your team, with rules and records in place. AI strategy, governance, ecosystems and enablement. |
| `/privacy` | Privacy policy | Privacy, PrivacyMedium, PrivacyCompact | `Privacy-*.png` | Legal. Don't reword |
| `/terms` | Terms of use | Terms, TermsMedium, TermsCompact | `Terms-*.png` | Legal. Don't reword |
| `/sparkkeeper/beta` | Apply for the free Sparkkeeper beta, Sparkwing | Full Sparkkeeper features free for one month, with AI credits included and top-ups on request. Limited seats. See what to expect and apply. |
| `/404` | Not found | None. Use header, footer and tokens | None | "We couldn't find that page." with links to Home and Sparkkeeper |

Shared on every page: **Nav** and **Footer** boards, and the **Enquiry** modal (review it on the "Enquiry modal: form and confirmation" board).

**Apps page:** the canvas shows one page with tabs. Build three real routes from one template, with the sub-nav items as links, so each app can be found in search. `/apps` redirects to `/apps/magnet`.

## 4. Linkages

| Element | From | Goes to |
| --- | --- | --- |
| Logo | Header, every page | `/` |
| Announcement "Join the beta" | Every page | `/sparkkeeper/beta` |
| Every "Book a call", "Book a discovery call" and "Ask us about this app" button | Every page | Opens the enquiry modal with the matching topic. `href` stays `mailto:info@sparkwing.com.au` so it still works without JavaScript |
| "Apply for the beta" | Sparkkeeper beta section | `/sparkkeeper/beta` |
| Products menu: Sparkkeeper | Header | `/sparkkeeper` |
| Products menu: Magnet, Academy, Nest | Header | `/apps/magnet`, `/apps/academy`, `/apps/nest` |
| Products menu: Hive, AI Crew, Control Tower | Header | `/trust#hive`, `/trust#ai-crew`, `/trust#control-tower` |
| Products menu: Spark Studio | Header | `/spark-studio` |
| Nav: Bring AI in, Scale responsibly, Spark Studio, Trust | Header | `/bring-ai-in`, `/scale-ai`, `/spark-studio`, `/trust` |
| "Sparkkeeper login" | Header and small-screen menu | `PUBLIC_APP_URL`, default `https://sparkkeeper.com.au/` (section 10) |
| "Join the beta" | Home and Bring AI in heroes | `/sparkkeeper/beta` |
| "Try the demo" | Home, Sparkkeeper | `PUBLIC_DEMO_URL` (section 10) |
| Door: "I want to bring AI into my business" | Home hero | `/bring-ai-in` |
| Door: "I want to scale AI responsibly" | Home hero | `/scale-ai` |
| "See everything Sparkkeeper does" | Home products | `/sparkkeeper` |
| Magnet, Academy, Nest cards | Home | Each app's route |
| "Meet Spark Studio" band | Home | `/spark-studio` |
| "See how trust is built in" | Home trust | `/trust` |
| "Join the beta" | Home gold section, Sparkkeeper hero | `/sparkkeeper/beta` |
| Stat footnotes | Home stats band | Public First via Manila Bulletin, PYMNTS, QuickBooks (URLs on canvas). New tab, `rel="noopener"` |
| Sub-nav: Sparkkeeper, Magnet, Academy, Nest, Base platform | Sparkkeeper, Apps | Each route, and `/trust` |
| Sub-nav: Features, What it covers, Beta | Sparkkeeper | `#features`, `#scope`, `#beta` |
| "See what it covers today" | Bring AI in | `/sparkkeeper#scope` |
| Sparkkeeper, Magnet, Spark Studio cards | Bring AI in | Each route |
| Accounting firms card | Bring AI in | Opens the enquiry modal |
| Control Tower, Academy, Nest, Spark Studio cards | Scale | `/trust#control-tower`, `/apps/academy`, `/apps/nest`, `/spark-studio` |
| "How the base platform works" | Apps, Studio | `/trust` |
| Footer: Apps, Paths, Trust columns | Every page | The routes above |
| Footer: Privacy, Terms | Every page | `/privacy`, `/terms` |

## 5. Functional requirements

### Site-wide

| ID | Requirement | Acceptance |
| --- | --- | --- |
| FR-001 | Header on every page: announcement bar, logo, nav, Book a call, Sparkkeeper login | Matches Nav board |
| FR-002 | Products menu opens from the Products button with three groups and a discovery call panel | `aria-expanded` updates. Esc and clicking outside close it, and focus returns to the button |
| FR-003 | Below 1200px, nav links collapse into a Menu button that reads "Menu" or "Close" | Panel shows page links first, then the Products groups, and scrolls inside itself. Matches Compact and Medium boards |
| FR-004 | Skip link is the first focusable element and jumps to `<main id="main">` | Visible on focus |
| FR-005 | Footer on every page: CTA, link columns, contact, company line | Company line reads "Sparkwing Pty Ltd · ABN 90 703 825 370 · Sydney, Australia · Privacy · Terms" |
| FR-006 | Company details come from one config file | Changing it updates footer and metadata. ABN is 90 703 825 370. Privacy and Terms show it as on the canvas |
| FR-007 | Every link in section 4 works | Automated link check passes with no broken internal links |
| FR-008 | Temporary app marks are used as on the canvas, from one folder | Replacing an SVG updates it everywhere |
| FR-009 | Each hero has its own looping animation as on the canvas: Home, Sparkkeeper, Apps (one per app), Spark Studio, Trust, Bring AI in, Scale. Privacy, Terms and the beta page have none | CSS only. A loop lasts about 9 seconds. No flashing. Logos are never rotated or recoloured |
| FR-010 | Click-to-pause replaces the Pause buttons. A transparent button sits over each animation. Clicking or pressing it asks "Pause animation?" (or "Resume animation?" when paused) with Yes and No. A small pause icon, always visible in a corner of the animation, shows that it can be paused. The base styles show the finished state | The trigger is a keyboard-operable button with the accessible name "Pause animation" or "Resume animation". Yes pauses every animation on the page. Esc and No close the question and return focus. Reduced motion shows the finished state and hides the trigger. Animated stages have `role="img"` and an `aria-label`, or are hidden from screen readers if decorative. The icon is decorative (`aria-hidden`), because the button carries the name, and meets 3:1 contrast on every background |
| FR-011 | Navy is for trust and governance sections only: Home trust band, Trust hero, Scale hero | Teal stays the colour for product and action. No Wing Violet text on navy. Lagoon Teal on navy is for large text and icons only |

### Home

| ID | Requirement | Acceptance |
| --- | --- | --- |
| FR-101 | Hero with two doors and two CTAs | Matches Main board |
| FR-102 | Stats band with three stats and footnote sources, including "Industry research, not Sparkkeeper results." | Sources link out. Disclaimer stays visible |
| FR-103 | Sparkkeeper showcase with Ask, Upload and Create tabs that swap the sample screen | `aria-pressed` updates. "Sample data" label always shows. Mock is hidden from screen readers |
| FR-104 | Marquee of manual admin work, with click-to-pause (FR-010) | Pauses and resumes. Static with reduced motion. Content isn't cut off when static |
| FR-105 | "See it take flight" story animation: lined papers go in, then Records, Reports and Reminders come out, with caption changes | Runs in CSS. Has click-to-pause (FR-010). Shows the end state when paused or with reduced motion |
| FR-106 | Team section: three equal cards with photo, name, role, bio | Equal widths at wide. Bios exactly as on canvas |
| FR-107 | Bracketed placeholders must not ship: "[First client story]" and "[Beta client quote...]" | Hide each behind a flag until the real content is supplied. A CI check fails the production build if any bracketed placeholder is rendered |
| FR-108 | Spark Studio band after the app cards | Whole band is one link |

### Sparkkeeper

| ID | Requirement | Acceptance |
| --- | --- | --- |
| FR-201 | Sticky sub-nav that scrolls sideways on small screens | Current page marked with `aria-current` |
| FR-202 | Scope section with English and Taglish toggle | Default English. `aria-pressed` updates. Taglish block has `lang="fil"` |
| FR-203 | Scope lists include client emails and notifications under "Sparkkeeper handles", and BIR items under "Stays with your registered systems" | Matches canvas |
| FR-204 | Beta section at `#beta`, with "Apply for the beta" going to `/sparkkeeper/beta` | The sub-nav "Beta" link scrolls to it |

### Apps

| ID | Requirement | Acceptance |
| --- | --- | --- |
| FR-301 | One template with three routes, each with its mark, promise, body and "What it will do" list | Copy as in the canvas tab content |
| FR-302 | "Ask us about this app" opens the enquiry modal with the topic set to "Ask about an app". No signup form | The only form is the shared modal. The submission records the page it came from |
| FR-303 | Old `#magnet`, `#academy`, `#nest` anchors aren't needed in production | Sub-nav uses routes |

### Spark Studio

| ID | Requirement | Acceptance |
| --- | --- | --- |
| FR-401 | Hero, four services (AI consulting, AI setup, Custom apps, AI agents), four steps, trust panel | Matches Studio board |
| FR-402 | No prices, client names or case studies until Elly supplies them | None on page |

### Trust, paths and legal

| ID | Requirement | Acceptance |
| --- | --- | --- |
| FR-501 | Trust page has anchors `#hive`, `#ai-crew`, `#control-tower` | Deep links land on each card |
| FR-502 | "This is how Sparkwing is designed, and we'll confirm what's live for you." stays on Trust | Present |
| FR-503 | Privacy and Terms are built from the canvas, word for word | Text diff against the canvas shows no changes. "Last updated" stays as written |
| FR-504 | Footer Privacy and Terms links stay working | Link check passes |

### Forms

The site is static, so it can't receive a form on its own. Both forms post to one small Cloudflare Worker. Storing every lead in one table with a `type` column gives us tabs now and a head start on Magnet later.

| ID | Requirement | Acceptance |
| --- | --- | --- |
| FR-901 | Beta page at `/sparkkeeper/beta` with the form, "What to expect", "What happens next" and the FAQ | Copy as on the canvas. FAQ uses `<details>`, so it works by keyboard with no JavaScript |
| FR-902 | Beta fields: name, work email, business name, country, what the business does, contact consent tickbox. Marketing tickbox and "What admin would you hand over first?" are optional | Errors show under each field, focus moves to the first error, entries are kept. `aria-invalid` and `aria-describedby` are set. Validated again on the server |
| FR-903 | Beta confirmation: "Thanks, we've got it. We'll email [address] to tell you if the beta is a fit." | Replaces the form. Focus moves to the message |
| FR-904 | Enquiry modal uses native `<dialog>` with `showModal()`. Fields: name, email, optional business name, topic, message, contact consent tickbox, optional marketing tickbox. Topics: Book a discovery call, Ask about an app, Spark Studio, Something else | Topic follows the button that opened it. Esc and the Close button close it, and focus returns to that button. Fits at 320px and scrolls inside itself |
| FR-905 | Enquiry confirmation: "Thanks, we received your message. We'll get back to you real soon." | Announced to screen readers. Exact wording |
| FR-906 | Worker endpoint `POST /api/leads` saves each submission to a Cloudflare D1 `leads` table: id, type (`beta`, `enquiry`), created_at, name, email, business, country, topic, message, business_type, first_task, source_page, contact_consent_at, marketing_consent, marketing_consent_at, consent_wording_version, status, notes | `business_type` ("What does your business do?") and `first_task` ("What admin would you hand over first?") are separate columns that only Beta rows fill. Enquiries use `message`. A row exists for every accepted submission. Allowed origin is `sparkwing.com.au` only. Secrets stay out of the repo |
| FR-907 | Each saved submission emails `info@sparkwing.com.au`. Subjects: `[Beta application] {business}, {country}` and `[Website enquiry] {topic}: {name}`. Reply-To is the submitter. Send through the Microsoft 365 `info@` mailbox using Microsoft Graph, with credentials held as Worker secrets | The row is saved even if the email fails, and the failure is logged. Subject values have line breaks stripped |
| FR-908 | Private lead list with **Beta** and **Enquiries** tabs, behind Cloudflare Access for the Sparkwing team. Status: New, Contacted, Accepted, Declined. The Beta tab shows `business_type` and `first_task`. Notes and CSV export | Not reachable without sign-in. `noindex`. This is the first version of Magnet's lead list, so keep the table free of site-specific names |
| FR-909 | Spam protection: hidden `company_site` field, server validation, rate limit per IP | Filled hidden field is dropped without a row or an email. Turnstile only if spam gets through, and only after checking the Privacy page covers it |
| FR-911 | Two separate, unticked tickboxes on both forms, worded as on the canvas. Contact consent is required. Marketing is optional and never blocks sending | Marketing choice and timestamp are stored. No marketing email goes out until the Privacy page covers it and a working unsubscribe exists. The lead list can filter on marketing consent |
| FR-910 | If sending fails, the form stays filled and shows: "That didn't send. Please try again, or email info@sparkwing.com.au." | Tested with the endpoint down. Without JavaScript the beta form is hidden and the page shows: "This form needs JavaScript to send. Please email info@sparkwing.com.au." |

### Analytics

| ID | Requirement | Acceptance |
| --- | --- | --- |
| FR-601 | Add Cloudflare Web Analytics before launch. The site is on GitHub Pages, so add the JS snippet to every page | Visits show in Cloudflare. No cookies set by analytics |
| FR-602 | No other trackers or pixels | Network check shows only the allowed third parties: Google Fonts, Cloudflare analytics and the outbound links the visitor clicks |

## 6. SEO

| ID | Requirement | Acceptance |
| --- | --- | --- |
| SEO-01 | Unique title and description per page, from the table below | Titles up to 60 characters, descriptions up to 155 |
| SEO-02 | Canonical URL on every page, one `<h1>`, ordered headings | Lighthouse SEO 100 |
| SEO-03 | `sitemap.xml` and `robots.txt` at the root, listing every indexable route | Sitemap validates. Legal pages stay indexable. `/404` doesn't |
| SEO-04 | One URL per page: HTTPS, no `www`, one trailing-slash style, old holding page paths redirected | Redirects return one hop |
| SEO-05 | Open Graph and Twitter tags on every page | Preview shows title, description and image. **Pending:** 1200 by 630 share image built from tokens and the logo |
| SEO-06 | `lang="en-AU"` on `<html>` | Present. Taglish block uses `lang="fil"` |
| SEO-07 | JSON-LD: `Organization` on every page (legal name Sparkwing Pty Ltd, ABN as identifier, logo, email, Sydney), `WebSite` on Home, `SoftwareApplication` on Sparkkeeper, `Service` on Spark Studio | Passes the Schema.org validator. No ratings, reviews or prices |
| SEO-08 | Content is in the HTML at build time, including tab panels and the Taglish block | Viewable with JavaScript off |
| SEO-09 | Images have width and height, modern formats, lazy loading below the fold, descriptive alt where it adds meaning | Lighthouse image audits pass |
| SEO-10 | Keep claims honest in metadata: no "BIR accredited", "e-invoicing", "e-filing" or results claims | Search of built HTML finds none outside the scope section |

**Page metadata**

| Route | Title | Description |
| --- | --- | --- |
| `/` | Sparkwing: less paperwork, more business with AI | Hand your manual admin to AI you can check. Sparkwing helps businesses in Australia and the Philippines save hours with trusted AI. |
| `/sparkkeeper` | Sparkkeeper: AI bookkeeping you can check, Sparkwing | Your numbers and clients in one place. Ask Sparky, upload your paperwork and create reports. Beta applications are open. |
| `/apps/magnet` | Magnet: fewer missed follow-ups, Sparkwing | Catch enquiries and follow them up. When a lead says yes, they become a client in Sparkkeeper. Coming soon. |
| `/apps/academy` | Academy: AI training for your team, Sparkwing | Short online courses that teach your team to use AI safely in their own work. Coming soon. |
| `/apps/nest` | Nest: your team's AI home page, Sparkwing | One place for your team's AI news, announcements, training links and app access requests. Coming soon. |
| `/spark-studio` | Spark Studio: AI consulting, custom apps and agents | Sparkwing's AI consulting team. We set AI up around your business and build custom apps or AI agents when you need more. |
| `/trust` | How Sparkwing keeps AI trustworthy | Hive, AI Crew and Control Tower sit under every Sparkwing app, with rules, records and masking designed in. |
| `/bring-ai-in` | Bring AI into your business, Sparkwing | Start with the job that eats the most hours. No IT team or big plan needed. For growing businesses in Australia and the Philippines. |
| `/scale-ai` | Scale AI responsibly, Sparkwing | Get more from AI across your team, with rules and records in place. AI strategy, governance, ecosystems and enablement. |
| `/sparkkeeper/beta` | Apply for the Sparkkeeper beta, Sparkwing | Full Sparkkeeper features for one month, with AI credits to start and top-ups on request. See what to expect and apply. |
| `/privacy` | Privacy policy, Sparkwing | How Sparkwing Pty Ltd collects, uses, shares and protects personal information. |
| `/terms` | Terms of use, Sparkwing | The terms for using the Sparkwing website. |

**Proposed** search themes, for Elly to confirm. No search volume data was checked: AI bookkeeping Philippines, reduce paperwork small business Philippines, AI for accounting firms, AI consulting Sydney, responsible AI consulting Australia, custom AI agents for business. Don't target banking, financial services or legal terms.

## 7. Non-functional requirements

| ID | Area | Requirement | Acceptance |
| --- | --- | --- | --- |
| NFR-01 | Accessibility | WCAG 2.2 AA on every page, at every size | See section 7.1 |
| NFR-02 | Responsive | Works from 320px to 1920px with no sideways page scroll | Checked at 320, 390, 768, 1024, 1440, 1920. Layouts match the Compact, Medium and wide boards |
| NFR-03 | Performance | LCP under 2.5s, CLS under 0.1, INP under 200ms on a mid-range phone on 4G | Lighthouse mobile performance 90 or better on Home and Sparkkeeper. Many Philippine visitors will be on phones |
| NFR-04 | Page weight | Home under 1MB on first load, no JavaScript framework shipped where static HTML will do | Build report |
| NFR-05 | Fonts | Load DM Sans from Google Fonts with `display=swap` and the brand fallback stack in `--sw-font-sans` | Privacy says pages load fonts from Google Fonts, so self-hosting needs a Privacy update first |
| NFR-06 | Motion | Respect `prefers-reduced-motion`. Anything that moves for more than 5 seconds has a pause control | Tested |
| NFR-07 | Maintainability | One tokens file, shared components, no inline styles, no raw hex outside tokens | Stylelint rule fails the build on raw colours |
| NFR-08 | Browsers | Current and previous versions of Chrome, Safari, Edge, Firefox, plus Chrome on Android and Safari on iOS | Smoke test |
| NFR-09 | Security | HTTPS only, no secrets in the repo, external links `rel="noopener"`. GitHub Pages can't set custom headers, so use a CSP meta tag where practical | Header check |
| NFR-10 | Privacy | The only personal data the site collects is what people send through the two forms. No cookies from Sparkwing code. Form contents never go to analytics | Browser storage check is empty |
| NFR-11 | Hosting | Static build served from GitHub Pages, keeping `CNAME` for `sparkwing.com.au`, with one Cloudflare Worker and D1 database for forms | Deploys from `main` |
| NFR-12 | Quality gates | Lint, build, link check, axe and Lighthouse run on every pull request | CI blocks merge on failure |

### 7.1 Accessibility

**Design check on 3 Nov 2026:** axe-core 4.10.2 with WCAG 2.0, 2.1 and 2.2 A and AA rules plus best practices, on the 10 canvas pages at 1440 and 390 wide, plus the enquiry modal, with animations at their finished state: no violations. Automated tools only catch part of WCAG, and this was run on the canvas, so the build needs its own checks.

Fixes already in the design: skip link, `<main>` landmark, click-to-pause on every animation, Menu button for small screens, darker spark colour for contrast, 44px controls, focus outlines.

**Required on the build:**

- Text contrast 4.5:1, and 3:1 for large text, icons, control borders and focus rings.
- Full keyboard use with visible focus, no traps, logical order. Sticky bars must not hide focused items.
- Targets at least 24px, with 44px for primary controls.
- Page still works at 200% zoom and 320px wide.
- Status conveyed in text, never colour alone.
- Decorative images use `alt=""`. Mock-ups are hidden from screen readers, and the animation has a text label.
- Manual pass with keyboard only, plus VoiceOver on iOS and NVDA on Windows, on Home, Sparkkeeper and Privacy.

## 8. Design system and tokens

- Copy `design/tokens/tokens.css` to `src/styles/tokens.css`. It's the only place raw values live. `tokens.json` is the same data for tooling.
- Three layers: `--sw-brand-*` primitives, `--sw-color-*` semantic tokens for components, `--sw-mock-*` for the Sparkkeeper sample screens only.
- Changing a colour means changing one token. A component must never need its own colour change.
- Components to build are listed in the design system's Components section. Build them first, then assemble pages.
- Breakpoints: compact up to 599px, medium 600 to 1023px, large 1024 to 1199px, wide 1200px and up. The nav switches at 1200px.
- The canvas pages use the same colour and font tokens, but their spacing and type sizes are still written inline. Treat those as the visual reference and map them to the nearest token.
- This system is for the website only. The Sparkkeeper product has its own UI tokens for sizes and density, and uses the same colours: `design/tokens/sparkwing-brand-tokens.css` is the shared palette. Both also share DM Sans and its fallback stack, the logo and the app marks. Don't bring the product's status colours or Roboto money columns into the website.

### 8.1 Storybook (Proposed)

Use `@storybook-astro/framework`, the community framework for Astro. It isn't an official Storybook or Astro project, so pin its version and upgrade on purpose. Starter files are in `design/storybook-starter/`.

**Test on 3 Nov 2026** (Astro 7.4.5, Storybook 10.6.5, framework 1.15.0, Linux, Node 22): `.astro` stories for a button, an app card and a pause button built and rendered with the Sparkwing tokens in both dev and static builds, and the pause script ran. Not tested on Windows, or at full component-library size.

- **Controls:** args update live in `storybook dev`. A deployed static Storybook keeps each story at its written args, so write one story per variant.
- **Fonts:** load DM Sans in `.storybook/preview-head.html`.
- **Interactive behaviour:** the framework's docs say Astro script behaviour needs end-to-end tests, so test the menu, tabs, toggle and pause in the real pages too.
- **CSS:** keep component styles in plain CSS on top of the tokens, so Storybook isn't the only way to reuse them.
- **Deploy:** private or preview only for now. Don't publish it under `sparkwing.com.au`.

## 9. Implementation

- **Stack:** Astro with static output, plain CSS using tokens, a little JavaScript for the menu, tabs, toggle and pause. It gives shared components with almost no JavaScript shipped.
- Replace the holding page in `Sparkwing-AI/sparkwing-site`. Keep `CNAME`, favicons and logo assets.
- Work on a branch, deploy a preview, and let Elly approve before `main`.

**Suggested order:** (1) repo setup, tokens, CI. (2) Header, footer, buttons, badges. (3) Legal pages, as they're the simplest test of the shell. (4) Home. (5) Sparkkeeper. (6) Apps, Studio, Trust, paths. (7) SEO files, analytics, 404. (8) Accessibility and performance pass. (9) Launch.

**Definition of done:** every FR, SEO and NFR item passes, screens match at all sizes, and Elly has approved the preview.

## 10. Open items

| Item | Tag | Note |
| --- | --- | --- |
| Sparkkeeper login address | Pending | `PUBLIC_APP_URL` defaults to `https://sparkkeeper.com.au/`. Launch is blocked until Elly confirms it |
| Analytics token | Pending | `PUBLIC_CF_ANALYTICS_TOKEN` is blank. Launch is blocked until Elly supplies it |
| Demo link | Pending | `PUBLIC_DEMO_URL` is `https://sparkkeeper.moxie-strife.workers.dev/` today. Elly will confirm whether the demo stays. Launch is blocked until it has a Sparkwing address or is removed, as this one shows a personal name |
| Booking | Proposed | Book a call uses the enquiry modal for now. A booking tool would need a Privacy update |
| Beta budget | Pending | The beta and top-ups are free to users. Sparkwing funds them, so top-ups are given at the team's discretion within the beta AI budget |
| Beta FAQ promises | Proposed | Elly to confirm: accounts are planned to stay after the beta, view and export without a plan, a data reset is possible with early notice, we ask before opening a beta user's records, and real records are allowed |
| In-app needs | Pending | Confirmed: AI stops at the credit limit and the rest of the app keeps working. Masking will be live before anyone uses the beta. Feedback and feature requests will be live for the beta. Still to confirm: record export, which the FAQ promises |
| Form receiver | Pending | The site stays on GitHub Pages. The Worker and D1 run on Cloudflare at their own URL, so the domain doesn't have to move. Use a Workers subdomain with no personal name |
| Legal wording | Pending | Privacy now covers website forms. Elly still updates it to cover marketing emails and to mention the beta. Terms stay website-only. Separate app terms are accepted in the app's first-time experience, outside this build. The build uses the wording on the canvas |
| Share image | Pending | Needs making (SEO-05) |
| App marks | Pending | Temporary until trademark checks finish. Replacing the SVGs is all it should take |
| Team bios | Pending | Tim and Eric to approve their bios. Director titles before contracts are signed. Tim's firm is named, so Lucent should see it |
| Taglish | Pending | Tim to review the Taglish scope copy |
| Stat sources | Pending | Check the Public First original behind the Manila Bulletin report |
