# Ask Sparky: go-live steps

Drafted by Sunny 🤖 · ai-assisted · 6 Nov 2026. Rules and limits are in `CHATBOT.md`.

Keys go only into `.dev.vars` or Wrangler's prompts. They never go in chat, the repo or a log.

## 1. Create the keys (Elly)

1. In the Claude Console, create a workspace called `website-chat`, set a US$20 monthly spend limit and a spend notification, then create an API key in that workspace.
2. In Cloudflare, go to Turnstile and add a widget called `Sparkwing website`, for the hostname `sparkwing.com.au`, in Managed mode. Note the site key, which is public, and the secret key, which is not.

## 2. Try Sparky on your computer

From the repo, on the `feat/sparky-live` branch:

1. Create `workers/chat/.dev.vars` with one line: `ANTHROPIC_API_KEY=your key`. The file is gitignored.
2. Run the model tests: `npm run test:chat`. It sends about 210 short questions, for a few cents. Send Sunny the result, leaving out any key.
3. Run `npm run chat:dev` in one window.
4. In a second window, run `$env:PUBLIC_CHAT_ENABLED="true"; $env:PUBLIC_CHAT_ENDPOINT="http://127.0.0.1:8788/api/chat"; npm run dev`, then open http://127.0.0.1:4321 and chat with Sparky.

## 3. Set up the live Worker

1. Run `npx wrangler d1 create sparkwing-chat-log`, then send Sunny the `database_id`. It isn't a secret. Sunny adds it to `workers/chat/wrangler.toml` and you pull the change.
2. Run:

```
npx wrangler d1 migrations apply sparkwing-chat-log --remote --config workers/chat/wrangler.toml --env production
npx wrangler deploy --config workers/chat/wrangler.toml --env production
npx wrangler secret put ANTHROPIC_API_KEY --config workers/chat/wrangler.toml --env production
npx wrangler secret put TURNSTILE_SECRET_KEY --config workers/chat/wrangler.toml --env production
npx wrangler secret put TURNSTILE_SECRET_KEY --config workers/forms/wrangler.toml
npx wrangler deploy --config workers/forms/wrangler.toml
```

3. Send Sunny the chat Worker's address that the deploy prints, and the Turnstile site key.

## 4. Switch it on (Sunny, after Elly's go)

1. Merge the branch.
2. Set the GitHub repository variables `PUBLIC_CHAT_ENABLED=true`, `PUBLIC_CHAT_ENDPOINT` (the Worker address plus `/api/chat`) and `PUBLIC_TURNSTILE_SITE_KEY`.
3. Run Publish, then test the live chat, including the bot check and a chat lead.

## Off switch

In Cloudflare, open the `sparkwing-chat` Worker, go to Settings, then Variables, and set `CHAT_ENABLED` to `false`. Visitors see the offline message straight away and can still reach the team.

## Reading chats

Masked chats are in the `sparkwing-chat-log` D1 database, in the Cloudflare dashboard. They delete after 30 days.

## Not done yet

- Budget alerts reach only the Worker logs until `info@` email is fixed. The Claude Console limit and notification cover this for now.
- CHATBOT.md test 26, one lead per chat, is enforced in the widget. On the server, the limit is three an hour per visitor.
