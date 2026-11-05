import { statuses, type Lead } from '../../shared/types';

const esc = (value: string | number | null | undefined) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const when = (iso: string) => esc(iso.slice(0, 16).replace('T', ' ')) + ' UTC';

const style = `
:root { color-scheme: light dark; --bg: #fff8e7; --ink: #0d3b36; --card: #fff; --line: #cfc9b6; --accent: #1f8a70; }
@media (prefers-color-scheme: dark) { :root { --bg: #0d2b28; --ink: #f4efe0; --card: #123b36; --line: #2d5b54; --accent: #4fc4a3; } }
* { box-sizing: border-box; }
body { margin: 0; padding: 24px 16px 64px; background: var(--bg); color: var(--ink); font: 16px/1.5 system-ui, sans-serif; }
main { max-width: 1100px; margin: 0 auto; }
h1 { margin: 0 0 4px; font-size: 1.5rem; }
.who { margin: 0 0 24px; opacity: .8; }
nav { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 16px; }
nav a, button { min-height: 44px; padding: 0 16px; border: 1.5px solid var(--ink); border-radius: 999px; background: transparent; color: var(--ink); font: inherit; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; cursor: pointer; }
nav a[aria-current='page'] { background: var(--ink); color: var(--bg); }
.card { margin: 0 0 16px; padding: 16px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); scroll-margin-top: 16px; }
.card:target { animation: lead-mark 2s ease-out 1; }
@keyframes lead-mark { from { box-shadow: 0 0 0 3px var(--accent); } to { box-shadow: 0 0 0 3px transparent; } }
@media (prefers-reduced-motion: reduce) { .card:target { animation: none; box-shadow: 0 0 0 3px var(--accent); } }
.ref { margin: 0 0 8px; font-weight: 700; letter-spacing: .04em; }
.find { display: flex; flex-wrap: wrap; gap: 8px; align-items: end; margin: 0 0 16px; }
.find input { min-height: 44px; min-width: min(100%, 280px); padding: 8px 12px; border: 1.5px solid var(--ink); border-radius: 8px; background: var(--card); color: var(--ink); font: inherit; }
.hint { display: block; margin-top: 4px; font-size: .85rem; }
.notice { margin: 0 0 16px; }
.card h2 { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 0; font-size: 1.1rem; }
.tag { display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 999px; font-size: .75rem; font-weight: 700; letter-spacing: .02em; line-height: 1; }
.tag-beta { background: var(--ink); color: var(--bg); }
.tag-enquiry { border: 1.5px solid var(--ink); background: transparent; color: var(--ink); }
.tag-chat { border: 1.5px dashed var(--ink); background: transparent; color: var(--ink); }
.tag-topic { border: 1.5px solid var(--accent); background: transparent; color: var(--ink); }
.tag-hint { border: 1.5px dotted var(--ink); background: transparent; color: var(--ink); font-weight: 600; }
.meta { margin: 0 0 12px; opacity: .8; font-size: .9rem; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 4px 16px; margin: 0 0 12px; }
dt { font-weight: 600; }
dd { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
form.edit { display: grid; gap: 12px; }
form.edit label { display: grid; gap: 4px; font-weight: 600; font-size: .9rem; }
form.edit textarea { width: 100%; }
label { display: grid; gap: 4px; font-weight: 600; font-size: .9rem; }
select, textarea { font: inherit; color: inherit; background-color: var(--bg); border: 1.5px solid var(--ink); border-radius: 8px; padding: 8px; }
select { appearance: none; padding-right: 44px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M3.5 6 L8 10.5 L12.5 6' stroke='%230d3b36' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; background-size: 16px 16px; }
@media (prefers-color-scheme: dark) { select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M3.5 6 L8 10.5 L12.5 6' stroke='%23f4efe0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); } }
textarea { min-width: min(100%, 420px); min-height: 44px; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
@media (max-width: 600px) { dl { grid-template-columns: 1fr; } }
.danger { margin-top: 20px; }
.danger summary { display: inline-flex; align-items: center; min-height: 44px; padding: 0 12px; border: 1px solid var(--line); border-radius: 999px; background: transparent; color: var(--ink); font-weight: 500; cursor: pointer; }
.danger p { margin: 12px 0; max-width: 62ch; }
.danger-actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.danger button, .danger a { min-height: 44px; padding: 0 12px; border: 1px solid var(--line); border-radius: 999px; background: transparent; color: var(--ink); font-weight: 500; text-decoration: none; }
.danger a { display: inline-flex; align-items: center; }
`;

