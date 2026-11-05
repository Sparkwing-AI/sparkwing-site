import assert from 'node:assert/strict';
import { allocateLeadId, allocateSql, formatLeadId } from '../src/ids.ts';
import { bodyFor } from '../src/mail.ts';
import { type Submission } from '../src/validate.ts';

assert.equal(formatLeadId(1), 'L-0001');
assert.equal(formatLeadId(42), 'L-0042');
assert.equal(formatLeadId(10000), 'L-10000');
assert.match(allocateSql, /UPDATE lead_numbers SET last_assigned = last_assigned \+ 1/);
assert.match(allocateSql, /RETURNING last_assigned/);

let assigned = 0;
const first = await allocateLeadId({
  prepare() {
    return {
      async first() {
        assigned += 1;
        return { last_assigned: assigned };
      },
    };
  },
} as never);
const second = await allocateLeadId({
  prepare() {
    return {
      async first() {
        assigned += 1;
        return { last_assigned: assigned };
      },
    };
  },
} as never);
assert.equal(first, 'L-0001');
assert.equal(second, 'L-0002');

const submission = {
  type: 'beta',
  name: 'Ada',
  email: 'ada@example.com',
  business: 'Engines',
  country: 'Australia',
  topic: null,
  message: null,
  business_type: 'Making',
  first_task: null,
  source_page: '/sparkkeeper/beta',
  marketing_consent: false,
  consent_wording_version: 'beta-v1',
} as Submission;
const letter = bodyFor(submission, '11111111-1111-4111-8111-111111111111', 'L-0004');
assert.match(letter, /Lead ID: L-0004/);
assert.equal(letter.includes('203.0.113.8'), false);

console.log('forms id tests passed');
