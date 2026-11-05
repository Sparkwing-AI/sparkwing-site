# Sparkwing website handoff

Updating an existing build? Start with `docs/website/DESIGN-CHANGES.md`.

Start with `docs/website/REQUIREMENTS.md`. For the website chat, also read `docs/website/CHATBOT.md`.

- `design/screens/`: every page at 390, 768, 1024 and 1440 wide
- `design/screen-sheets/`: each page at wide, medium and compact side by side
- `design/source/`: canvas source for each page. Use it for exact copy and structure. Inline layout styles are a reference only
- `design/motion/`: hero animation engine and styles
- `design/tokens/`: `tokens.css` and `tokens.json`
- `design/storybook-starter/`: tested Storybook setup for Astro components
- `public/assets/`: logo, temporary app marks and team photos
- `.cursor/rules/`: project rules for Cursor

Copy this folder's contents into the root of `Sparkwing-AI/sparkwing-site`, then work on a branch. The Jira epic is CORE-173. Its child tickets give the build order.
