import { sendMail, type MailEnv } from './mail';
import { validate } from './validate';

interface Env extends MailEnv {
  DB: D1Database;
  LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
  ALLOWED_ORIGINS: string;
}

const maxBody = 20_000;

function allowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
  return allowed.includes(origin) ? origin : null;
}

function reply(status: number, body: unknown, origin: string | null): Response {
  const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' });
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  return new Response(JSON.stringify(body), { status, headers });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== '/api/leads') return new Response('Not found', { status: 404 });

    const origin = allowedOrigin(request, env);

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

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST, OPTIONS' } });
    }
    if (!origin) return reply(403, { error: 'origin' }, null);
    if (!(request.headers.get('Content-Type') ?? '').includes('application/json')) {
      return reply(415, { error: 'type' }, origin);
    }

    if (env.LIMITER) {
      const key = request.headers.get('CF-Connecting-IP') ?? 'unknown';
      const { success } = await env.LIMITER.limit({ key });
      if (!success) return reply(429, { error: 'rate' }, origin);
    }

    const raw = await request.text();
    if (raw.length > maxBody) return reply(413, { error: 'size' }, origin);
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return reply(400, { error: 'json' }, origin);
    }

    const result = validate(body);
    // A filled honeypot gets the same answer as a real send, so bots learn nothing.
    if (result.ok === 'spam') return reply(200, { ok: true }, origin);
    if (result.ok === false) return reply(400, { error: 'invalid', fields: result.errors }, origin);

    const s = result.value;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    try {
      await env.DB.prepare(
        `INSERT INTO leads (id, type, created_at, name, email, business, country, topic, message, business_type,
           first_task, source_page, contact_consent_at, marketing_consent, marketing_consent_at, consent_wording_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          id, s.type, now, s.name, s.email, s.business, s.country, s.topic, s.message, s.business_type,
          s.first_task, s.source_page, now, s.marketing_consent ? 1 : 0, s.marketing_consent ? now : null,
          s.consent_wording_version,
        )
        .run();
    } catch (error) {
      console.error('lead save failed', error instanceof Error ? error.message : 'unknown');
      return reply(500, { error: 'save' }, origin);
    }

    // The row is saved. A mail failure is logged and never fails the form (FR-907).
    ctx.waitUntil(
      sendMail(env, s, id)
        .then((outcome) => {
          if (outcome === 'skipped') console.warn('lead email skipped: Graph secrets are not set', id);
        })
        .catch((error) => console.error('lead email failed', id, error instanceof Error ? error.message : 'unknown')),
    );

    return reply(200, { ok: true }, origin);
  },
} satisfies ExportedHandler<Env>;
