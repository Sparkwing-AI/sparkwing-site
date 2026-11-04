import { statuses, type Lead, type Status } from '../../shared/types';
import { accessUser, type AccessEnv } from './access';
import { csvFor, page } from './render';

interface Env extends AccessEnv {
  DB: D1Database;
  /** Local testing only. Never set this in production: it skips the Access check. */
  DEV_BYPASS_ACCESS?: string;
}

const security = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};

const html = (body: string, status = 200) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...security } });

const tabs = { beta: 'beta', enquiries: 'enquiry', chat: 'chat' } as const;

async function load(env: Env, type: Lead['type'], marketing: boolean): Promise<Lead[]> {
  const sql = `SELECT * FROM leads WHERE type = ?${marketing ? ' AND marketing_consent = 1' : ''} ORDER BY created_at DESC LIMIT 1000`;
  const { results } = await env.DB.prepare(sql).bind(type).all<Lead>();
  return results;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const user = env.DEV_BYPASS_ACCESS === 'yes' ? 'dev' : await accessUser(request, env);
    // Fails closed: no token, wrong token, or Access not configured all end here.
    if (!user) return new Response('Sign in required', { status: 403, headers: security });

    const url = new URL(request.url);

    if (request.method === 'POST') {
      // Same-origin only, as a second guard on top of Access.
      if (request.headers.get('Origin') !== url.origin) return new Response('Bad origin', { status: 403, headers: security });
      const match = url.pathname.match(/^\/leads\/([0-9a-f-]{36})$/);
      if (!match) return new Response('Not found', { status: 404, headers: security });
      const form = await request.formData();
      const status = String(form.get('status') ?? '');
      if (!(statuses as readonly string[]).includes(status)) return new Response('Bad status', { status: 400, headers: security });
      const notes = String(form.get('notes') ?? '').slice(0, 5000);
      await env.DB.prepare('UPDATE leads SET status = ?, notes = ? WHERE id = ?').bind(status as Status, notes, match[1]).run();
      const back = new URL('/', url.origin);
      const tab = String(form.get('tab') ?? 'beta');
      back.searchParams.set('tab', tab in tabs ? tab : 'beta');
      if (form.get('marketing') === '1') back.searchParams.set('marketing', '1');
      return new Response(null, { status: 303, headers: { Location: `${back.pathname}${back.search}`, ...security } });
    }

    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: security });

    const tabParam = url.searchParams.get('tab') ?? 'beta';
    const tab = tabParam in tabs ? (tabParam as keyof typeof tabs) : 'beta';
    const marketing = url.searchParams.get('marketing') === '1';

    if (url.pathname === '/export.csv') {
      const leads = await load(env, tabs[tab], marketing);
      return new Response(csvFor(leads, tabs[tab]), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="leads-${tab}.csv"`,
          ...security,
        },
      });
    }

    if (url.pathname !== '/') return new Response('Not found', { status: 404, headers: security });
    return html(page(await load(env, tabs[tab], marketing), tab, marketing, user));
  },
} satisfies ExportedHandler<Env>;