const typeTag = { beta: ['tag-beta', 'Beta'], enquiry: ['tag-enquiry', 'Enquiry'], chat: ['tag-chat', 'Chat'] } as const;

/** Short labels for the topic value already saved on an enquiry. */
const topicTags: Record<string, string> = {
  call: 'Book a call',
  app: 'App enquiry',
  studio: 'Spark Studio',
  other: 'Something else',
};

const chosenCountry: Record<string, string> = { Australia: 'AU', Philippines: 'PH' };

export function topicTag(lead: Lead): string | null {
  if (lead.type !== 'enquiry' || !lead.topic) return null;
  return topicTags[lead.topic] ?? null;
}

/** Hint only. No chosen country, or no detected country, means no comparison. */
export function locationDiffers(lead: Lead): boolean {
  const detected = lead.detected_country?.toUpperCase() ?? '';
  const chosen = lead.country ?? '';
  if (!detected || !chosen) return false;
  const code = chosenCountry[chosen];
  if (code) return code !== detected;
  if (chosen === 'Somewhere else') return detected === 'AU' || detected === 'PH';
  return false;
}

function detectedLine(lead: Lead): string {
  const parts = [lead.detected_region, lead.detected_country].filter((part) => part && part.trim());
  if (!parts.length) return '';
  return `Detected: ${parts.map((part) => esc(part)).join(', ')}`;
}

function card(lead: Lead, tab: string, marketing: boolean): string {
  const rows: [string, string | number | null][] =
    lead.type === 'beta'
      ? [
          ['Email', lead.email],
          ['Business', lead.business],
          ['Country', lead.country],
          ['What the business does', lead.business_type],
          ['First admin task', lead.first_task],
        ]
      : [
          ['Email', lead.email],
          ['Business', lead.business],
          ['Topic', lead.topic],
          ['Message', lead.message],
        ];
  rows.push(['Marketing emails OK', lead.marketing_consent ? `Yes, ${lead.marketing_consent_at?.slice(0, 10)}` : 'No']);
  const [typeClass, typeLabel] = typeTag[lead.type];
  const topic = topicTag(lead);
  const options = statuses.map((s) => `<option${s === lead.status ? ' selected' : ''}>${s}</option>`).join('');
  const detected = detectedLine(lead);
  const same = sameSource(lead);
  const extra = [detected, same].filter(Boolean).join('<br>');
  const back = `/?tab=${encodeURIComponent(tab)}${marketing ? '&marketing=1' : ''}`;
  return `<article class="card" id="lead-${esc(lead.public_id)}">
<p class="ref">${esc(lead.public_id)}</p>
<h2><span>${esc(lead.name)}</span> <span class="tag ${typeClass}">${typeLabel}</span>${topic ? ` <span class="tag tag-topic">${esc(topic)}</span>` : ''}${locationDiffers(lead) ? ' <span class="tag tag-hint">Location differs</span>' : ''}</h2>
<p class="meta">${when(lead.created_at)} · from ${esc(lead.source_page)} · ${esc(lead.status)}${extra ? `<br>${extra}` : ''}</p>
<dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v) || '-'}</dd>`).join('')}</dl>
<form class="edit" method="post" action="/leads/${esc(lead.id)}">
<input type="hidden" name="tab" value="${esc(tab)}">${marketing ? '<input type="hidden" name="marketing" value="1">' : ''}
<label>Status<select name="status">${options}</select></label>
<label>Notes<textarea name="notes" rows="2">${esc(lead.notes)}</textarea></label>
<div><button type="submit">Save</button></div>
</form>
<details class="danger">
<summary>Delete</summary>
<form method="post" action="/leads/${esc(lead.id)}/delete">
<input type="hidden" name="tab" value="${esc(tab)}">${marketing ? '<input type="hidden" name="marketing" value="1">' : ''}
<p>Delete ${esc(lead.name)} (${esc(lead.email)})? This can't be undone.</p>
<div class="danger-actions"><button type="submit">Delete this lead</button><a href="${esc(back)}">Cancel</a></div>
</form>
</details>
</article>`;
}

export const listTabs = ['all', 'beta', 'enquiries', 'chat'] as const;
export type ListTab = (typeof listTabs)[number];

function sameSource(lead: Lead): string {
  const ids = lead.same_ids ?? [];
  if (!ids.length || !lead.public_id) return '';
  const shown = ids.slice(0, 3).map((id) => `<a href="/?tab=all#lead-${esc(id)}">${esc(id)}</a>`).join(', ');
  const rest = ids.length - 3;
  const more = rest > 0 ? ` and <a href="/?tab=all&amp;source=${esc(lead.public_id)}">${rest} more</a>` : '';
  return `<a href="/?tab=all&amp;source=${esc(lead.public_id)}">Same source</a> as ${shown}${more}. <span class="hint">Same internet connection. This may or may not be the same person.</span>`;
}

export function page(leads: Lead[], tab: ListTab, marketing: boolean, user: string, q = '', source: string | null = null): string {
  const query = (t: string, m: boolean) => {
    const params = new URLSearchParams({ tab: t });
    if (m) params.set('marketing', '1');
    if (q.trim()) params.set('q', q.trim());
    return `/?${params.toString().replace(/&/g, '&amp;')}`;
  };
  const current = (t: string) => (t === tab ? ' aria-current="page"' : '');
  const exportParams = new URLSearchParams({ tab });
  if (marketing) exportParams.set('marketing', '1');
  if (q.trim()) exportParams.set('q', q.trim());
  if (source) exportParams.set('source', source);
  return `<!doctype html>
