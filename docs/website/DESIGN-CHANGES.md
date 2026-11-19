# Design changes to pick up

## Simpler homepage and How it works (20 Nov 2026, CORE-216)

Source: the downloaded boards `Homepage-html`, `How it works-html`, `Shared header-html` and `Shared footer-html`, plus the illustration folders under `assets/`. The public canvas needed a sign-in for the file itself. The boards win where they differ from the older 18 Nov export.

- Header: Services (`/#services`), How it works, Apps, Book a discovery call. Elly confirmed the ticket's `/spark-studio` target was out of date. No announcement bar, no Products menu, no Trust link. `/trust` stays live.
- Footer: the shared footer. Services says "Build your AI plan". Apps link to `/apps#sparkkeeper`, `#magnet` and `#academy`. Contact us stays, because the ticket asked for it and the footer board does not show it.
- Homepage sections: hero, why use AI, services, how we tailor, apps, gold band. Removed sections are kept in `src/archive/home-retired.astro`.
- How it works replaces the old steps story, with the Libra meteor canvas from the board script, scroll-in steps, and the glow card. `--glow-angle` is registered with `inherits: true`.
- Illustrations are the full files from the asset folders, cropped with the board's `object-position` and `object-view-box`.

Wording still to confirm before changing other pages:

- `bring-ai-in.astro` meta: "Clear the manual work first, then add more." Proposed: "Clear the manual work. No IT team needed."
- `bring-ai-in.astro` body: "Start with one job, add more when you're ready..." Proposed: "Start with one job. We run the rest for you."
- `bring-ai-in.astro`: "or an app or AI agent built around how you work." Proposed: "or an app or AI helper built around how you work."
- `spark-studio.astro`: "Custom apps and agents", "you add more whenever you're ready", "Custom app", "AI agent", and the page title. Proposed visible labels: "AI helpers" and "apps". Leave the title and meta until the SEO pass.
- `scale-ai.astro`: "your AI specialists" and "custom apps or AI agents". Proposed: "your AI helpers" and "apps or AI helpers".
- `AskSparky.astro`: "Sparkwing's AI assistant" and the reply that says "custom apps or AI agents". Proposed: "Sparkwing's AI helper", and "apps or AI helpers when you need them."

Clashes to check:

- The shared header sends Services to the homepage services section. The ticket said `/spark-studio`. The board is what shipped.
- The footer board has no Contact us link. The ticket said to keep it.
- The AI helpers picture alt says "an app". The board said "custom app". Elly confirmed we no longer use "custom app".
- How it works step 4 on the board was a typo. The page now reads: "We help your team learn to use AI for day-to-day work."
- The Sparkkeeper Beta badge is removed from the homepage card. Other pages that still say beta (Sparkkeeper, Bring AI in, Contact, Ask Sparky) were not changed in this pass.

## Earlier notes


This bundle is the source of truth. `design/source/` and `design/screens/` win over what's built. Compare every page against them and change what differs. Some items below may already be done, so check before changing them.

## Heroes
All heroes now use the canvas animation with the butterfly: Home, Sparkkeeper, Apps (a scene per app), Spark Studio, Trust, Bring AI in, Scale. This replaces the CSS hero animations, and FR-009 no longer says CSS only.

- Engine: `design/motion/motion-engine.js`. It's written as a class method on the canvas. Turn it into one shared module.
- Styles: `design/motion/motion.css`. Swap raw colours for tokens where a token exists.
- Scenes: `home`, `sparkkeeper`, `magnet`, `academy`, `nest`, `trust`, and `flow` for `start`, `studio` and `scale`.
- Apps restarts the scene when the app changes, with the butterfly already perched.

## Home order
1. Hero, dark
2. Stats band, now on cream so it stands clear of the hero
3. Start with our bookkeeping app, Sparkkeeper, plus Magnet, Academy and Nest cards
4. Have a play with Sparkkeeper, gold
5. Not seeing the apps you need? Talk to us (Spark Studio)
6. Marquee
7. Your business context is what makes AI useful, navy (new)
8. Built by people who know the work
9. Trust comes built into every app, now on cream
10. Closing CTA

Removed from Home: "See it take flight" as its own section, and "Where will the apps and data live?". The story animation now sits in the Upload tab. Upload is the default tab and comes first.

## Copy
- Header menu: "Save hours" and "Use AI safely". Footer: "Save hours on admin" and "Use AI safely". They follow the two Home paths. Routes stay `/bring-ai-in` and `/scale-ai`.
- Stats: new figures and footnotes, with no country in the claims. Don't shorten the footnotes.
- Home door: "Cut the paperwork first, starting with our bookkeeping app, Sparkkeeper."
- Bring AI in: new hero heading and text, and new page title in the metadata table.
- Home doors: "I want to save hours on manual admin" and "I want my whole team using AI safely".

## Also check these are in
- Header: "Book a call" is the main CTA and "Sparkkeeper login" is plain text.
- Ask Sparky: `docs/website/CHATBOT.md` and the Ask boards.
- Enquiry and beta forms, with the two consent tickboxes.
- ABN 90 703 825 370 in the footer.

The `/preview/home` content mockup isn't part of this design. Don't merge it.

## AI transformation rewrite (6 Nov 2026)
Sparkwing helps businesses deliver change and transformation through AI, and the site now leads with that. The apps are how it gets done.

- AI maturity is the framework: Strategy, Data and context, Rules, People, Tools and scale. Spark Check will measure it, as a public quiz, in a later build.
- Home order is in FR-109. The Sparkkeeper tabs, sample screens and story animation are gone from Home. The Sparkkeeper page covers those features.
- Every section has to make sense if a visitor skips what came before it.
- Text wrapping: headings and short copy use `text-wrap: balance`, and everything else uses `pretty`, so lines don't end on a lone word. Section intros run up to 1040px wide.
- Menu: AI strategy, Save hours, Use AI safely, Products, Trust. AI strategy opens Spark Studio.

## Contact page and business mobile (11 Nov 2026)
Sparkwing now has a business mobile: +61 467 765 508 (`tel:+61467765508`).

- New page: `design/source/Contact.dc.html`, route `/contact`. Dark hero ("Let's talk."), then three cards: Call or text, Email, Book a discovery call. The discovery call button opens the enquiry modal with the `call` topic.
- Footer: "Say hello" now lists the mobile and a "Contact us" link, under the email (`design/source/Footer.dc.html`).
- Privacy and Terms: the "Contact us" sections now include the mobile, and both read "Last updated 11 November 2026". Already regenerated with `scripts/convert-legal.mjs` and checked with `npm run test:legal`.
- Phone number lives in `src/config/site.ts` next to the email, like every other company detail (FR-006).
- No call hours on the page. Calls are returned during the day.
