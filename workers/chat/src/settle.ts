import { LABELS_PER_RUN, QUIET_MS, parseTopic, settledOutcome, spamFlag, topicPrompt, type Topic } from './insights.ts';
import { MODEL } from './prompt.ts';
import type { Env } from './state.ts';

interface SessionRow {
  session_id: string;
  turns: number;
  outcome: string;
  last_activity_at: string;
}

interface LogRow {
  question: string;
  decision: string;
  created_at: string;
}

const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

/** One cheap call, masked text only. Null on any failure, so the chat is tried again the next night. */
export async function classifyTopic(env: Env, questions: string[]): Promise<Topic | null> {
  if (!env.ANTHROPIC_API_KEY || !questions.length) return null;
  try {
    const response = await fetch(env.MODEL_API_URL || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 30, messages: [{ role: 'user', content: topicPrompt(questions) }] }),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { content?: { type: string; text?: string }[] };
    return parseTopic(body.content?.find((block) => block.type === 'text')?.text ?? '');
  } catch {
    return null;
  }
}

/**
 * Nightly. Settles chats that have gone quiet: final outcome, spam flag and topic.
 * Runs before the transcripts are purged, so the labels are in place while the text still exists.
 */
export async function settleSessions(env: Env, now = Date.now()): Promise<{ settled: number; labelled: number }> {
  if (!env.DB) return { settled: 0, labelled: 0 };
  const cutoff = new Date(now - QUIET_MS).toISOString();
  const { results } = await env.DB.prepare(
    'SELECT session_id, turns, outcome, last_activity_at FROM chat_sessions WHERE settled = 0 AND last_activity_at < ? ORDER BY started_at LIMIT 500',
  )
    .bind(cutoff)
    .all<SessionRow>();

  let settled = 0;
  let labelled = 0;
  for (const row of results) {
    let flag = '';
    let topic: Topic | null = null;
    let done = true;

    if (row.turns > 0) {
      const logs = (
        await env.DB.prepare('SELECT question, decision, created_at FROM chat_log WHERE session_id = ? ORDER BY turn').bind(row.session_id).all<LogRow>()
      ).results;
      const questions = logs.map((log) => log.question);
      const stamps = logs.map((log) => Date.parse(log.created_at)).filter((stamp) => Number.isFinite(stamp));
      const gaps = stamps.slice(1).map((stamp, i) => stamp - stamps[i]);
      flag = spamFlag({ questions, gaps, lastDecision: logs.at(-1)?.decision ?? '' });
      if (flag === 'off_topic') topic = 'off_topic';
      else if (!flag && questions.length && labelled < LABELS_PER_RUN) {
        topic = await classifyTopic(env, questions);
        if (topic) labelled += 1;
        // A failed call is retried each night for three days, then the chat is kept without a topic.
        else done = now - Date.parse(row.last_activity_at) > THREE_DAYS;
      } else if (!flag && questions.length) done = false;
    }

    await env.DB.prepare('UPDATE chat_sessions SET outcome = ?, flag = ?, topic = ?, settled = ? WHERE session_id = ?')
      .bind(settledOutcome(row.outcome, row.turns), flag, topic, done ? 1 : 0, row.session_id)
      .run();
    if (done) settled += 1;
  }
  return { settled, labelled };
}
