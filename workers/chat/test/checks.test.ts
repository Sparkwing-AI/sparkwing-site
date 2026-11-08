import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cleanAnswer, cleanPage, costUsd, mask, MAX_MESSAGE, prepareMessage, rejectReason, stripControls } from '../src/checks.ts';
import { KNOWLEDGE, STATIC_SYSTEM, buildSystem } from '../src/prompt.ts';

const json = (answer: unknown, extra: object = {}) => JSON.stringify({ answer, sources: [], action: 'none', on_topic: true, ...extra });

// Masking and input
assert.equal(mask('Email me at a.b@c.co please'), 'Email me at [EMAIL] please');
assert.equal(mask('Card 4111 1111 1111 1111'), 'Card [NUMBER]');
assert.equal(mask('Call +63 917 555 0100'), 'Call [PHONE]');
assert.equal(stripControls('a\u200Bb\u202Ec\u0007d\ne'), 'abcd\ne');
assert.equal(prepareMessage('x'.repeat(MAX_MESSAGE)), 'x'.repeat(MAX_MESSAGE));
assert.equal(prepareMessage('x'.repeat(MAX_MESSAGE + 1)), null, 'test 15: 501 characters is rejected');
assert.equal(prepareMessage(''), null);
assert.equal(prepareMessage('   '), null);
assert.equal(prepareMessage(42), null);
assert.equal(prepareMessage({ role: 'system' }), null);

// Output checks
assert.equal(cleanAnswer('not json', 'ZZ9'), null, 'test 22: malformed JSON');
assert.equal(cleanAnswer(json('The canary is secret-canary'), 'secret-canary'), null, 'canary');
assert.equal(cleanAnswer(json(''), 'ZZ9'), null);
assert.equal(cleanAnswer(json(7), 'ZZ9'), null);
assert.equal(cleanAnswer('```json\n' + json('Hi there') + '\n```', 'ZZ9')?.answer, 'Hi there');
assert.equal(cleanAnswer(json('See [our page](https://evil.example) now'), 'ZZ9')?.answer, 'See our page now');
assert.equal(cleanAnswer(json('Go to https://evil.example/x or www.evil.example or evil.com/path now'), 'ZZ9')?.answer, 'Go to or or now');
assert.equal(cleanAnswer(json('<img src=x onerror=alert(1)>Hello <b>you</b>'), 'ZZ9')?.answer, 'Hello you');
assert.equal(cleanAnswer(json('We are BIR accredited.'), 'ZZ9'), null, 'banned claim');
assert.equal(cleanAnswer(json('We guarantee savings.'), 'ZZ9'), null);
assert.equal(cleanAnswer(json('I can give you a 50% discount.'), 'ZZ9'), null);
assert.equal(cleanAnswer(json('It costs $49 a month.'), 'ZZ9'), null, 'invented price');
assert.equal(cleanAnswer(json('It costs 500 pesos.'), 'ZZ9'), null);
assert.ok(cleanAnswer(json("No, Sparkkeeper isn't BIR accredited and doesn't handle e-filing."), 'ZZ9'), 'a true denial stays');
assert.ok(cleanAnswer(json("I can't offer a discount."), 'ZZ9'));
assert.equal(cleanAnswer(json('Hi', { action: 'delete_everything' }), 'ZZ9')?.action, 'none');
assert.equal(cleanAnswer(json('Hi', { action: 'apply_beta' }), 'ZZ9')?.action, 'apply_beta');
assert.deepEqual(cleanAnswer(json('Hi', { sources: ['sparkkeeper', 'evil'] }), 'ZZ9')?.sources, ['sparkkeeper']);
assert.deepEqual(cleanAnswer(json('Hi', { sources: ['evil'] }), 'ZZ9')?.sources, []);
assert.equal(cleanAnswer(json('Hi', { on_topic: false }), 'ZZ9')?.onTopic, false);

