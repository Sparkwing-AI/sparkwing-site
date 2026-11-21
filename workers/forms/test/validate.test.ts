import assert from 'node:assert/strict';
import { subjectFor } from '../src/mail.ts';
import { validate, type Submission } from '../src/validate.ts';

const chat = (extra: object = {}) => validate({ type: 'chat', name: 'Sam', email: 'sam@example.com', contact_consent: true, ...extra });
const tags = (extra: object = {}) => {
  const result = chat(extra);
  assert.equal(result.ok, true);
  return result.ok === true ? result.value.tags : '';
};

assert.equal(tags(), 'lead', 'details with no tag count as a lead');
assert.equal(tags({ capture: [] }), 'lead');
assert.equal(tags({ capture: ['feature_request'] }), 'feature_request', 'an industry we do not cater to stays a feature request only');
assert.equal(tags({ capture: ['feature_request', 'feedback', 'lead'] }), 'lead,feedback,feature_request', 'one capture, three views');
assert.equal(tags({ capture: ['admin', '<script>', 'lead'] }), 'lead', 'unknown tags are dropped');
assert.equal(tags({ capture: 'lead,admin' }), 'lead', 'a string is ignored');

const enquiry = validate({ type: 'enquiry', name: 'Sam', email: 'sam@example.com', contact_consent: true, topic: 'call', message: 'Hi', capture: ['lead'] });
assert.equal(enquiry.ok === true ? enquiry.value.tags : 'x', '', 'forms other than chat have no tags');

const retired = validate({ type: 'enquiry', name: 'Sam', email: 'sam@example.com', contact_consent: true, topic: 'studio', message: 'Hi' });
assert.equal(retired.ok, false);

const letter = (topic: string): Submission => ({
  type: 'enquiry',
  name: 'Sam',
  email: 'sam@example.com',
  business: null,
  country: null,
  topic,
  message: 'Hi',
  business_type: null,
  first_task: null,
  source_page: '/',
  marketing_consent: false,
  consent_wording_version: null,
  tags: '',
});
assert.equal(subjectFor(letter('demo')), '[Website enquiry] Request a demo: Sam');
assert.equal(subjectFor(letter('pricing')), '[Website enquiry] Enquire about pricing: Sam');
assert.equal(subjectFor(letter('general')), '[Website enquiry] General questions: Sam');
assert.equal(subjectFor(letter('support')), '[Website enquiry] I need support: Sam');

console.log('validate tests passed');
