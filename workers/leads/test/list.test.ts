import assert from 'node:assert/strict';
import { type Lead } from '../../shared/types.ts';
import worker from '../src/index.ts';
import { locationDiffers, topicTag } from '../src/render.ts';

const hash = 'ab'.repeat(32);
const url = 'https://leads.example/';
const user = { access: { getIdentity: async () => ({ email: 'elly@sparkwing.com.au' }) } } as unknown as ExecutionContext;

function lead(over: Partial<Lead> & { ip_hash?: string | null; same_source_ids?: string | null } = {}): Lead & { ip_hash?: string | null; same_source_ids?: string | null } {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    type: 'enquiry',
    created_at: '2026-11-06T01:02:03.000Z',
    name: 'Ann <script>',
    email: 'ann@example.com',
    business: null,
    country: 'Australia',
    topic: 'studio',
    message: 'Hello',
    business_type: null,
    first_task: null,
    source_page: '/spark-studio',
    contact_consent_at: '2026-11-06T01:02:03.000Z',
    marketing_consent: 1,
    marketing_consent_at: '2026-11-06T01:02:03.000Z',
    consent_wording_version: 'v1',
    status: 'New',
    notes: 'note & co',
    detected_country: 'US',
    detected_region: 'California',
    public_id: 'L-0001',
    same_source_ids: 'L-0007,L-0012,L-0013,L-0020',
    ip_hash: hash,
    ...over,
  };
}

const rows = [
  lead(),
  lead({
    id: '22222222-2222-4222-8222-222222222222',
    public_id: 'L-0002',
    type: 'beta',
    name: 'Ben',
    topic: null,
    country: 'Australia',
    detected_country: 'AU',
    detected_region: null,
    same_source_ids: '',
    ip_hash: null,
    message: null,
    business_type: 'Cafe',
  }),
  lead({
    id: '33333333-3333-4333-8333-333333333333',
    public_id: 'L-0003',
    type: 'chat',
    name: 'Cara',
    topic: 'Website chat',
    country: null,
    detected_country: null,
    detected_region: null,
    same_source_ids: null,
    ip_hash: '',
  }),
];

function db() {
  return {
    prepare(sql: string) {
      assert.match(sql, /ORDER BY leads\.created_at DESC/);
      return {
        bind() {
          return this;
        },
        async all() {
          return { results: rows };
        },
      };
    },
  };
}

const page = await worker.fetch(new Request(url), { DB: db() } as never, user);
const html = await page.text();
assert.equal(page.status, 200);
assert.match(html, /<a href="\/\?tab=all" aria-current="page">All<\/a>/);
assert.ok(html.indexOf('>All<') < html.indexOf('>Beta<'));
assert.match(html, /Ann &lt;script&gt;/);
assert.match(html, /note &amp; co/);
assert.match(html, /class="tag tag-enquiry">Enquiry/);
assert.match(html, /class="tag tag-beta">Beta/);
assert.match(html, /class="tag tag-chat">Chat/);
assert.match(html, /class="tag tag-topic">Spark Studio/);
assert.equal(html.includes('tag-topic">Website chat'), false);
assert.match(html, /class="tag tag-hint">Location differs/);
assert.match(html, /Detected: California, US/);
assert.match(html, /Detected: AU/);
assert.match(html, /Same source<\/a> as <a href="\/\?tab=all#lead-L-0007">L-0007<\/a>, <a href="\/\?tab=all#lead-L-0012">L-0012<\/a>, <a href="\/\?tab=all#lead-L-0013">L-0013<\/a> and <a href="\/\?tab=all&amp;source=L-0001">1 more<\/a>/);
assert.match(html, /Same internet connection\. This may or may not be the same person\./);
assert.match(html, /id="lead-L-0001"/);
assert.equal(html.includes(hash), false);
assert.equal(html.includes('ip_hash'), false);
assert.ok(html.indexOf('>Status<') < html.indexOf('>Notes<'));
assert.ok(html.indexOf('>Notes<') < html.indexOf('>Save<'));
assert.match(html, /href="\/\?tab=all&amp;marketing=1">Marketing OK only/);
assert.match(html, /href="\/export\.csv\?tab=all">Export CSV/);

const filtered = await worker.fetch(new Request(`${url}?tab=beta&marketing=1`), { DB: db() } as never, user);
const filteredHtml = await filtered.text();
assert.match(filteredHtml, /href="\/\?tab=beta&amp;marketing=1" aria-current="page"/);
assert.match(filteredHtml, /href="\/\?tab=beta">Show everyone/);
assert.match(filteredHtml, /href="\/export\.csv\?tab=beta&amp;marketing=1">Export CSV/);

const csvResponse = await worker.fetch(new Request(`${url}export.csv?tab=all`), { DB: db() } as never, user);
const csv = await csvResponse.text();
const header = csv.split('\r\n')[0] ?? '';
for (const column of ['public_id', 'type', 'topic', 'detected_country', 'detected_region']) assert.ok(header.includes(column), column);
assert.match(csv, /L-0001/);
assert.equal(header.includes('ip_hash'), false);
assert.equal(csv.includes(hash), false);
assert.match(csv, /enquiry/);
assert.match(csv, /California/);

assert.equal(topicTag(lead()), 'Spark Studio');
assert.equal(topicTag(lead({ topic: 'call' })), 'Book a call');
assert.equal(topicTag(lead({ topic: 'app' })), 'App enquiry');
assert.equal(topicTag(lead({ type: 'beta', topic: 'studio' })), null);
assert.equal(locationDiffers(lead()), true);
assert.equal(locationDiffers(lead({ detected_country: 'AU' })), false);
assert.equal(locationDiffers(lead({ country: 'Somewhere else', detected_country: 'AU' })), true);
assert.equal(locationDiffers(lead({ country: 'Somewhere else', detected_country: 'NZ' })), false);
assert.equal(locationDiffers(lead({ country: null, detected_country: 'US' })), false);
assert.equal(locationDiffers(lead({ detected_country: null })), false);

let searchSql = '';
const searched = await worker.fetch(new Request(`${url}?q=Ann%25_&source=L-0001`), { DB: {
  prepare(sql: string) {
    searchSql = sql;
    return { bind() { return this; }, async all() { return { results: [] }; } };
  },
} } as never, user);
const searchedHtml = await searched.text();
assert.match(searchSql, /public_id LIKE/);
assert.match(searchSql, /origin\.public_id = \?/);
assert.equal(searchSql.includes(hash), false);
assert.match(searchedHtml, /No matches\./);
assert.match(searchedHtml, /Showing the same connection as L-0001/);
assert.match(searchedHtml, /Show all leads/);
assert.equal(searchedHtml.includes(hash), false);

console.log('leads list tests passed');
