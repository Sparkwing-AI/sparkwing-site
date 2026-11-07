/**
 * Confirmation emails to people who send the enquiry or beta form (CORE-194).
 * They hold no text the visitor typed, so the form can't be used to send someone else a message.
 */

export const CONFIRMATIONS_PER_EMAIL_PER_DAY = 1;
export const CONFIRMATIONS_PER_SOURCE_PER_HOUR = 3;

export type ConfirmType = 'enquiry' | 'beta';

/** Pure, so the rules can be tested. Counts are confirmations already sent. */
export function shouldConfirm(type: string, flagged: boolean, toThisEmailToday: number, fromThisSourceThisHour: number): type is ConfirmType {
  if (type !== 'enquiry' && type !== 'beta') return false;
  if (flagged) return false;
  if (toThisEmailToday >= CONFIRMATIONS_PER_EMAIL_PER_DAY) return false;
  return fromThisSourceThisHour < CONFIRMATIONS_PER_SOURCE_PER_HOUR;
}

const copy: Record<ConfirmType, { subject: string; heading: string; lines: string[] }> = {
  enquiry: {
    subject: "We've got your message, Sparkwing",
    heading: 'Thanks for getting in touch.',
    lines: [
      "We've got your message, and someone from our team will get back to you soon.",
      'Want to add anything? Just reply to this email.',
    ],
  },
  beta: {
    subject: 'Your Sparkkeeper beta application is in',
    heading: 'Thanks for applying for the Sparkkeeper beta.',
    lines: [
      "We've got your application. The beta starts in late November and places are limited, so we'll be in touch soon to let you know if you have a place.",
      'Questions in the meantime? Just reply to this email.',
    ],
  },
};

const ignore = "Didn't fill in a form on our website? You can ignore this email. Someone may have typed your address by mistake.";

export function confirmationText(type: ConfirmType): string {
  const c = copy[type];
  return ['Hi there,', '', c.heading, '', ...c.lines.flatMap((line) => [line, '']), 'The Sparkwing team', 'sparkwing.com.au', '', ignore, '', 'Sparkwing Pty Ltd, Sydney, Australia'].join('\n');
}

/** Plain, table-based HTML with inline styles, so it reads well in Outlook and Gmail. Colours match the website tokens. */
export function confirmationHtml(type: ConfirmType): string {
  const c = copy[type];
  const deep = '#0C352F';
  const gold = '#FEB938';
  const text = '#1E2B2A';
  const muted = '#165C53';
  const paragraphs = c.lines
    .map((line) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:${text}">${line}</p>`)
    .join('');
  return `<!doctype html><html lang="en-AU"><body style="margin:0;padding:0;background:#FFF8E7">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8E7"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden;font-family:'DM Sans',Arial,Helvetica,sans-serif">
<tr><td style="background:${deep};padding:24px 32px">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:12px"><img src="https://sparkwing.com.au/assets/sparkwing-mark.png" width="40" height="40" alt="" style="display:block"></td>
<td><div style="font-size:22px;font-weight:700;color:#FFFFFF">Sparkwing</div><div style="font-size:11px;font-weight:700;letter-spacing:1px;color:${gold}">AN AI TRANSFORMATION COMPANY</div></td>
</tr></table></td></tr>
<tr><td style="padding:32px 32px 8px">
<p style="margin:0 0 12px;font-size:16px;color:${text}">Hi there,</p>
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:${deep}">${c.heading}</h1>
${paragraphs}
<p style="margin:24px 0 0;font-size:16px;color:${text}">The Sparkwing team<br><a href="https://sparkwing.com.au" style="color:${muted}">sparkwing.com.au</a></p>
</td></tr>
<tr><td style="padding:24px 32px 32px"><div style="height:4px;width:80px;background:${gold};border-radius:2px"></div>
<p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:${muted}">${ignore}</p>
<p style="margin:8px 0 0;font-size:13px;color:${muted}">Sparkwing Pty Ltd, Sydney, Australia</p></td></tr>
</table></td></tr></table></body></html>`;
}

export function confirmationSubject(type: ConfirmType): string {
  return copy[type].subject;
}
