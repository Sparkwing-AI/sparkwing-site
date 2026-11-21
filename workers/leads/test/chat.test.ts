import assert from 'node:assert/strict';
import worker from '../src/index.ts';
import { computeStats, effectiveOutcome, pct, type SessionRow } from '../src/chatstats.ts';
import { insightLines } from '../src/chatpages.ts';

const user = { access: { getIdentity: async () => ({ email: 'elly@sparkwing.com.au' }) } } as unknown as ExecutionContext;
const url = 'https://leads.example';
const id = (n: number) => `${String(n).padStart(8, '0')}-1111-4111-8111-111111111111`;

function row(n: number, over: Partial<SessionRow> = {}): SessionRow {
  return {
    session_id: id(n), started_at: '2026-11-20T01:00:00.000Z', country: 'AU', start_page: '/', last_page: '/', turns: 2, offered: 0,
    lead_sent: 0, outcome: 'left', flag: '', topic: 'pricing', cost_usd: 0.02, ...over,
  };
}

const rows: SessionRow[] = [
  row(1, { turns: 0, outcome: 'no_message', topic: null }),
  row(2, { turns: 1 }),
  row(3, { turns: 3, offered: 1, last_page: '/apps' }),
  row(4, { turns: 5, offered: 1, lead_sent: 1, outcome: 'lead' }),
  row(5, { turns: 3, flag: 'injection', topic: null, country: 'US' }),
  row(6, { turns: 12, outcome: 'cap', topic: 'ai_plan', country: 'PH' }),
  row(7, { turns: 2, outcome: 'active', topic: null, last_page: '/services' }),
];
const s = computeStats(rows);
assert.equal(s.opened, 7);
assert.equal(s.messaged, 6, 'chats with no message are not engaged');
assert.equal(s.flagged, 1);
assert.equal(s.genuine, 5, 'flagged chats are left out of genuine');
assert.equal(s.leads, 1);
assert.equal(s.fallOff, 4);
assert.equal(s.offered, 2);
assert.equal(s.early, 2, 'turns 1 and turns 2 with no details');
assert.equal(s.medianTurns, 3);
assert.equal(s.funnel[1].n, 6);
assert.equal(s.exits.find((e) => e.label === 'Closed by the message cap')?.n, 1);
assert.equal(s.exits.find((e) => e.label === 'Left after the lead card offer')?.n, 1);
assert.equal(s.exits.find((e) => e.label === 'Left after 1 question')?.n, 1);
assert.equal(s.topics.find((t) => t.id === 'unlabelled')?.n, 1, 'an unlabelled chat is counted, not hidden');
assert.equal(s.spam[0].label, 'Prompt injection phrases');
assert.equal(effectiveOutcome({ outcome: 'active', turns: 0 }), 'no_message');
assert.equal(effectiveOutcome({ outcome: 'active', turns: 4 }), 'left');
const now = Date.parse('2026-11-21T03:00:00.000Z');
assert.equal(effectiveOutcome({ outcome: 'active', turns: 2, last_activity_at: '2026-11-21T02:50:00.000Z' }, now), 'in_progress', 'a chat 10 minutes quiet is still going');
assert.equal(effectiveOutcome({ outcome: 'active', turns: 2, last_activity_at: '2026-11-21T02:20:00.000Z' }, now), 'left', 'a chat 40 minutes quiet fell off');
assert.equal(effectiveOutcome({ outcome: 'active', turns: 0, last_activity_at: '2026-11-21T02:59:00.000Z' }, now), 'no_message');
assert.equal(effectiveOutcome({ outcome: 'lead', turns: 2, last_activity_at: '2026-11-21T02:59:00.000Z' }, now), 'lead');
const withLive = computeStats([...rows, row(8, { turns: 2, outcome: 'active', last_activity_at: '2026-11-21T02:55:00.000Z' })], now);
assert.equal(withLive.fallOff, 4, 'a chat in progress is not a fall-off');
assert.equal(withLive.genuine, 6);
assert.equal(withLive.topics.find((t) => t.id === 'pricing')?.drop, s.topics.find((t) => t.id === 'pricing')?.drop, 'a chat in progress is not a topic drop');
assert.equal(pct(1, 0), '0%');
assert.equal(computeStats([]).opened, 0, 'no chats is fine');
assert.match(insightLines(s)[0], /Not enough genuine chats/);

