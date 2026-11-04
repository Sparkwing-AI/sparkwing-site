import { buildSystem, MODEL } from './prompt';

interface Env {
  ANTHROPIC_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  ALLOWED_ORIGINS: string;
  CHAT_ENABLED?: string;
}

type Role = 'user' | 'assistant';

interface Session {
  id: string;
  created: number;
  turns: { role: Role; content: string }[];
  count: number;
  strikes: number;
  closed: boolean;
  canary: string;
}

const sessions = new Map<string, Session>();
const HOUR = 60 * 60 * 1000;
const startsByIp = new Map<string, number[]>();

const SAFE = "I can't help with that one. The team can, though.";
const CLOSED = "I've really enjoyed this. The team can take it from here.";
const STRIKE_END = "I'll leave that one with you. If AI for your business is ever on your mind, the team would love to hear from you.";

function originOf(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  const allowed = env.ALLOWED_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean);
  return allowed.includes(origin) ? origin : null;
}

function reply(status: number, body: unknown, origin: string | null): Response {
  const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' });
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  return new Response(JSON.stringify(body), { status, headers });
}

function mask(value: string): string {
  return value
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[EMAIL]')
    .replace(/(?:\d[ -]?){13,19}/g, '[NUMBER]')
    .replace(/\+?\d[\d ()-]{7,}\d/g, '[PHONE]');
}

function recentStarts(ip: string): number[] {
  const now = Date.now();
  const kept = (startsByIp.get(ip) ?? []).filter((stamp) => now - stamp < HOUR);
  startsByIp.set(ip, kept);
  return kept;
}

function localOrigin(origin: string): boolean {
  return origin.startsWith('http://127.0.0.1:') || origin.startsWith('http://localhost:');
}

async function turnstileOk(token: unknown, env: Env, origin: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return localOrigin(origin);
  if (typeof token !== 'string' || !token) return false;
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
  });
  if (!response.ok) return false;
  const data = (await response.json()) as { success?: boolean };
  return data.success === true;
}

function cleanAnswer(text: string, canary: string): { answer: string; action: string; onTopic: boolean } | null {
  const trimmed = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  let parsed: { answer?: unknown; action?: unknown; on_topic?: unknown };
  try {
    parsed = JSON.parse(trimmed) as { answer?: unknown; action?: unknown; on_topic?: unknown };
  } catch {
    return null;
  }
  if (typeof parsed.answer !== 'string') return null;
  let answer = parsed.answer.replace(/https?:\/\/\S+/gi, '').replace(/<[^>]+>/g, '').trim();
  if (!answer || answer.includes(canary)) return null;
  if (/bir accredited|e-invoicing|e-filing/i.test(answer)) return null;
  const action = parsed.action === 'talk_to_team' || parsed.action === 'apply_beta' ? parsed.action : 'none';
  return { answer, action, onTopic: parsed.on_topic !== false };
}

async function callModel(session: Session, message: string, apiKey: string | undefined): Promise<{ answer: string; action: string; onTopic: boolean } | null> {
  if (!apiKey) return null;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      system: buildSystem(session.count, session.canary),
      messages: [...session.turns, { role: 'user', content: message }],
    }),
  });
  if (!response.ok) {
    console.error('model request failed', response.status);
    return null;
  }
  const data = (await response.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((block) => block.type === 'text')?.text ?? '';
  return cleanAnswer(text, session.canary);
}

function result(session: Session, answer: string, action: string, onTopic: boolean, closed = false) {
  return { session_id: session.id, answer, sources: [] as string[], action, on_topic: onTopic, closed };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== '/api/chat') return new Response('Not found', { status: 404 });
    const origin = originOf(request, env);
    if (request.method === 'OPTIONS') {
      if (!origin) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          Vary: 'Origin',
        },
      });
    }
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    if (!origin) return reply(403, { error: 'origin' }, null);
    if (env.CHAT_ENABLED === 'false') return reply(503, { error: 'offline' }, origin);

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return reply(400, { error: 'json' }, origin);
    }

    if (body.action === 'start') {
      const ip = request.headers.get('CF-Connecting-IP') ?? 'local';
      const starts = recentStarts(ip);
      if (starts.length >= 5) return reply(429, { error: 'limit' }, origin);
      if (!(await turnstileOk(body.turnstile, env, origin))) return reply(403, { error: 'turnstile' }, origin);
      starts.push(Date.now());
      const session: Session = {
        id: crypto.randomUUID(),
        created: Date.now(),
        turns: [],
        count: 0,
        strikes: 0,
        closed: false,
        canary: crypto.randomUUID(),
      };
      sessions.set(session.id, session);
      return reply(200, { ok: true, session_id: session.id }, origin);
    }

    const session = typeof body.session_id === 'string' ? sessions.get(body.session_id) : undefined;
    if (!session || session.closed) return reply(400, { error: 'session' }, origin);

    if (body.action === 'end') {
      session.closed = true;
      return reply(200, { ok: true }, origin);
    }

    if (typeof body.message !== 'string') return reply(400, { error: 'message' }, origin);
    const message = mask(body.message).slice(0, 500);
    if (!message.trim()) return reply(400, { error: 'message' }, origin);
    if (session.count >= 12) {
      session.closed = true;
      return reply(200, result(session, CLOSED, 'talk_to_team', true, true), origin);
    }

    session.count += 1;
    if (session.count === 12) {
      session.closed = true;
      session.turns.push({ role: 'user', content: message }, { role: 'assistant', content: CLOSED });
      return reply(200, result(session, CLOSED, 'talk_to_team', true, true), origin);
    }

    const model = await callModel(session, message, env.ANTHROPIC_API_KEY);
    const spoken = model ?? { answer: SAFE, action: 'talk_to_team', onTopic: true };
    if (!spoken.onTopic) session.strikes += 1;
    if (session.strikes >= 3) {
      session.closed = true;
      session.turns.push({ role: 'user', content: message }, { role: 'assistant', content: STRIKE_END });
      return reply(200, result(session, STRIKE_END, 'talk_to_team', false, true), origin);
    }
    session.turns.push({ role: 'user', content: message }, { role: 'assistant', content: spoken.answer });
    if (session.turns.length > 24) session.turns.splice(0, session.turns.length - 24);
    return reply(200, result(session, spoken.answer, spoken.action, spoken.onTopic, false), origin);
  },
} satisfies ExportedHandler<Env>;
