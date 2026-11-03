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
.card { margin: 0 0 16px; padding: 16px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); }
.card h2 { margin: 0; font-size: 1.1rem; }
.meta { margin: 0 0 12px; opacity: .8; font-size: .9rem; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 4px 16px; margin: 0 0 12px; }
dt { font-weight: 600; }
dd { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
form.edit { display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-end; }
label { display: grid; gap: 4px; font-weight: 600; font-size: .9rem; }
select, textarea { font: inherit; color: inherit; background: var(--bg); border: 1.5px solid var(--ink); border-radius: 8px; padding: 8px; }
textarea { min-width: min(100%, 420px); min-height: 44px; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
@media (max-width: 600px) { dl { grid-template-columns: 1fr; } }
`;

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
  const options = statuses.map((s) => `<option${s === lead.status ? ' selected' : ''}>${s}</option>`).join('');
  return `<article class="card">
<h2>${esc(lead.name)}</h2>
<p class="meta">${when(lead.created_at)} · from ${esc(lead.source_page)} · ${esc(lead.status)}</p>
<dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v) || '-'}</dd>`).join('')}</dl>
<form class="edit" method="post" action="/leads/${esc(lead.id)}">
<input type="hidden" name="tab" value="${tab}">${marketing ? '<input type="hidden" name="marketing" value="1">' : ''}
<label>Status<select name="status">${options}</select></label>
<label>Notes<textarea name="notes" rows="2">${esc(lead.notes)}</textarea></label>
<button type="submit">Save</button>
</form>
</article>`;
}

export function page(leads: Lead[], tab: 'beta' | 'enquiries', marketing: boolean, user: string): string {
  const q = (t: string, m: boolean) => `/?tab=${t}${m ? '&amp;marketing=1' : ''}`;
  const current = (t: string) => (t === tab ? ' aria-current="page"' : '');
  return `<!doctype html>
<html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Lead list</title><style>${style}</style></head>
<body><main>
<h1>Lead list</h1>
<p class="who">Signed in as ${esc(user)}</p>
<nav aria-label="Lead list">
<a href="${q('beta', marketing)}"${current('beta')}>Beta</a>
<a href="${q('enquiries', marketing)}"${current('enquiries')}>Enquiries</a>
<a href="/?tab=${tab}${marketing ? '' : '&amp;marketing=1'}">${marketing ? 'Show everyone' : 'Marketing OK only'}</a>
<a href="/export.csv?tab=${tab}${marketing ? '&amp;marketing=1' : ''}">Export CSV</a>
</nav>
${leads.length ? leads.map((l) => card(l, tab, marketing)).join('\n') : '<p>Nothing here yet.</p>'}
</main></body></html>`;
}

/** Quotes every cell, and defuses cells a spreadsheet would run as a formula. */
const cell = (value: string | number | null) => {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export function csvFor(leads: Lead[], type: Lead['type']): string {
  const columns: (keyof Lead)[] =
    type === 'beta'
      ? ['created_at', 'status', 'name', 'email', 'business', 'country', 'business_type', 'first_task', 'marketing_consent', 'marketing_consent_at', 'contact_consent_at', 'consent_wording_version', 'source_page', 'notes', 'id']
      : ['created_at', 'status', 'name', 'email', 'business', 'topic', 'message', 'marketing_consent', 'marketing_consent_at', 'contact_consent_at', 'consent_wording_version', 'source_page', 'notes', 'id'];
  const lines = [columns.map((c) => cell(c)).join(',')];
  for (const lead of leads) lines.push(columns.map((c) => cell(lead[c])).join(','));
  return lines.join('\r\n') + '\r\n';
}