<html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Lead list</title><style>${style}</style></head>
<body><main>
<h1>Lead list</h1>
<p class="who">Signed in as ${esc(user)}</p>
<nav aria-label="Lead list">
<a href="${query('all', marketing)}"${current('all')}>All</a>
<a href="${query('beta', marketing)}"${current('beta')}>Beta</a>
<a href="${query('enquiries', marketing)}"${current('enquiries')}>Enquiries</a>
<a href="${query('chat', marketing)}"${current('chat')}>Chat</a>
<a href="${query(tab, !marketing)}">${marketing ? 'Show everyone' : 'Marketing OK only'}</a>
<a href="/export.csv?${exportParams.toString().replace(/&/g, '&amp;')}">Export CSV</a>
</nav>
<form class="find" method="get" action="/">
<input type="hidden" name="tab" value="${esc(tab)}">${marketing ? '<input type="hidden" name="marketing" value="1">' : ''}${source ? `<input type="hidden" name="source" value="${esc(source)}">` : ''}
<label>Search<input name="q" value="${esc(q)}" autocomplete="off"></label>
<button type="submit">Search</button>
</form>
${source ? `<p class="notice">Showing the same connection as ${esc(source)}. <a href="${query('all', marketing)}">Show all leads</a><span class="hint">Same internet connection. This may or may not be the same person.</span></p>` : ''}
${leads.length ? leads.map((l) => card(l, tab, marketing)).join('\n') : `<p>${q.trim() || source ? 'No matches.' : 'Nothing here yet.'}</p>`}
</main></body></html>`;
}

/** Quotes every cell, and defuses cells a spreadsheet would run as a formula. */
const cell = (value: string | number | null) => {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

const csvColumns = [
  'public_id',
  'created_at',
  'type',
  'status',
  'name',
  'email',
  'business',
  'country',
  'topic',
  'message',
  'business_type',
  'first_task',
  'detected_country',
  'detected_region',
  'marketing_consent',
  'marketing_consent_at',
  'contact_consent_at',
  'consent_wording_version',
  'source_page',
  'notes',
  'id',
] as const satisfies readonly (keyof Lead)[];

export function csvFor(leads: Lead[]): string {
  const lines = [csvColumns.map((c) => cell(c)).join(',')];
  for (const lead of leads) lines.push(csvColumns.map((c) => cell(lead[c] ?? null)).join(','));
  return lines.join('\r\n') + '\r\n';
}
