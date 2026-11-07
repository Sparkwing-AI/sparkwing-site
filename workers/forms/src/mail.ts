import { confirmationHtml, confirmationSubject, type ConfirmType } from './confirm';
import { topics, type Submission } from './validate';

export interface MailEnv {
  GRAPH_TENANT_ID?: string;
  GRAPH_CLIENT_ID?: string;
  GRAPH_CLIENT_SECRET?: string;
  MAIL_FROM: string;
  MAIL_TO: string;
}

/** Strips line breaks so a submitted value can never add a header (FR-907). */
const oneLine = (value: string) => value.replace(/\s+/g, ' ').trim();

const topicLabel = (s: Submission) => topics[s.topic as keyof typeof topics];

export function subjectFor(s: Submission): string {
  if (s.type === 'beta') return oneLine(`[Beta application] ${s.business ?? '(not given)'}, ${s.country}`);
  if (s.type === 'chat') return oneLine(`[Website chat] ${s.name}`);
  return oneLine(`[Website enquiry] ${topicLabel(s)}: ${s.name}`);
}

export function bodyFor(s: Submission, id: string, publicId: string): string {
  const lines =
    s.type === 'beta'
      ? [
          `Name: ${s.name}`,
          `Email: ${s.email}`,
          `Business: ${s.business ?? '(not given)'}`,
          `Country: ${s.country}`,
          `What the business does: ${s.business_type}`,
          `First admin task: ${s.first_task ?? '(not given)'}`,
        ]
      : s.type === 'chat'
        ? [`Name: ${s.name}`, `Email: ${s.email}`, `Message: ${s.message ?? '(not given)'}`]
        : [
            `Name: ${s.name}`,
            `Email: ${s.email}`,
            `Business: ${s.business ?? '(not given)'}`,
            `Topic: ${topicLabel(s)}`,
            `Message: ${s.message}`,
          ];
  lines.push(
    `Marketing emails OK: ${s.marketing_consent ? 'yes' : 'no'}`,
    `From page: ${s.source_page ?? '(unknown)'}`,
    `Lead ID: ${publicId}`,
    `Record: ${id}`,
  );
  return lines.join('\n');
}

/**
 * Sends through Microsoft Graph as the app, from the info@ mailbox. Exchange RBAC for Applications limits
 * the app to that one mailbox, so no tenant-wide Mail.Send consent is needed.
 */
export function sendMail(env: MailEnv, s: Submission, id: string, publicId: string): Promise<'sent' | 'skipped'> {
  return graphSend(env, subjectFor(s), bodyFor(s, id, publicId), { replyTo: { address: s.email, name: oneLine(s.name) } });
}

/** The visitor's confirmation. Replies go to info@. */
export function sendConfirmation(env: MailEnv, to: string, type: ConfirmType): Promise<'sent' | 'skipped'> {
  return graphSend(env, confirmationSubject(type), confirmationHtml(type), { to, html: true, replyTo: { address: env.MAIL_FROM, name: 'Sparkwing' } });
}

/** One summary when website chat leads flood in. Holds no visitor details. */
export function sendFloodAlert(env: MailEnv, limit: number): Promise<'sent' | 'skipped'> {
  return graphSend(
    env,
    '[Website chat] Unusual number of leads',
    `More than ${limit} website chat leads arrived in the last hour. New ones are still saved with a note saying they are flagged, and their alert emails have stopped for now. Check the lead list.`,
  );
}

interface SendOptions {
  to?: string;
  html?: boolean;
  replyTo?: { address: string; name: string };
}

async function graphSend(env: MailEnv, subject: string, content: string, options: SendOptions = {}): Promise<'sent' | 'skipped'> {
  const { to = env.MAIL_TO, html = false, replyTo } = options;
  if (!env.GRAPH_TENANT_ID || !env.GRAPH_CLIENT_ID || !env.GRAPH_CLIENT_SECRET) return 'skipped';

  const tokenResponse = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(env.GRAPH_TENANT_ID)}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GRAPH_CLIENT_ID,
        client_secret: env.GRAPH_CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    },
  );
  if (!tokenResponse.ok) throw new Error(`Graph token request failed with ${tokenResponse.status}`);
  const { access_token } = (await tokenResponse.json()) as { access_token: string };

  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(env.MAIL_FROM)}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: html ? 'HTML' : 'Text', content },
        toRecipients: [{ emailAddress: { address: to } }],
        ...(replyTo ? { replyTo: [{ emailAddress: replyTo }] } : {}),
      },
      saveToSentItems: true,
    }),
  });
  // Log the status only. The response body can echo addresses.
  if (!response.ok) throw new Error(`Graph sendMail failed with ${response.status}`);
  return 'sent';
}
