export const countries = ['Australia', 'Philippines', 'Somewhere else'] as const;
export const topics = {
  call: 'Book a discovery call',
  app: 'Ask about an app',
  studio: 'Spark Studio',
  other: 'Something else',
} as const;

export interface Submission {
  type: 'beta' | 'enquiry' | 'chat';
  name: string;
  email: string;
  business: string | null;
  country: string | null;
  topic: string | null;
  message: string | null;
  business_type: string | null;
  first_task: string | null;
  source_page: string | null;
  marketing_consent: boolean;
  consent_wording_version: string | null;
}

export type Result = { ok: true; value: Submission } | { ok: false; errors: string[] } | { ok: 'spam' };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(input: unknown, max: number, multiline = false): string {
  if (typeof input !== 'string') return '';
  // Single-line fields lose every control character, including line breaks. Multi-line fields keep tabs and newlines.
  const cleaned = multiline
    ? input.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    : input.replace(/[\u0000-\u001f\u007f]/g, ' ');
  return cleaned.trim().slice(0, max);
}

/** Validates again on the server (FR-902). Lists the field names that failed. */
export function validate(body: unknown): Result {
  if (typeof body !== 'object' || body === null) return { ok: false, errors: ['body'] };
  const raw = body as Record<string, unknown>;

  // Filled honeypot: drop without a row or an email (FR-909).
  if (typeof raw.company_site === 'string' && raw.company_site.trim() !== '') return { ok: 'spam' };

  const type = raw.type;
  if (type !== 'beta' && type !== 'enquiry' && type !== 'chat') return { ok: false, errors: ['type'] };

  const errors: string[] = [];
  const name = text(raw.name, 200);
  const email = text(raw.email, 254);
  const business = text(raw.business, 200);
  if (!name) errors.push('name');
  if (!emailPattern.test(email)) errors.push('email');
  if (raw.contact_consent !== true) errors.push('contact_consent');

  let country: string | null = null;
  let topic: string | null = null;
  let message: string | null = null;
  let businessType: string | null = null;
  let firstTask: string | null = null;

  if (type === 'beta') {
    country = text(raw.country, 50);
    if (!(countries as readonly string[]).includes(country)) errors.push('country');
    businessType = text(raw.business_type, 2000, true);
    if (!businessType) errors.push('business_type');
    firstTask = text(raw.first_task, 2000, true) || null;
  } else if (type === 'chat') {
    topic = 'Website chat';
    message = text(raw.message, 500, true) || null;
  } else {
    topic = text(raw.topic, 20);
    if (!Object.hasOwn(topics, topic)) errors.push('topic');
    message = text(raw.message, 5000, true);
    if (!message) errors.push('message');
  }

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      type,
      name,
      email,
      business: business || null,
      country,
      topic,
      message,
      business_type: businessType,
      first_task: firstTask,
      source_page: text(raw.source_page, 200) || null,
      marketing_consent: raw.marketing_consent === true,
      consent_wording_version: text(raw.consent_wording_version, 40) || null,
    },
  };
}
