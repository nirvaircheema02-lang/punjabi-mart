import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/api.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
let moduleId = 0;
const client = () => import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}#${moduleId++}`);
const response = (body, status = 200) => new Response(JSON.stringify(body), { status });

test('HTML proxy responses cannot become a successful API result', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<html>Hosting error</html>'));
  const { api, ApiError } = await client();
  await assert.rejects(api('/orders'), error => error instanceof ApiError && /unexpected response/.test(error.message));
});

test('validation errors preserve field messages and HTTP status', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => response({ errors: { email: ['Enter a valid email.'] } }, 422));
  const { api, ApiError } = await client();
  await assert.rejects(api('/session'), error => error instanceof ApiError && error.status === 422 && error.fields.email[0] === 'Enter a valid email.');
});

test('network failures produce a helpful retry message', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
  const { api } = await client();
  await assert.rejects(api('/session'), /Check your connection/);
});

test('writes share CSRF initialization and preserve Headers and multipart boundaries', async (t) => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url, options });
    return response(url === '/api/session' ? { csrf: 'test-token' } : { ok: true });
  });
  const { api, json } = await client();
  await Promise.all([api('/profile', json('patch', { name: 'Buyer' })), api('/wishlist', json('POST', { saved: true }))]);
  assert.equal(requests.filter(r => r.url === '/api/session').length, 1);
  assert.equal(requests[1].options.headers.get('X-CSRF-TOKEN'), 'test-token');
  assert.equal(requests[1].options.method, 'PATCH');
  await api('/manage/upload', { method: 'POST', body: new FormData(), headers: new Headers({ 'X-Request-Id': 'upload' }) });
  const upload = requests.at(-1).options;
  assert.equal(upload.headers.get('X-Request-Id'), 'upload');
  assert.equal(upload.headers.has('Content-Type'), false);
});

test('expired CSRF token is refreshed on the next attempt without replaying a write', async (t) => {
  let sessions = 0;
  let writes = 0;
  t.mock.method(globalThis, 'fetch', async url => {
    if (url === '/api/session') return response({ csrf: `token-${++sessions}` });
    writes++;
    return writes === 1 ? response({ message: 'CSRF mismatch' }, 419) : response({ ok: true });
  });
  const { api, json } = await client();
  await assert.rejects(api('/orders', json('POST', {})), /session expired/);
  assert.equal(writes, 1);
  await api('/orders', json('POST', {}));
  assert.equal(sessions, 2);
  assert.equal(writes, 2);
});
