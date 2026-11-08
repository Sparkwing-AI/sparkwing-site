import { DurableObject } from 'cloudflare:workers';
import { buildSystem, MODEL } from './prompt';
import { cleanAnswer, costUsd, rejectReason, SAFE, type CleanAnswer } from './checks';

export interface Env {
  ANTHROPIC_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  ALLOWED_ORIGINS: string;
  EXPECTED_HOSTNAME?: string;
  CHAT_ENABLED?: string;
  DAILY_BUDGET_USD?: string;
  MODEL_API_URL?: string;
  DB?: D1Database;
  SESSIONS: DurableObjectNamespace<ChatSession>;
  LIMITS: DurableObjectNamespace<ChatLimits>;
}

const HOUR = 60 * 60 * 1000;
const SESSION_LIFE = 30 * 60 * 1000;
const STARTS_PER_HOUR = 5;
const MESSAGES_PER_MINUTE = 6;
const LAST_MESSAGE = 12;

const CLOSED = "I've really enjoyed this. The team can take it from here.";
const STRIKE_END = "I'll leave that one with you. If AI for your business is ever on your mind, the team would love to hear from you.";

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** One instance for the whole site: new-chat limits and the daily budget. Strict counts, no raw IP addresses. */
export class ChatLimits extends DurableObject<Env> {
  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  /** The salt rotates daily, and the old day's counts go with it. */
  private async salt(): Promise<string> {
    const day = this.today();
    const saved = await this.ctx.storage.get<{ day: string; salt: string }>('salt');
    if (saved?.day === day) return saved.salt;
    await this.ctx.storage.deleteAll();
    const salt = crypto.randomUUID();
    await this.ctx.storage.put('salt', { day, salt });
    return salt;
  }

  async allowStart(ip: string): Promise<boolean> {
    const key = `starts:${await sha256(`${await this.salt()}:${ip}`)}`;
    const now = Date.now();
    const starts = ((await this.ctx.storage.get<number[]>(key)) ?? []).filter((stamp) => now - stamp < HOUR);
    if (starts.length >= STARTS_PER_HOUR) return false;
    starts.push(now);
    await this.ctx.storage.put(key, starts);
    return true;
  }

  private budget(): number {
    const value = Number(this.env.DAILY_BUDGET_USD ?? '1');
    return Number.isFinite(value) && value > 0 ? value : 1;
  }

  async budgetLeft(): Promise<boolean> {
    await this.salt();
    return ((await this.ctx.storage.get<number>('spend')) ?? 0) < this.budget();
  }

  async addSpend(usd: number): Promise<void> {
    await this.salt();
    const before = (await this.ctx.storage.get<number>('spend')) ?? 0;
    const after = before + usd;
    await this.ctx.storage.put('spend', after);
    for (const mark of [0.5, 0.8, 1]) {
      if (before < this.budget() * mark && after >= this.budget() * mark) {
        console.warn('sparky budget', Math.round(mark * 100));
      }
    }
  }
}

interface SessionData {
  created: number;
  canary: string;
  turns: { role: 'user' | 'assistant'; content: string }[];
  count: number;
  strikes: number;
  closed: boolean;
  sent: number[];
}

export type SendResult =
  | { kind: 'reply'; answer: string; sources: string[]; action: string; onTopic: boolean; closed: boolean }
  | { kind: 'error'; status: number; error: string };

/** One instance per chat: history lives here and never comes from the browser. */
export class ChatSession extends DurableObject<Env> {
  private busy = false;

  async begin(): Promise<void> {
    const created = Date.now();
    const data: SessionData = { created, canary: crypto.randomUUID(), turns: [], count: 0, strikes: 0, closed: false, sent: [] };
    await this.ctx.storage.put('session', data);
    await this.ctx.storage.setAlarm(created + SESSION_LIFE + 60_000);
  }

  async alarm(): Promise<void> {
    await this.ctx.storage.deleteAll();
  }

  async end(): Promise<boolean> {
    const data = await this.ctx.storage.get<SessionData>('session');
    if (!data) return false;
    data.closed = true;
    await this.ctx.storage.put('session', data);
    return true;
  }

  /** One message at a time per chat. The flag is set before any await, so parallel requests can't both run. */
  async send(message: string, page: string, sessionId: string): Promise<SendResult> {
    if (this.busy) return { kind: 'error', status: 429, error: 'busy' };
    this.busy = true;
    try {
      return await this.handle(message, page, sessionId);
    } finally {
      this.busy = false;
    }
  }

