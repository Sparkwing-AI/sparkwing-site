import { esc, when } from './common';
import { shell } from './layout';
import { computeStats, effectiveOutcome, pct, spamLabels, type Bar, type SessionRow, type Stats } from './chatstats';

export const ranges = [
  ['7', 'Last 7 days'],
  ['30', 'Last 30 days'],
  ['90', 'Last 90 days'],
  ['all', 'All time'],
] as const;
export type Range = (typeof ranges)[number][0];

export const topicNames: Record<string, string> = {
  pricing: 'Pricing and cost',
  what_is_sparkwing: 'What is Sparkwing',
  sparkkeeper_features: 'Sparkkeeper features',
  ai_plan: 'AI plan and consulting',
  security_privacy: 'Data security and privacy',
  integrations: 'Integrations (Xero, email, calendar)',
  websites_apps: 'Websites and custom apps',
  other: 'Something else',
  off_topic: 'Off-topic',
  unlabelled: 'Not labelled yet',
};

const palette = ['#0d3b36', '#1f8a70', '#feb938', '#8cc9b3', '#b3541e', '#6b4e9b', '#5b7f95', '#9a9a8a'];
const rust = ['#6b2d0c', '#b3541e', '#e8a36f', '#f6dccb'];

function chips(base: string, current: string): string {
  return `<nav class="chips" aria-label="Period">${ranges.map(([key, label]) => `<a href="${base}?range=${key}"${key === current ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
}

function kpi(label: string, value: string, note: string): string {
  return `<div class="kpi"><div class="label">${esc(label)}</div><div class="value">${esc(value)}</div><div class="note">${esc(note)}</div></div>`;
}

function bars(items: Bar[], dark = false): string {
  const max = Math.max(1, ...items.map((i) => i.n));
  if (!items.length) return '<p class="sub">Nothing yet.</p>';
  return items
    .map((i) => `<div class="row"><span>${esc(i.label)}</span><div class="track"><div class="fill${dark ? ' dark' : ''}" style="width:${Math.round((i.n / max) * 100)}%"></div></div><b>${i.n}</b></div>`)
    .join('');
}

function donut(items: Bar[], colours: string[], label: string): string {
  const total = items.reduce((sum, i) => sum + i.n, 0);
  if (!total) return '<p class="sub">Nothing yet.</p>';
  let acc = 0;
  const stops = items.map((item, i) => {
    const from = (acc / total) * 100;
    acc += item.n;
    return `${colours[i % colours.length]} ${from.toFixed(2)}% ${((acc / total) * 100).toFixed(2)}%`;
  });
  const legend = items
    .map((item, i) => `<div><span class="sw" style="background:${colours[i % colours.length]}"></span><span class="name">${esc(item.label)}</span><b>${pct(item.n, total)}</b></div>`)
    .join('');
  return `<div class="donut-wrap"><div class="donut" role="img" aria-label="${esc(label)}, listed beside the chart" style="background:conic-gradient(${stops.join(',')})"></div><div class="legend">${legend}</div></div>`;
}

export function overviewPage(rows: SessionRow[], range: Range, user: string, leadStats: { total: number; confirmed: number }): string {
  const s = computeStats(rows);
  const funnel = s.funnel
    .map((f, i) => {
      const before = i === 0 ? 0 : s.funnel[i - 1].n;
      const share = i === 0 ? '' : pct(f.n, before);
      return `<div class="row" style="grid-template-columns:minmax(150px,230px) 1fr 120px"><span>${esc(f.label)}</span><div class="track" style="height:22px"><div class="fill" style="height:22px;width:${s.opened ? Math.round((f.n / s.opened) * 100) : 0}%"></div></div><b>${f.n} <span style="font-weight:400">${share}</span></b></div>`;
    })
    .join('');
  const body = `<h2 class="title">Ask Sparky performance</h2>
<p class="sub">Times are UTC. Counts, topics and flags are kept with no end date. Topics and spam flags update each night, so the newest chats show as not labelled yet.</p>
${chips('/chat', range)}
${
  s.opened
    ? `<div class="kpis">
${kpi('Chats opened', String(s.opened), 'widget opened and a chat started')}
${kpi('Engagement rate', pct(s.messaged, s.opened), `${s.messaged} sent at least one message`)}
${kpi('Questions per chat', s.avgTurns.toFixed(1), `median ${s.medianTurns}, genuine chats`)}
${kpi('Fall-off rate', pct(s.fallOff, s.genuine), 'genuine chats with no details left')}
${kpi('Lead rate', pct(s.leads, s.genuine), `${s.leads} of ${s.genuine} genuine chats`)}
${kpi('Flagged as spam', String(s.flagged), `${pct(s.flagged, s.messaged)} of chats with a message`)}
${kpi('Gone by question 2', pct(s.early, s.genuine), 'genuine chats that left without details')}
${kpi('Cost per chat', `$${(s.opened ? s.cost / s.opened : 0).toFixed(3)}`, `$${s.cost.toFixed(2)} in total`)}
</div>
<section class="panel"><h2>Conversation funnel</h2><p class="sub">How many chats got to each step, and the share of the step before.</p>${funnel}
<p>Chats that stop before leaving details are <strong>fall-offs</strong>. They count here and in Topics. They are not leads, because there are no contact details and no permission to contact.</p></section>
<div class="grid2">
<section class="panel"><h2>Where chats ended</h2><p class="sub">The last thing that happened, for genuine chats with no details left.</p>${bars(s.exits, true)}</section>
<section class="panel"><h2>Page they were on when they left</h2><p class="sub">The last page sent with their final message.</p>${bars(s.pages, true)}</section>
<section class="panel"><h2>Country</h2><p class="sub">Country code at chat start. No IP address is kept.</p>${donut(s.countries, palette, 'Country split')}</section>
<section class="panel"><h2>Possible spam and bots</h2><p class="sub">${s.flagged} flagged. They are left out of engagement and lead rates.</p>${donut(s.spam, rust, 'Spam reasons')}</section>
</div>
<section class="panel"><h2>Chat leads and email</h2><p class="sub">From the lead list, for the same period.</p>
<p>${leadStats.total} chat leads saved. Confirmation email sent for ${leadStats.confirmed} of ${leadStats.total}.</p></section>`
    : '<p>No chats in this period yet.</p>'
}`;
  return shell('Chat overview', 'overview', user, body);
}

const filters = [
  ['all', 'All'],
  ['lead', 'Left details'],
  ['left', 'Fell off'],
  ['flagged', 'Flagged'],
] as const;
export type Filter = (typeof filters)[number][0];

function outcomeTag(row: SessionRow): [string, string] {
  if (row.flag) return ['Flagged', 'tag-flag'];
  const outcome = effectiveOutcome(row);
  if (row.lead_sent === 1 || outcome === 'lead') return ['Left details', 'tag-done'];
  if (outcome === 'no_message') return ['No message', 'tag-quiet'];
  return ['Fell off', 'tag-quiet'];
}

export function matchesFilter(row: SessionRow, filter: Filter): boolean {
  if (filter === 'all') return true;
  const [label] = outcomeTag(row);
  if (filter === 'lead') return label === 'Left details';
  if (filter === 'flagged') return label === 'Flagged';
  return label === 'Fell off' || label === 'No message';
}

export interface LogTurn {
  turn: number;
  created_at: string;
  question: string;
  answer: string;
  decision: string;
}

export function transcriptsPage(
  rows: SessionRow[],
  filter: Filter,
  user: string,
  chosen: { session: SessionRow | null; turns: LogTurn[]; leadId: string | null; asked: string } | null,
): string {
  const shown = rows.filter((r) => matchesFilter(r, filter)).slice(0, 200);
  const list = shown
    .map((r) => {
      const [label, cls] = outcomeTag(r);
      const picked = chosen?.session?.session_id === r.session_id;
      return `<tr${picked ? ' class="picked"' : ''}><td><a href="/chat/transcripts?filter=${filter}&amp;session=${esc(r.session_id)}" aria-label="Open chat ${esc(r.session_id.slice(0, 8))}">${esc(r.session_id.slice(0, 8))}</a></td><td class="nowrap">${when(r.started_at)}</td><td>${esc(r.country || '-')}</td><td>${r.turns}</td><td>${esc(r.topic ? (topicNames[r.topic] ?? r.topic) : r.flag ? (spamLabels[r.flag] ?? r.flag) : '-')}</td><td><span class="tag ${cls}">${label}</span></td></tr>`;
    })
    .join('');
  let detail = '<p class="sub">Pick a chat to read it.</p>';
  if (chosen?.session) {
    const r = chosen.session;
    const [label] = outcomeTag(r);
    const turns = chosen.turns.length
      ? chosen.turns
          .map((t) => `<div class="turn"><b>Visitor</b><p>${esc(t.question)}</p></div><div class="turn sparky"><b>Sparky</b><p>${esc(t.answer)}</p></div>`)
          .join('')
      : '<p>The transcript has been deleted under the retention period. The summary above stays.</p>';
    const last = chosen.turns.at(-1)?.decision;
    detail = `<h2>${esc(r.session_id.slice(0, 8))} · ${label}</h2>
<p class="sub">${esc(r.country || 'Unknown country')} · started on ${esc(r.start_page || 'unknown page')} · ${r.turns} turns · ${when(r.started_at)}</p>
${turns}
<p><strong>Last decision:</strong> ${esc(last ?? 'not kept')}${r.flag ? ` · <strong>Flag:</strong> ${esc(spamLabels[r.flag] ?? r.flag)}` : ''}</p>
<p><strong>Linked lead:</strong> ${chosen.leadId ? `<a href="/?tab=chat&amp;q=${esc(chosen.leadId)}">${esc(chosen.leadId)}</a>` : 'None'}</p>`;
  } else if (chosen && !chosen.session) {
    detail = '<p>That chat was not found.</p>';
  }
  const body = `<h2 class="title">Chat transcripts</h2>
<p class="sub">Masked text: emails, phone numbers and long numbers are hidden before anything is saved. Transcripts are deleted after the period in the privacy policy. The per-chat summaries stay.</p>
<nav class="chips" aria-label="Filter">${filters.map(([key, label]) => `<a href="/chat/transcripts?filter=${key}"${key === filter ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
<div class="split">
<section class="panel list scroll"><table class="data"><thead><tr><th>Chat</th><th>Started</th><th>Country</th><th>Turns</th><th>Topic</th><th>Outcome</th></tr></thead><tbody>${list || '<tr><td colspan="6">No chats here yet.</td></tr>'}</tbody></table></section>
<section class="panel detail">${detail}</section>
</div>`;
  return shell('Chat transcripts', 'transcripts', user, body);
}

export function insightLines(s: Stats): string[] {
  if (s.genuine < 10) return ['Not enough genuine chats yet for insights. They appear once there are 10 or more.'];
  const lines: string[] = [];
  const labelled = s.topics.filter((t) => t.id !== 'unlabelled');
  const top = labelled[0];
  if (top) lines.push(`${topicNames[top.id] ?? top.id} is the top topic, with ${top.n} chats (${pct(top.n, s.genuine)} of genuine chats).`);
  const worst = labelled.filter((t) => t.n >= 5).sort((a, b) => b.drop / b.n - a.drop / a.n)[0];
  if (worst) lines.push(`${pct(worst.drop, worst.n)} of ${topicNames[worst.id] ?? worst.id} chats ended without details.`);
  const page = s.pages[0];
  if (page && page.label !== 'Other') lines.push(`${page.label} is the page most chats ended on (${page.n} fall-offs).`);
  const abroad = s.countries.filter((c) => c.label !== 'Australia' && c.label !== 'Unknown').reduce((sum, c) => sum + c.n, 0);
  if (abroad) lines.push(`${pct(abroad, s.opened)} of chats start from outside Australia.`);
  return lines;
}

export function insightsPage(rows: SessionRow[], range: Range, user: string, gaps: { question: string; n: number }[]): string {
  const s = computeStats(rows);
  const topicRows = s.topics
    .map((t) => `<tr><td><b>${esc(topicNames[t.id] ?? t.id)}</b></td><td>${t.n}</td><td>${pct(t.n, s.genuine)}</td><td>${t.leads}</td><td>${t.drop}</td></tr>`)
    .join('');
  const labelledBars = s.topics.filter((t) => t.id !== 'unlabelled').map((t) => ({ label: topicNames[t.id] ?? t.id, n: t.n }));
  const body = `<h2 class="title">Topics and insights</h2>
<p class="sub">A small model labels each chat once a night with one topic from a fixed list. Only the label is kept long term.</p>
${chips('/chat/insights', range)}
<div class="grid2">
<section class="panel"><h2>What people ask about</h2><p class="sub">Share of genuine chats with a topic.</p>${donut(labelledBars, palette, 'Topic split')}</section>
<section class="panel"><h2>Insights</h2><ul>${insightLines(s).map((l) => `<li>${esc(l)}</li>`).join('')}</ul></section>
</div>
<section class="panel scroll"><h2>Topics in detail</h2><table class="data"><thead><tr><th>Topic</th><th>Chats</th><th>Share</th><th>Left details</th><th>Left without details</th></tr></thead><tbody>${topicRows || '<tr><td colspan="5">No chats in this period yet.</td></tr>'}</tbody></table></section>
<section class="panel"><h2>Sparky could not answer</h2><p class="sub">Questions that got the fallback reply while transcripts are kept, most repeated first. Good candidates for the knowledge pack.</p>
<ol>${gaps.map((g) => `<li>${esc(g.question)} <span class="hint">(${g.n})</span></li>`).join('') || '<li>None yet.</li>'}</ol></section>`;
  return shell('Topics and insights', 'insights', user, body);
}
