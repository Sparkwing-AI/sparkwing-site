import assert from 'node:assert/strict';
import worker from '../src/index.ts';

const url = 'https://leads.example/';

function closedDb() {
  return {
    prepare() {
      throw new Error('database was touched');
    },
  };
}

async function denied(ctx: ExecutionContext) {
  const response = await worker.fetch(new Request(url), { DB: closedDb() } as never, ctx);
  const body = await response.text();
  assert.equal(response.status, 403);
  assert.equal(body, 'Sign in required');
  assert.equal(body.includes('Lead list'), false);
  assert.equal(body.includes('@'), false);
}

await denied({} as ExecutionContext);
await denied({ access: undefined } as unknown as ExecutionContext);
await denied({ access: { getIdentity: async () => ({}) } } as unknown as ExecutionContext);
await denied({ access: { getIdentity: async () => ({ email: '   ' }) } } as unknown as ExecutionContext);
await denied({ access: { getIdentity: async () => { throw new Error('identity failed'); } } } as unknown as ExecutionContext);

const csv = await worker.fetch(new Request(`${url}export.csv`), { DB: closedDb() } as never, {} as ExecutionContext);
assert.equal(csv.status, 403);
assert.equal(await csv.text(), 'Sign in required');

let queried = false;
const signed = await worker.fetch(
  new Request(url),
  {
    DB: {
      prepare() {
        queried = true;
        return {
          bind() {
            return this;
          },
          async all() {
            return { results: [] };
          },
        };
      },
    },
  } as never,
  { access: { getIdentity: async () => ({ email: 'elly@sparkwing.com.au' }) } } as unknown as ExecutionContext,
);
assert.equal(signed.status, 200);
assert.equal(queried, true);
assert.match(await signed.text(), /Signed in as elly@sparkwing.com.au/);

console.log('leads access tests passed');
