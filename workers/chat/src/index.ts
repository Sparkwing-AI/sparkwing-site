import { cleanPage, MAX_BODY, prepareMessage } from './checks';
import { ChatLimits, ChatSession, type Env } from './state';

export { ChatLimits, ChatSession };

const SESSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function originOf(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  const allowed = env.ALLOWED_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean);
  return allowed.includes(origin) ? origin : null;
}

function reply(status: number, body: unknown, origin: string | null): Response {
  const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' });
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  return new Response(JSON.stringify(body), { status, headers });
}

function localOrigin(origin: string): boolean {
  return origin.startsWith('http://127.0.0.1:') || origin.startsWith('http://localhost:');
}

/** Without a secret, only local development passes. Production fails closed. */
async function turnstileOk(token: unknown, env: Env, origin: string, ip: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return localOrigin(origin);
  if (typeof token !== 'string' || !token || token.length > 2048) return false;
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
  });
  if (!response.ok) return false;
  const data = (await response.json()) as { success?: boolean; hostname?: string; action?: string };
  if (data.success !== true || data.action !== 'chat_start') return false;
  return !env.EXPECTED_HOSTNAME || data.hostname === env.EXPECTED_HOSTNAME;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== '/api/chat') return new Response('Not found', { status: 404 });
    const origin = originOf(request, env);
    if (request.method === 'OPTIONS') {
      if (!origin) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
          Vary: 'Origin',
        },
      });
    }
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    if (!origin) return reply(403, { error: 'origin' }, null);
    if (env.CHAT_ENABLED === 'false') return reply(503, { error: 'offline' }, origin);

    const declared = Number(request.headers.get('Content-Length') ?? '0');
    if (declared > MAX_BODY) return reply(413, { error: 'size' }, origin);
    const raw = await request.text();
    if (raw.length > MAX_BODY) return reply(413, { error: 'size' }, origin);

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return reply(400, { error: 'json' }, origin);
    }

    if (body.action === 'start') {
      const ip = request.headers.get('CF-Connecting-IP') ?? 'local';
      if (!(await turnstileOk(body.turnstile, env, origin, ip))) return reply(403, { error: 'turnstile' }, origin);
      const limits = env.LIMITS.get(env.LIMITS.idFromName('global'));
      if (!(await limits.budgetLeft())) return reply(503, { error: 'offline' }, origin);
      if (!(await limits.allowStart(ip))) return reply(429, { error: 'limit' }, origin);
      const id = crypto.randomUUID();
      await env.SESSIONS.get(env.SESSIONS.idFromName(id)).begin();
      return reply(200, { ok: true, session_id: id }, origin);
    }

    const id = typeof body.session_id === 'string' && SESSION_ID.test(body.session_id) ? body.session_id : '';
    if (!id) return reply(400, { error: 'session' }, origin);
    const session = env.SESSIONS.get(env.SESSIONS.idFromName(id));

    if (body.action === 'end') {
      await session.end();
      return reply(200, { ok: true }, origin);
    }

    // Only these fields are read. A forged system, history, model or max_tokens field goes nowhere.
    const message = prepareMessage(body.message);
    if (!message) return reply(400, { error: 'message' }, origin);

    const result = await session.send(message, cleanPage(body.page), id);
    if (result.kind === 'error') return reply(result.status, { error: result.error }, origin);
    return reply(200, { session_id: id, answer: result.answer, sources: result.sources, action: result.action, on_topic: result.onTopic, closed: result.closed }, origin);
  },

  /** Daily: masked chats go after 30 days. */
  async scheduled(_event: ScheduledController, env: Env): Promise<void> {
    if (!env.DB) return;
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    await env.DB.prepare('DELETE FROM chat_log WHERE created_at < ?').bind(cutoff).run();
  },
} satisfies ExportedHandler<Env>;
