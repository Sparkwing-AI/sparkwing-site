import assert from 'node:assert/strict';
import { chatDecision } from '../src/chatguard.ts';

assert.deepEqual(chatDecision(0, 0), { allow: true, flagged: false, alert: false });
assert.deepEqual(chatDecision(2, 2), { allow: true, flagged: false, alert: false });
assert.equal(chatDecision(3, 3).allow, false, 'the fourth lead in an hour from one source is refused');
assert.deepEqual(chatDecision(0, 9), { allow: true, flagged: false, alert: false });
assert.deepEqual(chatDecision(0, 10), { allow: true, flagged: true, alert: true }, 'the eleventh lead is flagged and alerts once');
assert.deepEqual(chatDecision(0, 11), { allow: true, flagged: true, alert: false }, 'later leads are flagged without another alert');
console.log('forms chat guard tests passed');
