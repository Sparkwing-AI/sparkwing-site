/** Input and output checks for Ask Sparky. Pure functions, so they can be tested without a Worker. */

export const MAX_MESSAGE = 500;
export const MAX_BODY = 4000;

export const SOURCES: Record<string, string> = {
  home: '/',
  'bring-ai-in': '/bring-ai-in',
  'scale-ai': '/scale-ai',
  'spark-studio': '/spark-studio',
  trust: '/trust',
  sparkkeeper: '/sparkkeeper',
  beta: '/sparkkeeper/beta',
  magnet: '/apps/magnet',
  academy: '/apps/academy',
  nest: '/apps/nest',
};

export const SAFE = "That one's a bit outside what I can help with, but the team can. Leave your details below and they'll get back to you within 24 hours.";

export interface CleanAnswer {
  answer: string;
  sources: string[];
  action: 'none' | 'talk_to_team' | 'apply_beta';
  onTopic: boolean;
}

/** Removes control, zero-width and text-direction characters. Keeps ordinary line breaks. */
export function stripControls(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F​-‏‪-‮⁠-⁩﻿]/g, '');
}

/** Code-level masking of details people often type. It won't catch names or other free text. */
export function mask(value: string): string {
  return value
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[EMAIL]')
    .replace(/(?:\d[ -]?){13,19}/g, '[NUMBER]')
    .replace(/\+?\d[\d ()-]{7,}\d/g, '[PHONE]');
}

/** The visitor's text, ready for the model, or null when it must be rejected before any spending. */
export function prepareMessage(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const clean = stripControls(raw);
  if (clean.length > MAX_MESSAGE || !clean.trim()) return null;
  return mask(clean).trim();
}

/** A safe page path for the log. Anything else is dropped. */
export function cleanPage(raw: unknown): string {
  return typeof raw === 'string' && /^\/[a-z0-9/-]{0,80}$/i.test(raw) ? raw : '';
}

const NEGATED = /\b(no|not|never|cannot|without)\b|n['’]t\b/i;
const BANNED = /bir[- ]accredit|e-?invoic|e-?fil(e|ing)|guarantee|discount/i;
const PRICE = /[$₱€£]\s?\d|\b\d[\d,.]*\s?(aud|usd|php|pesos?|dollars?)\b/i;

/** A claim we never make is only rejected when the sentence states it. "It doesn't file taxes" is fine. */
function hasBannedClaim(answer: string): boolean {
  return bannedReason(answer) !== '';
}

/** Which check a rejected answer failed, for the logs. Empty when it passes. */
export function bannedReason(answer: string): string {
  const price = answer.match(PRICE);
  if (price) return `price: ${price[0]}`;
  const sentence = answer.split(/(?<=[.!?])\s+/).find((item) => BANNED.test(item) && !NEGATED.test(item));
  return sentence ? `claim: ${sentence.match(BANNED)?.[0] ?? ''}` : '';
}

/** Why cleanAnswer turned a reply down, for the logs. Never includes the canary. */
export function rejectReason(text: string, canary: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  const trimmed = start >= 0 && end > start ? text.slice(start, end + 1) : text.trim();
  let parsed: { answer?: unknown };
  try {
    parsed = JSON.parse(trimmed) as { answer?: unknown };
  } catch {
    return 'not JSON';
  }
  if (typeof parsed.answer !== 'string') return 'no answer field';
  if (parsed.answer.includes(canary)) return 'canary';
  const answer = stripLinksAndMarkup(parsed.answer);
  if (!answer) return 'empty after removing links';
  return bannedReason(answer) || 'unknown';
}

function stripLinksAndMarkup(value: string): string {
  return value
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\bwww\.\S+/gi, '')
    .replace(/\b[a-z0-9-]+\.(?:com|net|org|ai|ph|au|io|co)(?:\.[a-z]{2})?(?:\/\S*)?/gi, '')
    .replace(/[*_`#]{1,3}/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/** Accepts the model's reply only if it passes every check. Null means the safe fallback. */
export function cleanAnswer(text: string, canary: string): CleanAnswer | null {
  // Take the JSON object even if the model wrapped it in a code fence or a sentence.
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  const trimmed = start >= 0 && end > start ? text.slice(start, end + 1) : text.trim();
  let parsed: { answer?: unknown; sources?: unknown; action?: unknown; on_topic?: unknown };
  try {
    parsed = JSON.parse(trimmed) as typeof parsed;
  } catch {
    return null;
  }
  if (typeof parsed.answer !== 'string' || parsed.answer.includes(canary)) return null;
  const answer = stripLinksAndMarkup(parsed.answer);
  if (!answer || hasBannedClaim(answer)) return null;
  const sources = Array.isArray(parsed.sources)
    ? parsed.sources.filter((id): id is string => typeof id === 'string' && id in SOURCES).slice(0, 1)
    : [];
  const action = parsed.action === 'talk_to_team' || parsed.action === 'apply_beta' ? parsed.action : 'none';
  return { answer, sources, action, onTopic: parsed.on_topic !== false };
}

/** Haiku 5.5 list prices per token, for the daily budget. The workspace spend limit is the hard stop. */
export function costUsd(inputTokens: number, outputTokens: number): number {
  return (inputTokens * 0.1 + outputTokens * 0.5) / 1_000_000;
}
