# Launch checklist

Launch is CORE-183 and is Elly's only. Each item names who supplies or does it.

## Before launch

- [ ] **Cloudflare Web Analytics (FR-601, blocker).** Elly supplies the site token. Set `PUBLIC_CF_ANALYTICS_TOKEN` as a repository variable for the production build. The snippet renders in production builds only, and only when the token is set. After launch, confirm visits show in Cloudflare and that no cookies are set.
- [ ] **Google Search Console.** Elly adds `sparkwing.com.au` as a property and chooses the HTML tag method. Set the code from the tag as `PUBLIC_GOOGLE_SITE_VERIFICATION` for the production build. The meta tag renders in production builds only and adds no script.
- [ ] **Sparkkeeper login address (blocker).** Confirm `PUBLIC_APP_URL` (default `https://sparkkeeper.com.au/`) is live and correct.
- [ ] **Forms (CORE-189).** Work through `docs/website/FORMS-SETUP.md`: D1 database, Exchange RBAC and Graph secrets, both Workers deployed, Access on the lead list, `PUBLIC_FORM_ENDPOINT` set for the production build, preview origin removed from `ALLOWED_ORIGINS`.
- [ ] **Demo link (blocker).** Elly confirms whether the demo stays. If it does, replace `PUBLIC_DEMO_URL` with a Sparkwing domain. If not, remove the "Try the demo" buttons.

## After the production deploy

- [ ] **Google Search Console.** Click Verify in Search Console, then submit `https://sparkwing.com.au/sitemap.xml` under Sitemaps. Check that it reads with no errors.
