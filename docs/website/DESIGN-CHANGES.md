# Design changes to pick up

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
