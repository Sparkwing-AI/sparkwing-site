import assert from 'node:assert/strict';
import { confirmationHtml, confirmationSubject, confirmationText, shouldConfirm } from '../src/confirm.ts';

assert.equal(shouldConfirm('enquiry', false, 0, 0), true);
assert.equal(shouldConfirm('beta', false, 0, 2), true);
assert.equal(shouldConfirm('chat', false, 0, 0), false, 'chat leads get no email');
assert.equal(shouldConfirm('enquiry', true, 0, 0), false, 'flagged leads get no email');
assert.equal(shouldConfirm('enquiry', false, 1, 0), false, 'one a day per address');
assert.equal(shouldConfirm('beta', false, 0, 3), false, 'three an hour per source');

for (const type of ['enquiry', 'beta'] as const) {
  const html = confirmationHtml(type);
  assert.ok(html.includes('sparkwing.com.au'));
  assert.ok(!/[\u2014]/.test(html + confirmationText(type) + confirmationSubject(type)), 'no em dashes');
  assert.ok(!html.includes('${'), 'no unfilled template');
}
assert.match(confirmationText('beta'), /late November/);
console.log('forms confirmation tests passed');
