import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { createRequire } from 'node:module';
import type { NextAuthOptions } from 'next-auth';
import type { CredentialsConfig } from 'next-auth/providers/credentials';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

// Stub the singleton before importing auth/routes; never use .env or a live DB.
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
let reads = 0;
let writes = 0;
let missingUser = false;
const passwordHash = bcrypt.hashSync('test-password', 4);
const dbStub = { user: {
  findUnique: async ({ where }: { where: { email: string } }) => {
    reads++;
    assert.equal(where.email, 'customer@example.com');
    return missingUser ? null : { id: 'test-user', email: where.email, name: 'Customer',
      image: null, passwordHash, role: 'USER', master: null };
  },
  create: async ({ data }: { data: { email: string; passwordHash: string; role: string } }) => {
    writes++;
    assert.equal(data.email, 'customer@example.com');
    assert.equal(data.role, 'USER');
    assert.ok(await bcrypt.compare('test-password', data.passwordHash));
    return { id: 'test-user' };
  },
} };
(globalThis as unknown as { prisma: unknown }).prisma = dbStub;
// NextAuth v4's provider is CommonJS; use tsx's require bridge to match the
// default-import interop supplied by the Next.js application bundler.
const { authOptions } = createRequire(import.meta.url)('./auth.ts') as { authOptions: NextAuthOptions };
const { POST: register } = await import('../app/api/auth/register/route');
const { POST: completeRegistration } = await import('../app/api/booking/client/complete/route');

test('credentials and registration preserve validation and never query invalid input', async () => {
  const network = mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected network request'); });
  try {
    const provider = authOptions.providers.find(item => item.type === 'credentials');
    assert.ok(provider);
    const options = provider.options as Partial<CredentialsConfig> | undefined;
    assert.ok(options?.authorize);
    const request = { headers: {}, query: {}, body: {}, method: 'POST' };
    assert.equal(await options.authorize({ email: 'invalid', password: 'test-password' }, request), null);
    assert.equal(await options.authorize({ email: 'customer@example.com', password: 'short' }, request), null);
    assert.equal(reads, 0);
    const user = await options.authorize({ email: ' CUSTOMER@example.com ', password: 'test-password' }, request);
    assert.equal(user?.id, 'test-user');
    assert.equal(await options.authorize({ email: 'customer@example.com', password: 'wrong-password' }, request), null);

    const registration = (payload: unknown) => new Request('http://localhost/api/auth/register', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
    });
    const readsBefore = reads;
    assert.equal((await register(registration({ email: 'invalid', password: 'test-password' }))).status, 400);
    assert.equal(reads, readsBefore);
    assert.equal(writes, 0);
    missingUser = true;
    assert.equal((await register(registration({ email: 'customer@example.com', password: 'test-password' }))).status, 201);
    assert.equal(writes, 1);
    assert.equal(network.mock.callCount(), 0);
  } finally {
    mock.restoreAll();
  }
});

test('Google completion returns structured issues for invalid input before DB access', async () => {
  const readsBefore = reads;
  const response = await completeRegistration(new NextRequest('http://localhost/api/booking/client/complete', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phone: '' }),
  }));
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.ok(Array.isArray(body.details));
  assert.ok(body.details.some((issue: { path: string[] }) => issue.path[0] === 'registrationId'));
  assert.equal(reads, readsBefore);
});
