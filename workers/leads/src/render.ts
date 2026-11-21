import { statuses, type Lead } from '../../shared/types';
import { esc, style, when } from './common';
import { shell, type NavKey } from './layout';

const typeTag = { beta: ['tag-beta', 'Beta'], enquiry: ['tag-enquiry', 'Enquiry'], chat: ['tag-chat', 'Chat'] } as const;

/** Short labels for the topic value already saved on an enquiry. */
const topicTags: Record<string, string> = {
  call: 'Book a call',
  demo: 'Request a demo',
  pricing: 'Pricing',
  general: 'General questions',
  support: 'I need support',
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
  rows.push(['Confirmation email', lead.confirmation_sent_at ? `Sent ${lead.confirmation_sent_at.slice(0, 16).replace('T', ' ')} UTC` : 'Not sent']);
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
${lead.chat_session_id ? `<p><a href="/chat/transcripts?session=${esc(lead.chat_session_id)}">View the chat</a></p>` : ''}
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

export const listTabs = ['all', 'forms', 'beta', 'enquiries', 'chat'] as const;
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
  const nav: NavKey = tab === 'chat' ? 'chat-leads' : tab === 'all' ? 'all' : 'forms';
  const heading = { all: 'All leads', forms: 'Form leads', beta: 'Form leads: beta', enquiries: 'Form leads: enquiries', chat: 'Chat leads' }[tab];
  const sub =
    tab === 'chat'
      ? '<p class="sub">People who left their details in Ask Sparky. Chats where nobody left details are not leads. They are in Chat, Overview.</p>'
      : tab === 'forms' || tab === 'beta' || tab === 'enquiries'
        ? `<nav aria-label="Form type"><a href="${query('forms', marketing)}"${current('forms')}>Both</a><a href="${query('beta', marketing)}"${current('beta')}>Beta</a><a href="${query('enquiries', marketing)}"${current('enquiries')}>Enquiries</a></nav>`
        : '';
  const body = `<h2 class="title">${heading}</h2>
${sub}
<nav aria-label="Lead list">
<a href="${query(tab, !marketing)}">${marketing ? 'Show everyone' : 'Marketing OK only'}</a>
<a href="/export.csv?${exportParams.toString().replace(/&/g, '&amp;')}">Export CSV</a>
</nav>
<form class="find" method="get" action="/">
<input type="hidden" name="tab" value="${esc(tab)}">${marketing ? '<input type="hidden" name="marketing" value="1">' : ''}${source ? `<input type="hidden" name="source" value="${esc(source)}">` : ''}
<label>Search<input name="q" value="${esc(q)}" autocomplete="off"></label>
<button type="submit">Search</button>
</form>
${source ? `<p class="notice">Showing the same connection as ${esc(source)}. <a href="${query('all', marketing)}">Show all leads</a><span class="hint">Same internet connection. This may or may not be the same person.</span></p>` : ''}
${leads.length ? leads.map((l) => card(l, tab, marketing)).join('\n') : `<p>${q.trim() || source ? 'No matches.' : 'Nothing here yet.'}</p>`}`;
  return shell('Leads', nav, user, body);
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
