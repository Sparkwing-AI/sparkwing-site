/** Extra protection for leads left in the Ask Sparky chat (CHATBOT.md section 2a). */

export const CHAT_LEADS_PER_IP_PER_HOUR = 3;
export const CHAT_FLOOD_PER_HOUR = 10;
export const FLAGGED_NOTE = 'Flagged: unusual number of chat leads in this hour.';

export interface ChatDecision {
  allow: boolean;
  flagged: boolean;
  alert: boolean;
}

/** Pure, so the rules can be tested. A full hour of leads from one source is refused. A site-wide flood is still saved. */
export function chatDecision(fromThisSource: number, inTheLastHour: number): ChatDecision {
  if (fromThisSource >= CHAT_LEADS_PER_IP_PER_HOUR) return { allow: false, flagged: false, alert: false };
  return {
    allow: true,
    flagged: inTheLastHour >= CHAT_FLOOD_PER_HOUR,
    alert: inTheLastHour === CHAT_FLOOD_PER_HOUR,
  };
}

/** A fresh Turnstile token for every lead. Without a secret, only local development passes. */
export async function turnstileOk(token: unknown, secret: string | undefined, origin: string, ip: string, action: string, expectedHost?: string): Promise<boolean> {
  if (!secret) return origin.startsWith('http://127.0.0.1:') || origin.startsWith('http://localhost:');
  if (typeof token !== 'string' || !token || token.length > 2048) return false;
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  if (!response.ok) return false;
  const data = (await response.json()) as { success?: boolean; hostname?: string; action?: string };
  if (data.success !== true || data.action !== action) return false;
  return !expectedHost || data.hostname === expectedHost;
}
