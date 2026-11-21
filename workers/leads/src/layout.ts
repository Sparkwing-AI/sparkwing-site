import { esc, extraStyle, style } from './common';

export type NavKey = 'forms' | 'chat-leads' | 'all' | 'overview' | 'transcripts' | 'insights';

const leadsNav: [NavKey, string, string][] = [
  ['forms', 'Form leads', '/?tab=forms'],
  ['chat-leads', 'Chat leads', '/?tab=chat'],
  ['all', 'All leads', '/?tab=all'],
];
const chatNav: [NavKey, string, string][] = [
  ['overview', 'Overview', '/chat'],
  ['transcripts', 'Transcripts', '/chat/transcripts'],
  ['insights', 'Topics and insights', '/chat/insights'],
];

/** The frame around every page: the menu on the left, the page on the right. */
export function shell(title: string, active: NavKey, user: string, body: string): string {
  const links = (items: [NavKey, string, string][]) =>
    items.map(([key, label, href]) => `<a href="${esc(href).replace(/&amp;/g, '&amp;')}"${key === active ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('');
  return `<!doctype html>
<html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>${esc(title)}</title><style>${style}${extraStyle}</style></head>
<body>
<header class="bar"><h1>Sparkwing leads</h1><p class="who">Signed in as ${esc(user)}</p></header>
<main>
<div class="layout">
<div class="side">
<nav aria-label="Leads"><h2>Leads</h2>${links(leadsNav)}</nav>
<nav aria-label="Chat"><h2>Chat</h2>${links(chatNav)}</nav>
</div>
<div class="content">
${body}
</div>
</div>
</main></body></html>`;
}