  private async handle(message: string, page: string, sessionId: string): Promise<SendResult> {
    const data = await this.ctx.storage.get<SessionData>('session');
    if (!data || data.closed || Date.now() - data.created > SESSION_LIFE) return { kind: 'error', status: 400, error: 'session' };

    const now = Date.now();
    data.sent = data.sent.filter((stamp) => now - stamp < 60_000);
    if (data.sent.length >= MESSAGES_PER_MINUTE) return { kind: 'error', status: 429, error: 'rate' };
    data.sent.push(now);
    data.count += 1;

    const finish = async (answer: string, closed: boolean, onTopic: boolean, decision: string, model?: ModelReply): Promise<SendResult> => {
      data.closed = closed;
      // History keeps the visitor's words in their tags and Sparky's replies as JSON, so later turns keep the same shape.
      const said = JSON.stringify({ answer, sources: model?.clean?.sources ?? [], action: closed ? 'talk_to_team' : (model?.clean?.action ?? 'talk_to_team'), on_topic: onTopic });
      data.turns.push({ role: 'user', content: `<visitor_message>${message}</visitor_message>` }, { role: 'assistant', content: said });
      if (data.turns.length > 24) data.turns.splice(0, data.turns.length - 24);
      await this.ctx.storage.put('session', data);
      const action = closed ? 'talk_to_team' : (model?.clean?.action ?? 'talk_to_team');
      this.ctx.waitUntil(this.record(sessionId, data.count, page, message, answer, action, decision, model));
      return { kind: 'reply', answer, sources: model?.clean?.sources ?? [], action, onTopic, closed };
    };

    if (data.count >= LAST_MESSAGE) return finish(CLOSED, true, true, 'closed');

    const limits = this.env.LIMITS.get(this.env.LIMITS.idFromName('global'));
    if (!(await limits.budgetLeft())) {
      await this.ctx.storage.put('session', data);
      return { kind: 'error', status: 503, error: 'offline' };
    }

    const model = await callModel(this.env, data, message);
    if (model.offline) {
      data.count -= 1;
      await this.ctx.storage.put('session', data);
      return { kind: 'error', status: 503, error: 'offline' };
    }
    if (model.cost) this.ctx.waitUntil(limits.addSpend(model.cost));

    const spoken = model.clean;
    if (spoken && !spoken.onTopic) data.strikes += 1;
    if (data.strikes >= 3) return finish(STRIKE_END, true, false, 'off_topic_end', model);
    return finish(spoken?.answer ?? SAFE, false, spoken?.onTopic ?? true, spoken ? 'answered' : 'fallback', model);
  }

  private async record(sessionId: string, turn: number, page: string, question: string, answer: string, action: string, decision: string, model?: ModelReply): Promise<void> {
    if (!this.env.DB) return;
    try {
      await this.env.DB.prepare(
        `INSERT INTO chat_log (created_at, session_id, turn, page, question, answer, action, decision, input_tokens, output_tokens, cost_usd)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(new Date().toISOString(), sessionId, turn, page, question, answer, action, decision, model?.input ?? 0, model?.output ?? 0, model?.cost ?? 0)
        .run();
    } catch (error) {
      console.error('chat log failed', error instanceof Error ? error.message : 'unknown');
    }
  }
}

interface ModelReply {
  clean: CleanAnswer | null;
  offline: boolean;
  input: number;
  output: number;
  cost: number;
}

/** One attempt only. An API error or spend limit means offline, never a retry loop. */
async function callModel(env: Env, data: SessionData, message: string): Promise<ModelReply> {
  const none: ModelReply = { clean: null, offline: true, input: 0, output: 0, cost: 0 };
  if (!env.ANTHROPIC_API_KEY) return none;
  try {
    const response = await fetch(env.MODEL_API_URL || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: buildSystem(data.count, data.canary),
        messages: [...data.turns, { role: 'user', content: `<visitor_message>${message}</visitor_message>` }],
      }),
    });
    if (!response.ok) {
      console.error('model request failed', response.status);
      return none;
    }
    const body = (await response.json()) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number } };
    const input = body.usage?.input_tokens ?? 0;
    const output = body.usage?.output_tokens ?? 0;
    const text = body.content?.find((block) => block.type === 'text')?.text ?? '';
    const clean = cleanAnswer(text, data.canary);
    if (!clean) console.warn('sparky fallback', rejectReason(text, data.canary));
    return { clean, offline: false, input, output, cost: costUsd(input, output) };
  } catch (error) {
    console.error('model request error', error instanceof Error ? error.name : 'unknown');
    return none;
  }
}
