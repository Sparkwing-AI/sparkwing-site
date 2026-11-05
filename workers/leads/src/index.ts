import { statuses, type Lead, type Status } from '../../shared/types';
import { accessUser } from './access';
import { csvFor, listTabs, page, type ListTab } from './render';

interface Env {
  DB: D1Database;
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

const typeOf = { beta: 'beta', enquiries: 'enquiry', chat: 'chat' } as const;

function asTab(value: string | null): ListTab {
  return value && (listTabs as readonly string[]).includes(value) ? (value as ListTab) : 'all';
}

/** Drops the scrambled source before anything is rendered or exported. */
function forDisplay(rows: Array<Lead & { ip_hash?: string | null }>): Lead[] {
  return rows.map((row) => {
    const shown = { ...row, same_source: Number(row.same_source ?? 0) };
    delete shown.ip_hash;
    return shown;
  });
}

async function load(env: Env, tab: ListTab, marketing: boolean): Promise<Lead[]> {
  const filters: string[] = [];
  const binds: string[] = [];
  if (tab !== 'all') {
    filters.push('type = ?');
    binds.push(typeOf[tab]);
  }
  if (marketing) filters.push('marketing_consent = 1');
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const sql = `SELECT leads.*, CASE WHEN leads.ip_hash IS NULL OR leads.ip_hash = '' THEN 0 ELSE (SELECT COUNT(*) FROM leads AS same WHERE same.ip_hash = leads.ip_hash) - 1 END AS same_source FROM leads ${where} ORDER BY created_at DESC LIMIT 1000`;
  const { results } = await env.DB.prepare(sql).bind(...binds).all<Lead & { ip_hash?: string | null }>();
  return forDisplay(results);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Fails closed: no Access context, or a signed-in identity with no email.
    const user = await accessUser(ctx);
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
      back.searchParams.set('tab', asTab(String(form.get('tab') ?? 'all')));
      if (form.get('marketing') === '1') back.searchParams.set('marketing', '1');
      return new Response(null, { status: 303, headers: { Location: `${back.pathname}${back.search}`, ...security } });
    }

    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: security });

    const tab = asTab(url.searchParams.get('tab'));
    const marketing = url.searchParams.get('marketing') === '1';

    if (url.pathname === '/export.csv') {
      const leads = await load(env, tab, marketing);
      return new Response(csvFor(leads), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="leads-${tab}.csv"`,
          ...security,
        },
      });
    }

    if (url.pathname !== '/') return new Response('Not found', { status: 404, headers: security });
    return html(page(await load(env, tab, marketing), tab, marketing, user));
  },
} satisfies ExportedHandler<Env>;
