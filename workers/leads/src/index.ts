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

const leadId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function asTab(value: string | null): ListTab {
  return value && (listTabs as readonly string[]).includes(value) ? (value as ListTab) : 'all';
}

const readableId = /^L-[0-9]+$/;

/** The page sends Referrer-Policy: no-referrer, so a same-origin form can arrive with Origin: null. */
function formIsSameOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get('Origin');
  if (origin === url.origin) return true;
  const host = request.headers.get('Host');
  if (origin && origin !== 'null' && host) {
    try {
      const sent = new URL(origin);
      if (sent.host === host) return true;
    } catch {
      return false;
    }
  }
  const site = request.headers.get('Sec-Fetch-Site');
  return (origin === null || origin === 'null') && (site === 'same-origin' || site === 'none');
}

/** Drops the scrambled source before anything is rendered or exported. */
function forDisplay(rows: Array<Lead & { ip_hash?: string | null; same_source_ids?: string | null }>): Lead[] {
  return rows.map((row) => {
    const same_ids = String(row.same_source_ids ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter((id) => readableId.test(id));
    const shown = { ...row, same_ids };
    delete shown.ip_hash;
    delete shown.same_source_ids;
    return shown;
  });
}

function searchTerm(raw: string): string | null {
  const cleaned = raw.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 100);
  if (!cleaned) return null;
  return `%${cleaned.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
}

async function load(env: Env, tab: ListTab, marketing: boolean, q: string, source: string | null): Promise<Lead[]> {
  const filters: string[] = [];
  const binds: string[] = [];
  if (tab !== 'all') {
    filters.push('leads.type = ?');
    binds.push(typeOf[tab]);
  }
  if (marketing) filters.push('leads.marketing_consent = 1');
  const term = searchTerm(q);
  if (term) {
    filters.push(
      `(leads.public_id LIKE ? ESCAPE '\\' OR leads.name LIKE ? ESCAPE '\\' OR leads.email LIKE ? ESCAPE '\\' OR IFNULL(leads.business, '') LIKE ? ESCAPE '\\')`,
    );
    binds.push(term, term, term, term);
  }
  if (source && readableId.test(source)) {
    filters.push(
      `leads.ip_hash IS NOT NULL AND leads.ip_hash != '' AND leads.ip_hash = (SELECT origin.ip_hash FROM leads AS origin WHERE origin.public_id = ? AND origin.ip_hash IS NOT NULL AND origin.ip_hash != '')`,
    );
    binds.push(source);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const sql = `SELECT leads.*, (
      SELECT group_concat(public_id, ',') FROM (
        SELECT other.public_id FROM leads AS other
        WHERE other.ip_hash = leads.ip_hash
          AND other.ip_hash IS NOT NULL AND other.ip_hash != ''
          AND other.id != leads.id
        ORDER BY other.created_at
      )
    ) AS same_source_ids
    FROM leads ${where} ORDER BY leads.created_at DESC LIMIT 1000`;
  const { results } = await env.DB.prepare(sql).bind(...binds).all<Lead & { ip_hash?: string | null; same_source_ids?: string | null }>();
  return forDisplay(results);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Fails closed: no Access context, or a signed-in identity with no email.
    const user = await accessUser(ctx);
    if (!user) return new Response('Sign in required', { status: 403, headers: security });

    const url = new URL(request.url);

    const deletion = url.pathname.match(/^\/leads\/([^/]+)\/delete$/);
    if (deletion) {
      if (request.method === 'GET') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST', ...security } });
      if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: security });
      if (!formIsSameOrigin(request, url)) return new Response('Bad origin', { status: 403, headers: security });
      const id = deletion[1];
      if (!leadId.test(id)) return new Response('Bad id', { status: 400, headers: security });
      const existing = await env.DB.prepare('SELECT type FROM leads WHERE id = ?').bind(id).first<{ type: string }>();
      if (!existing || !['beta', 'enquiry', 'chat'].includes(existing.type)) {
        return new Response('Not found', { status: 404, headers: security });
      }
      const form = await request.formData();
      await env.DB.batch([
        env.DB.prepare(
          'INSERT INTO lead_deletions (id, lead_id, lead_type, deleted_by, deleted_at) VALUES (?, ?, ?, ?, ?)',
        ).bind(crypto.randomUUID(), id, existing.type, user, new Date().toISOString()),
        env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(id),
      ]);
      const back = new URL('/', url.origin);
      back.searchParams.set('tab', asTab(String(form.get('tab') ?? 'all')));
      if (form.get('marketing') === '1') back.searchParams.set('marketing', '1');
      return new Response(null, { status: 303, headers: { Location: `${back.pathname}${back.search}`, ...security } });
    }

    if (request.method === 'POST') {
      // Same-origin only, as a second guard on top of Access.
      if (!formIsSameOrigin(request, url)) return new Response('Bad origin', { status: 403, headers: security });
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
    const q = url.searchParams.get('q') ?? '';
    const sourceParam = url.searchParams.get('source') ?? '';
    const source = readableId.test(sourceParam) ? sourceParam : null;

    if (url.pathname === '/export.csv') {
      const leads = await load(env, tab, marketing, q, source);
      return new Response(csvFor(leads), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="leads-${tab}.csv"`,
          ...security,
        },
      });
    }

    if (url.pathname !== '/') return new Response('Not found', { status: 404, headers: security });
    return html(page(await load(env, tab, marketing, q, source), tab, marketing, user, q, source));
  },
} satisfies ExportedHandler<Env>;
