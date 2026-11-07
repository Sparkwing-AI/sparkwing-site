import assert from 'node:assert/strict';
import { cleanAnswer, cleanPage, costUsd, mask, MAX_MESSAGE, prepareMessage, stripControls } from '../src/checks.ts';

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

// Log and cost
assert.equal(cleanPage('/spark-studio'), '/spark-studio');
assert.equal(cleanPage('https://evil.example'), '');
assert.equal(cleanPage('/<script>'), '');
assert.ok(Math.abs(costUsd(1_000_000, 1_000_000) - 0.6) < 1e-9);

console.log('chat check tests passed');