// A fake chat log
const hostile = '<script>alert(1)</script> & "quote"';
function chatDb(sessions: SessionRow[]) {
  return {
    prepare(sql: string) {
      let args: unknown[] = [];
      const api = {
        bind(...a: unknown[]) {
          args = a;
          return api;
        },
        async all() {
          if (sql.includes('FROM chat_sessions')) return { results: sessions };
          if (sql.includes("decision = 'fallback'")) return { results: [{ question: hostile, n: 2 }] };
          if (sql.includes('FROM chat_log')) return { results: [{ turn: 1, created_at: '2026-11-20T01:00:00.000Z', question: hostile, answer: 'Hello <b>there</b>', decision: 'answered' }] };
          return { results: [] };
        },
        async first() {
          if (sql.includes('FROM chat_sessions')) return sessions.find((r) => r.session_id === args[0]) ?? null;
          return null;
        },
      };
      return api;
    },
  };
}
const leadsDb = {
  prepare(sql: string) {
    const api = {
      bind() {
        return api;
      },
      async all() {
        return { results: [] };
      },
      async first() {
        if (sql.includes('FROM leads WHERE chat_session_id')) return { public_id: 'L-0042' };
        return { total: 3, confirmed: 2 };
      },
    };
    return api;
  },
};
const env = { DB: leadsDb, CHATLOG: chatDb(rows) } as never;
const get = async (path: string, e: unknown = env) => worker.fetch(new Request(url + path), e as never, user);

const overview = await get('/chat?range=all');
const overviewHtml = await overview.text();
assert.equal(overview.status, 200);
assert.match(overviewHtml, /Ask Sparky performance/);
assert.match(overviewHtml, /Engagement rate/);
assert.match(overviewHtml, /conic-gradient/, 'country and spam are donuts');
assert.match(overviewHtml, /Confirmation email sent for 2 of 3/);
assert.match(overviewHtml, /aria-current="page">All time</);
assert.equal(overview.headers.get('Cache-Control'), 'no-store');
assert.match(overview.headers.get('X-Robots-Tag') ?? '', /noindex/);

const transcripts = await (await get('/chat/transcripts')).text();
assert.match(transcripts, /Chat transcripts/);
assert.match(transcripts, /Left details/);
assert.match(transcripts, /Flagged/);
assert.match(transcripts, /Fell off/);
assert.equal((await (await get('/chat/transcripts?filter=flagged')).text()).includes('class="tag tag-done"'), false, 'the flagged filter hides leads');

const liveEnv = { DB: leadsDb, CHATLOG: chatDb([row(9, { turns: 1, outcome: 'active', last_activity_at: new Date().toISOString() })]) };
assert.match(await (await get('/chat/transcripts', liveEnv)).text(), /tag-live">In progress</, 'a chat still going is in progress');
assert.equal((await (await get('/chat/transcripts?filter=left', liveEnv)).text()).includes('In progress'), false, 'the fell off filter hides chats still going');

const opened = await (await get(`/chat/transcripts?session=${id(4)}`)).text();
assert.match(opened, /&lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; &quot;quote&quot;/, 'visitor text is escaped');
assert.match(opened, /Hello &lt;b&gt;there&lt;\/b&gt;/, 'model text is escaped');
assert.equal(opened.includes('<script>alert'), false);
assert.match(opened, /L-0042/, 'the linked lead shows');

const bad = await (await get('/chat/transcripts?session=nope%27%3Bdrop')).text();
assert.match(bad, /That chat was not found/);
assert.equal(bad.includes('drop'), false, 'a bad id is not echoed');

const insights = await (await get('/chat/insights')).text();
assert.match(insights, /Topics and insights/);
assert.match(insights, /Sparky could not answer/);
assert.match(insights, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);

// Not connected, and not signed in
const none = await get('/chat', { DB: leadsDb });
assert.equal(none.status, 503);
assert.match(await none.text(), /not connected/);
const anon = await worker.fetch(new Request(url + '/chat'), env, {} as ExecutionContext);
assert.equal(anon.status, 403, 'chat pages need sign-in too');

// POST to a chat page is refused
const post = await worker.fetch(new Request(url + '/chat', { method: 'POST' }), env, user);
assert.notEqual(post.status, 200);

console.log('leads chat tests passed');
