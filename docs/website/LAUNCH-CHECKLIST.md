# Launch checklist

Launch is CORE-183 and is Elly's only. Each item names who supplies or does it.

## Before launch

- [ ] **Cloudflare Web Analytics (FR-601, blocker).** Elly supplies the site token. Set `PUBLIC_CF_ANALYTICS_TOKEN` as a repository variable for the production build. The snippet renders in production builds only, and only when the token is set. After launch, confirm visits show in Cloudflare and that no cookies are set.
- [ ] **Google Search Console.** Elly adds `sparkwing.com.au` as a property and chooses the HTML tag method. Set the code from the tag as `PUBLIC_GOOGLE_SITE_VERIFICATION` for the production build. The meta tag renders in production builds only and adds no script.
- [ ] **Sparkkeeper login address (blocker).** Confirm `PUBLIC_APP_URL` (default `https://sparkkeeper.com.au/`) is live and correct.
- [ ] **Forms (CORE-189).** Work through `docs/website/FORMS-SETUP.md`: D1 database, Exchange RBAC and Graph secrets, both Workers deployed, Access on the lead list, `PUBLIC_FORM_ENDPOINT` set for the production build, preview origin removed from `ALLOWED_ORIGINS`.
- [ ] **Local form origin (blocker before launch).** Remove `http://127.0.0.1:4321` from `ALLOWED_ORIGINS` in `workers/forms/wrangler.toml`, then redeploy `sparkwing-forms`. Keep `https://sparkwing.com.au` and `https://www.sparkwing.com.au`.
- [ ] **Demo link (blocker).** Elly confirms whether the demo stays. If it does, replace `PUBLIC_DEMO_URL` with a Sparkwing domain. If not, remove the "Try the demo" buttons.

## After the production deploy

- [ ] **Google Search Console.** Click Verify in Search Console, then submit `https://sparkwing.com.au/sitemap.xml` under Sitemaps. Check that it reads with no errors.

## Publish and roll back

`.github/workflows/publish.yml` builds the site and publishes the `dist` folder to GitHub Pages. The Astro build copies `CNAME` into `dist`, so `sparkwing.com.au` stays attached. The workflow has no push trigger. It runs only when someone starts **Publish** by hand from the Actions tab.

GitHub Pages is still set to serve the root of `main`. That root is the holding page. This checklist does not change that setting. Before the first run, switch the Pages source to GitHub Actions. That switch is a live setting, so it waits for Elly.

Ask Sparky stays off. The workflow does not set `PUBLIC_CHAT_ENABLED`.

Rollback, after a publish has gone live:

1. Open the repository, then Actions, then Publish.
2. Open the last good run and choose Re-run all jobs. That run builds the commit it originally used and publishes it again.
3. To return to the holding page, set Pages back to Deploy from a branch, branch `main`, folder `/ (root)`. That serves the root `index.html` again. Do that only when the Actions deployment should stop.
