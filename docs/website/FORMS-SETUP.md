# Forms setup (CORE-189)

Two Workers share one D1 database.

| Worker | Folder | Public? | What it does |
| --- | --- | --- | --- |
| `sparkwing-forms` | `workers/forms` | Yes, with allowed-origin checks | `POST /api/leads`. Validates, saves to D1, emails `info@` |
| `sparkwing-leads` | `workers/leads` | No. Cloudflare Access covers all traffic | Lead list with Beta and Enquiries tabs, status, notes, marketing filter, CSV export |

Secrets go in through wrangler's prompt only. Never paste them into chat, a file or the repo. `.dev.vars` is git-ignored and only used for local testing.

All commands run in PowerShell from the repo root.

## 1. Connect Cloudflare

```powershell
npx wrangler login
npx wrangler whoami
```

## 2. Create the database

```powershell
cd workers/forms
npx wrangler d1 create sparkwing-leads
```

Copy the `database_id` it prints into `database_id` in both `workers/forms/wrangler.toml` and `workers/leads/wrangler.toml`. Then create the table:

```powershell
npx wrangler d1 migrations apply sparkwing-leads --remote
```

## 3. Email through Microsoft Graph, limited to the info@ mailbox

This uses Exchange RBAC for Applications. Do not grant tenant-wide `Mail.Send` consent in Entra.

1. In Entra, register an app called "Sparkwing website forms". Add a client secret. Add no Graph API permissions.
2. Note the Application (client) ID, the Directory (tenant) ID, and the Object ID of the app's Enterprise application.
3. In Exchange Online PowerShell, replace the three placeholders:

```powershell
Connect-ExchangeOnline
New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "Sparkwing website forms"
New-ManagementScope -Name "Sparkwing info mailbox" -RecipientRestrictionFilter "PrimarySmtpAddress -eq 'info@sparkwing.com.au'"
New-ManagementRoleAssignment -App <enterprise-app-object-id> -Role "Application Mail.Send" -CustomResourceScope "Sparkwing info mailbox"
Test-ServicePrincipalAuthorization -Identity <enterprise-app-object-id> -Resource info@sparkwing.com.au
```

The test should show `Application Mail.Send` as in scope for info@, and not in scope for any other mailbox. Role assignments can take up to 30 minutes to apply. Check the cmdlet names against Microsoft's current "RBAC for Applications" page, as they were written from memory.

4. Set the three secrets. Each command prompts for the value:

```powershell
cd workers/forms
npx wrangler secret put GRAPH_TENANT_ID
npx wrangler secret put GRAPH_CLIENT_ID
npx wrangler secret put GRAPH_CLIENT_SECRET
```

Until all three exist, the Worker still saves every lead and logs "lead email skipped".

## 4. Deploy the forms Worker

While testing, add the preview origin to `ALLOWED_ORIGINS` in `workers/forms/wrangler.toml`, for example `https://<hash>.sparkwing-site.pages.dev`. Take it out again before launch.

```powershell
cd workers/forms
npx wrangler deploy
```

Note the URL it prints, such as `https://sparkwing-forms.<subdomain>.workers.dev`. Set it as the GitHub repository variable `PUBLIC_FORM_ENDPOINT` (Settings, Secrets and variables, Actions, Variables). The preview workflow passes it to the build. Use the same value for the production build.

## 5. Deploy the lead list behind Access

```powershell
cd workers/leads
npx wrangler deploy
```

Then in the Cloudflare dashboard, open Workers & Pages, `sparkwing-leads`, Access. Turn Access on for the Worker so it covers every route, including the `workers.dev` hostname. Allow only Sparkwing team emails. Worker-level Access does not give an AUD tag or a team domain to paste into the config. The Worker reads the signed-in person from `ctx.access` and `await ctx.access.getIdentity()`.

If Access did not run, or the identity has no email, the Worker answers 403 and shows no lead data. Do not set `DEV_BYPASS_ACCESS` in production, and do not put it in `wrangler.toml`.

Turn off Preview URLs for the Worker if they are still on.

## 6. Test both forms end to end

1. Open the preview. Send the Beta form and the enquiry modal with test details. Both should show their confirmation.
2. Open the lead list. The Beta row should show "What the business does" and "First admin task" separately. Set a status and a note, then export the CSV.
3. Check `info@` for `[Beta application] {business}, {country}` and `[Website enquiry] {topic}: {name}`. Reply-To should be the test address.
4. Stop the Worker or break the URL, send again, and check the form stays filled with "That didn't send...".
5. Run `npx wrangler tail sparkwing-forms` while sending to watch for "lead email failed".

## Local testing

```powershell
cd workers/forms
"ALLOWED_ORIGINS=http://localhost:4321" | Out-File .dev.vars -Encoding ascii
npx wrangler d1 migrations apply sparkwing-leads --local --persist-to ../.state
npx wrangler dev --port 8787 --persist-to ../.state
```

Build the site with `PUBLIC_FORM_ENDPOINT=http://localhost:8787`.

For the lead list locally, `wrangler dev` can pretend someone is signed in. Add this to `workers/leads/wrangler.toml` only while you are testing, then take it out before you deploy:

```toml
[access.dev]
aud = "local"

  [access.dev.identity]
  email = "you@sparkwing.com.au"
```

`ctx.access` is then set, and `getIdentity()` returns that email. Remove the block to try a request with no sign-in: `ctx.access` is undefined and the Worker returns 403. Do not set `DEV_BYPASS_ACCESS` in production.

## Still waiting on Elly

- Retention period for leads. Nothing deletes rows yet.
- Beta FAQ promises and the Privacy and beta terms wording.
- Whether marketing email is ever sent. None goes out until Privacy covers it and an unsubscribe works.