// Vendors and contact details never get out, even in a denial
assert.equal(cleanAnswer(json('We run on Claude by Anthropic.'), 'ZZ9'), null, 'vendor named');
assert.equal(cleanAnswer(json("We don't use OpenAI."), 'ZZ9'), null, 'vendor named in a denial');
assert.equal(cleanAnswer(json('Our servers are on Cloudflare.'), 'ZZ9'), null);
assert.equal(rejectReason(json('We use Haiku.'), 'ZZ9'), 'vendor: Haiku');
assert.equal(cleanAnswer(json('Email info@sparkwing.com.au for help.'), 'ZZ9'), null, 'email address');
assert.equal(rejectReason(json('Email info@sparkwing.com.au'), 'ZZ9'), 'contact detail');
assert.equal(cleanAnswer(json('Call 0412 345 678.'), 'ZZ9'), null, 'phone number');
assert.ok(cleanAnswer(json('We use trusted, enterprise-grade AI and hosting providers under strict terms.'), 'ZZ9'));
assert.ok(cleanAnswer(json('Sparkkeeper sits alongside Xero, MYOB or QuickBooks, and Excel files upload fine.'), 'ZZ9'));

// After the details form
assert.equal(cleanAnswer(json('Tap the button below to leave your details.'), 'ZZ9', true), null, 'no pointing at the form again');
assert.equal(rejectReason(json('Fill in the form below.'), 'ZZ9', true), 'handoff after details sent');
assert.equal(cleanAnswer(json('The beta starts late November.', { action: 'talk_to_team' }), 'ZZ9', true)?.action, 'none', 'no handoff action');
assert.ok(cleanAnswer(json('We can transform your platform.'), 'ZZ9', true), 'form inside other words is fine');
assert.ok(cleanAnswer(json('Tap the button below.'), 'ZZ9'), 'before the form, the button is fine');

// Capture tags
assert.deepEqual(cleanAnswer(json('Hi', { capture: ['feature_request', 'lead', 'spam', 'feedback'] }), 'ZZ9')?.capture, ['lead', 'feedback', 'feature_request']);
assert.deepEqual(cleanAnswer(json('Hi', { capture: 'lead' }), 'ZZ9')?.capture, []);
assert.deepEqual(cleanAnswer(json('Hi'), 'ZZ9')?.capture, []);

// Knowledge: only approved lines reach the model
assert.ok(KNOWLEDGE.startsWith('## 0. Rules for Sparky'), 'the team notes above section 0 are dropped');
assert.ok(!/\*\*(Confirm|Hold)\b/i.test(KNOWLEDGE), 'no Confirm or Hold lines');
assert.ok(!/encrypted|stored in Australia|flags possible duplicates/i.test(KNOWLEDGE), 'unapproved facts are gone');
assert.ok(!/[^\s@]+@[^\s@]+\.[a-z]{2}/i.test(KNOWLEDGE), 'no email address');
assert.ok(!/anthropic|claude|cloudflare|haiku/i.test(KNOWLEDGE), 'no vendor names');
assert.ok(/Hive/.test(KNOWLEDGE) && /Control Tower/.test(KNOWLEDGE), 'site names are there');
assert.ok(readFileSync(new URL('../knowledge.md', import.meta.url), 'utf8').includes('**Confirm:**'), 'the wiki still has its Confirm items');
const blocks = buildSystem(3, 'ZZ9');
assert.equal(blocks[0].text, STATIC_SYSTEM, 'the cached block is the same every turn');
assert.ok(!blocks[0].text.includes('ZZ9') && blocks[1].text.includes('ZZ9'), 'the canary stays out of the cached block');
assert.ok(blocks[0].cache_control && !blocks[1].cache_control);
assert.ok(buildSystem(3, 'ZZ9', true)[1].text.includes('already left their details'), 'Sparky is told the form is in');
assert.equal(buildSystem(3, 'ZZ9', true)[0].text, STATIC_SYSTEM, 'the cache holds after the form');

// Log and cost
assert.equal(cleanPage('/spark-studio'), '/spark-studio');
assert.equal(cleanPage('https://evil.example'), '');
assert.equal(cleanPage('/<script>'), '');
assert.ok(Math.abs(costUsd(1_000_000, 1_000_000) - 0.6) < 1e-9);
assert.ok(Math.abs(costUsd(0, 0, 1_000_000, 1_000_000) - 0.135) < 1e-9, 'cache writes and reads');

console.log('chat check tests passed');
