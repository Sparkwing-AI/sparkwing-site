import assert from 'node:assert/strict';
import { visitorSource } from '../src/source.ts';

function request(ip: string | null, cf?: { country?: string; region?: string }): Request {
  const headers = new Headers();
  if (ip) headers.set('CF-Connecting-IP', ip);
  return { headers, cf } as Request;
}

const au = await visitorSource(request('203.0.113.8', { country: 'au', region: 'New South Wales' }), 'test-secret');
const again = await visitorSource(request('203.0.113.8', { country: 'AU', region: 'New South Wales' }), 'test-secret');
const otherIp = await visitorSource(request('203.0.113.9'), 'test-secret');
const otherSecret = await visitorSource(request('203.0.113.8'), 'other-secret');

assert.equal(au.ip_hash, again.ip_hash);
assert.notEqual(au.ip_hash, otherIp.ip_hash);
assert.notEqual(au.ip_hash, otherSecret.ip_hash);
assert.match(au.ip_hash ?? '', /^[0-9a-f]{64}$/);
assert.equal(JSON.stringify(au).includes('203.0.113.8'), false);
assert.equal(au.detected_country, 'AU');
assert.equal(au.detected_region, 'New South Wales');

const missing = await visitorSource(request(null, { country: 'XX', region: '   ' }), 'test-secret');
assert.equal(missing.ip_hash, null);
assert.equal(missing.detected_country, null);
assert.equal(missing.detected_region, null);

const noSecret = await visitorSource(request('203.0.113.8', { country: 'PH', region: 'Metro Manila' }), '  ');
assert.equal(noSecret.ip_hash, null);
assert.equal(noSecret.detected_country, 'PH');
assert.equal(noSecret.detected_region, 'Metro Manila');

const noLocation = await visitorSource(request('203.0.113.8'), 'test-secret');
assert.equal(noLocation.detected_country, null);
assert.equal(noLocation.detected_region, null);
assert.match(noLocation.ip_hash ?? '', /^[0-9a-f]{64}$/);

const tor = await visitorSource(request('203.0.113.8', { country: 'T1', region: '1' }), 'test-secret');
assert.equal(tor.detected_country, null);
assert.equal(tor.detected_region, null);

console.log('forms source tests passed');
