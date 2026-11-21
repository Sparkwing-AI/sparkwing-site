import { statuses, type Lead, type Status } from '../../shared/types';
import { accessUser } from './access';
import { insightsPage, overviewPage, ranges, transcriptsPage, type Filter, type LogTurn, type Range } from './chatpages';
import type { SessionRow } from './chatstats';
import { shell } from './layout';
import { csvFor, listTabs, page, type ListTab } from './render';

interface Env {
  DB: D1Database;
  /** The chat Worker's log database. This Worker only ever reads it. */
  CHATLOG?: D1Database;
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
  if (tab === 'forms') {
    filters.push("leads.type IN ('beta', 'enquiry')");
  } else if (tab !== 'all') {
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


const sessionColumns =
  'session_id, started_at, last_activity_at, country, start_page, last_page, turns, offered, lead_sent, outcome, flag, topic, cost_usd';
const sessionId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAY = 24 * 60 * 60 * 1000;

function asRange(value: string | null): Range {
  return ranges.some(([key]) => key === value) ? (value as Range) : '30';
}

function sinceFor(range: Range): string {
  return range === 'all' ? '' : new Date(Date.now() - Number(range) * DAY).toISOString();
}

function asFilter(value: string | null): Filter {
  return value === 'lead' || value === 'left' || value === 'flagged' ? value : 'all';
}

async function sessionsSince(db: D1Database, since: string, limit: number): Promise<SessionRow[]> {
  const { results } = await db
    .prepare(`SELECT ${sessionColumns} FROM chat_sessions WHERE started_at >= ? ORDER BY started_at DESC LIMIT ?`)
    .bind(since, limit)
    .all<SessionRow>();
  return results;
}

function notConnected(user: string): Response {
  return html(shell('Chat', 'overview', user, '<h2 class="title">Chat</h2><p>The chat log database is not connected to this Worker yet. See docs/website/SPARKY-GOLIVE.md, section 5.</p>'), 503);
}

async function chatRoutes(url: URL, env: Env, user: string): Promise<Response | null> {
  if (!['/chat', '/chat/transcripts', '/chat/insights'].includes(url.pathname)) return null;
  const chat = env.CHATLOG;
  if (!chat) return notConnected(user);

  if (url.pathname === '/chat') {
    const range = asRange(url.searchParams.get('range'));
    const since = sinceFor(range);
    const rows = await sessionsSince(chat, since, 20000);
    const leads = await env.DB.prepare(
      "SELECT COUNT(*) AS total, COALESCE(SUM(confirmation_sent_at IS NOT NULL), 0) AS confirmed FROM leads WHERE type = 'chat' AND created_at >= ?",
    )
      .bind(since)
      .first<{ total: number; confirmed: number }>();
    return html(overviewPage(rows, range, user, { total: leads?.total ?? 0, confirmed: leads?.confirmed ?? 0 }));
  }

  if (url.pathname === '/chat/insights') {
    const range = asRange(url.searchParams.get('range'));
    const rows = await sessionsSince(chat, sinceFor(range), 20000);
    const { results } = await chat
      .prepare(
        "SELECT question, COUNT(*) AS n FROM chat_log WHERE decision = 'fallback' AND created_at >= ? GROUP BY lower(question) ORDER BY n DESC, MAX(created_at) DESC LIMIT 10",
      )
      .bind(new Date(Date.now() - 90 * DAY).toISOString())
      .all<{ question: string; n: number }>();
    return html(insightsPage(rows, range, user, results));
  }

  const filter = asFilter(url.searchParams.get('filter'));
  const rows = await sessionsSince(chat, '', 300);
  const wanted = url.searchParams.get('session') ?? '';
  let chosen: Parameters<typeof transcriptsPage>[3] = null;
  if (wanted) {
    if (!sessionId.test(wanted)) {
      chosen = { session: null, turns: [], leadId: null, asked: wanted };
    } else {
      const session = await chat.prepare(`SELECT ${sessionColumns} FROM chat_sessions WHERE session_id = ?`).bind(wanted.toLowerCase()).first<SessionRow>();
      const turns = session
        ? (await chat.prepare('SELECT turn, created_at, question, answer, decision FROM chat_log WHERE session_id = ? ORDER BY turn').bind(wanted.toLowerCase()).all<LogTurn>()).results
        : [];
      const lead = session
        ? await env.DB.prepare('SELECT public_id FROM leads WHERE chat_session_id = ? LIMIT 1').bind(wanted.toLowerCase()).first<{ public_id: string }>()
        : null;
      chosen = { session, turns, leadId: lead?.public_id ?? null, asked: wanted };
    }
  }
  return html(transcriptsPage(rows, filter, user, chosen));
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

    const chatPage = await chatRoutes(url, env, user);
    if (chatPage) return chatPage;

    if (url.pathname !== '/') return new Response('Not found', { status: 404, headers: security });
    return html(page(await load(env, tab, marketing, q, source), tab, marketing, user, q, source));
  },
} satisfies ExportedHandler<Env>;
