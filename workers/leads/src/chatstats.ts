/** Numbers for the Chat pages, worked out from the per-chat summary rows. Pure, so they can be tested. */

export interface SessionRow {
  session_id: string;
  started_at: string;
  last_activity_at?: string;
  country: string;
  start_page: string;
  last_page: string;
  turns: number;
  offered: number;
  lead_sent: number;
  outcome: string;
  flag: string;
  topic: string | null;
  cost_usd: number;
}

export interface Bar {
  label: string;
  n: number;
}

export interface TopicRow {
  id: string;
  n: number;
  leads: number;
  drop: number;
}

export interface Stats {
  opened: number;
  messaged: number;
  flagged: number;
  genuine: number;
  offered: number;
  leads: number;
  fallOff: number;
  early: number;
  avgTurns: number;
  medianTurns: number;
  cost: number;
  funnel: Bar[];
  exits: Bar[];
  pages: Bar[];
  countries: Bar[];
  spam: Bar[];
  topics: TopicRow[];
}

/** How long a chat goes quiet before it counts as over. Matches QUIET_MS in the chat Worker's insights.ts. */
export const QUIET_MS = 35 * 60 * 1000;

/**
 * Chats still marked active are in progress while they had activity in the last 35 minutes.
 * After that they are shown as left, until the nightly job settles them.
 */
export function effectiveOutcome(row: Pick<SessionRow, 'outcome' | 'turns' | 'last_activity_at'>, now = Date.now()): string {
  if (row.outcome !== 'active') return row.outcome;
  if (row.turns === 0) return 'no_message';
  const last = Date.parse(row.last_activity_at ?? '');
  return now - last < QUIET_MS ? 'in_progress' : 'left';
}

const pageNames: Record<string, string> = {
  '/': 'Home',
  '/services': 'Services',
  '/apps': 'Apps',
  '/contact': 'Contact',
  '/sparkkeeper/beta': 'Beta page',
  '/how-it-works': 'How it works',
  '/trust': 'Trust',
  '/privacy': 'Privacy',
};

export function pageLabel(path: string): string {
  if (!path) return 'Unknown';
  return pageNames[path] ?? path;
}

export function countryLabel(code: string): string {
  if (!code) return 'Unknown';
  try {
    return new Intl.DisplayNames(['en-AU'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

export const spamLabels: Record<string, string> = {
  injection: 'Prompt injection phrases',
  off_topic: 'Off-topic, three strikes',
  gibberish: 'Gibberish or empty',
  fast: 'Faster than a person types',
};

function tally(items: string[], label: (key: string) => string, top: number): Bar[] {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  const sorted = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const shown = sorted.slice(0, top).map(([key, n]) => ({ label: label(key), n }));
  const rest = sorted.slice(top).reduce((sum, [, n]) => sum + n, 0);
  return rest ? [...shown, { label: 'Other', n: rest }] : shown;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function computeStats(rows: SessionRow[], now = Date.now()): Stats {
  const messagedRows = rows.filter((r) => r.turns > 0);
  const flaggedRows = messagedRows.filter((r) => r.flag !== '');
  const genuineRows = messagedRows.filter((r) => r.flag === '');
  const isLead = (r: SessionRow) => r.lead_sent === 1 || r.outcome === 'lead';
  const leadRows = genuineRows.filter(isLead);
  const offeredRows = genuineRows.filter((r) => r.offered === 1);
  const isLive = (r: SessionRow) => effectiveOutcome(r, now) === 'in_progress';
  const droppedRows = genuineRows.filter((r) => !isLead(r) && !isLive(r));
  const turns = genuineRows.map((r) => r.turns);

  const exit = (r: SessionRow): string => {
    const outcome = effectiveOutcome(r, now);
    if (outcome === 'cap') return 'Closed by the message cap';
    if (outcome === 'off_topic') return 'Ended after off-topic replies';
    if (r.offered === 1) return 'Left after the lead card offer';
    if (r.turns === 1) return 'Left after 1 question';
    if (r.turns <= 3) return 'Left after 2 to 3 questions';
    return 'Left after 4 or more questions';
  };
  const exitOrder = ['Left after 1 question', 'Left after 2 to 3 questions', 'Left after 4 or more questions', 'Left after the lead card offer', 'Closed by the message cap', 'Ended after off-topic replies'];
  const exitCounts = new Map<string, number>();
  for (const r of droppedRows) exitCounts.set(exit(r), (exitCounts.get(exit(r)) ?? 0) + 1);

  const topicMap = new Map<string, TopicRow>();
  for (const r of genuineRows) {
    const id = r.topic ?? 'unlabelled';
    const row = topicMap.get(id) ?? { id, n: 0, leads: 0, drop: 0 };
    row.n += 1;
    if (isLead(r)) row.leads += 1;
    else if (!isLive(r)) row.drop += 1;
    topicMap.set(id, row);
  }

  return {
    opened: rows.length,
    messaged: messagedRows.length,
    flagged: flaggedRows.length,
    genuine: genuineRows.length,
    offered: offeredRows.length,
    leads: leadRows.length,
    fallOff: droppedRows.length,
    early: droppedRows.filter((r) => r.turns <= 2).length,
    avgTurns: turns.length ? turns.reduce((a, b) => a + b, 0) / turns.length : 0,
    medianTurns: median(turns),
    cost: rows.reduce((sum, r) => sum + r.cost_usd, 0),
    funnel: [
      { label: 'Opened the chat', n: rows.length },
      { label: 'Sent a message', n: messagedRows.length },
      { label: 'Genuine, not flagged', n: genuineRows.length },
      { label: 'Sparky offered the lead card', n: offeredRows.length },
      { label: 'Left their details', n: leadRows.length },
    ],
    exits: exitOrder.map((label) => ({ label, n: exitCounts.get(label) ?? 0 })).filter((b) => b.n > 0),
    pages: tally(droppedRows.map((r) => r.last_page), pageLabel, 6),
    countries: tally(rows.map((r) => r.country), countryLabel, 5),
    spam: tally(flaggedRows.map((r) => r.flag), (k) => spamLabels[k] ?? k, 8),
    topics: [...topicMap.values()].sort((a, b) => b.n - a.n),
  };
}

export const pct = (part: number, whole: number): string => (whole ? `${Math.round((part / whole) * 100)}%` : '0%');
