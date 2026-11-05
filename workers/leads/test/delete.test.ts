import assert from 'node:assert/strict';
import worker from '../src/index.ts';

const origin = 'https://leads.example';
const drop = '11111111-1111-4111-8111-111111111111';
const keep = '22222222-2222-4222-8222-222222222222';
const user = { access: { getIdentity: async () => ({ email: 'elly@sparkwing.com.au' }) } } as unknown as ExecutionContext;

function closedDb() {
  return {
    prepare() {
      throw new Error('database was touched');
    },
    batch() {
      throw new Error('database was touched');
    },
  };
}

const signedOut = await worker.fetch(
  new Request(`${origin}/leads/${drop}/delete`, { method: 'POST', headers: { Origin: origin } }),
  { DB: closedDb() } as never,
  {} as ExecutionContext,
);
assert.equal(signedOut.status, 403);
assert.equal(await signedOut.text(), 'Sign in required');

const wrongOrigin = await worker.fetch(
  new Request(`${origin}/leads/${drop}/delete`, { method: 'POST', headers: { Origin: 'https://evil.example', 'Sec-Fetch-Site': 'cross-site' } }),
  { DB: closedDb() } as never,
  user,
);
assert.equal(wrongOrigin.status, 403);
assert.equal(await wrongOrigin.text(), 'Bad origin');

const blankOrigin = await worker.fetch(
  new Request(`${origin}/leads/${drop}/delete`, { method: 'POST', headers: { Origin: 'null', 'Sec-Fetch-Site': 'cross-site' } }),
  { DB: closedDb() } as never,
  user,
);
assert.equal(blankOrigin.status, 403);

const badId = await worker.fetch(
  new Request(`${origin}/leads/not-a-uuid/delete`, { method: 'POST', headers: { Origin: origin } }),
  { DB: closedDb() } as never,
  user,
);
assert.equal(badId.status, 400);
assert.equal(await badId.text(), 'Bad id');

const byGet = await worker.fetch(new Request(`${origin}/leads/${drop}/delete`, { headers: { Origin: origin } }), { DB: closedDb() } as never, user);
assert.equal(byGet.status, 405);

const leads = new Map<string, { type: string }>([
  [drop, { type: 'beta' }],
  [keep, { type: 'enquiry' }],
]);
const audits: unknown[][] = [];
const db = {
  prepare(sql: string) {
    return {
      bind(...args: unknown[]) {
        return { sql, args };
      },
    };
  },
  async batch(statements: { sql: string; args: unknown[] }[]) {
    for (const statement of statements) {
      if (statement.sql.startsWith('INSERT INTO lead_deletions')) audits.push(statement.args);
      if (statement.sql.startsWith('DELETE FROM leads')) leads.delete(String(statement.args[0]));
    }
  },
};
const removed = await worker.fetch(
  new Request(`${origin}/leads/${drop}/delete`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'tab=all',
  }),
  {
    DB: {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            return {
              sql,
              args,
              async first() {
                if (!sql.startsWith('SELECT type')) throw new Error(sql);
                const row = leads.get(String(args[0]));
                return row ? { type: row.type } : null;
              },
            };
          },
        };
      },
      batch: db.batch,
    },
  } as never,
  user,
);
assert.equal(removed.status, 303);
assert.equal(leads.has(drop), false);
assert.equal(leads.has(keep), true);
assert.equal(audits.length, 1);
assert.equal(audits[0][1], drop);
assert.equal(audits[0][2], 'beta');
assert.equal(audits[0][3], 'elly@sparkwing.com.au');
assert.equal(JSON.stringify(audits[0]).includes('ann@'), false);
assert.equal(JSON.stringify(audits[0]).includes('message'), false);

const sameTab = await worker.fetch(
  new Request(`${origin}/leads/${keep}/delete`, {
    method: 'POST',
    headers: { Origin: 'null', 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'tab=all',
  }),
  {
    DB: {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            return {
              sql,
              args,
              async first() {
                const row = leads.get(String(args[0]));
                return row ? { type: row.type } : null;
              },
            };
          },
        };
      },
      batch: db.batch,
    },
  } as never,
  user,
);
assert.equal(sameTab.status, 303);
assert.equal(leads.has(keep), false);

console.log('leads delete tests passed');
