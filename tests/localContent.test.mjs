import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'vite';

test('local content service preserves uploads, rejects unsafe writes, and survives restart', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-content-test-'));
  const previous = process.env.PORTFOLIO_DATA_DIR;
  process.env.PORTFOLIO_DATA_DIR = directory;
  let server;
  const start = async () => {
    server = await createServer({ server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
    await server.listen();
    return `http://127.0.0.1:${server.httpServer.address().port}`;
  };
  try {
    let base = await start();
    const token = (await (await fetch(base + '/api/admin/session')).json()).token;
    const headers = { 'X-Admin-Token': token };
    const get = async () => (await (await fetch(base + '/api/admin/content', { headers })).json());
    const save = document => fetch(base + '/api/admin/content', { method: 'PUT', headers, body: JSON.stringify(document) });
    const initial = await get();
    assert.ok(initial.document.entries.length > 0);
    assert.equal((await fetch(base + '/api/admin/content')).status, 401);
    assert.equal((await fetch(base + '/api/admin/session', { headers: { Origin: 'https://foreign.example' } })).status, 403);
    assert.equal((await fetch(base + '/api/admin/uploads', { method: 'POST', headers, body: '<svg onload="alert(1)" />' })).status, 415);
    assert.equal((await fetch(base + '/api/admin/uploads', { method: 'POST', headers, body: '<html />' })).status, 415);
    // Known 1x1 PNG; files are checked from bytes rather than an untrusted name.
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aDqkAAAAASUVORK5CYII=', 'base64');
    const upload = await fetch(base + '/api/admin/uploads', { method: 'POST', headers, body: png });
    assert.equal(upload.status, 201);
    const file = await upload.json();
    assert.equal(file.mime, 'image/png');
    assert.deepEqual(Buffer.from(await (await fetch(base + file.url)).arrayBuffer()), png);
    const range = await fetch(base + file.url, { headers: { Range: 'bytes=0-7' } });
    assert.equal(range.status, 206); assert.equal((await range.arrayBuffer()).byteLength, 8);
    assert.equal((await fetch(base + file.url, { headers: { Range: 'bytes=999999-' } })).status, 416);
    assert.equal((await fetch(base + '/api/uploads/..%2Fcontent.json')).status, 404);
    const entry = { id: 'test-only', kind: 'brand', category: 'ecommerce', title: 'Test H5', description: '', tags: [],
      media: [{ id: file.id, type: 'image', url: file.url }], presentation: 'portrait', detail: { type: 'link', url: 'https://example.org/project' } };
    const document = { version: 1, entries: [...initial.document.entries, entry] };
    assert.equal((await save({ revision: initial.revision, document })).status, 200);
    assert.equal((await save({ revision: initial.revision, document })).status, 409);
    const current = await get();
    assert.equal((await save({ revision: current.revision, document: { version: 1, entries: [entry, entry] } })).status, 400);
    assert.equal((await save({ revision: current.revision, document: { version: 1, entries: [{ ...entry, detail: { type: 'link', url: 'javascript:alert(1)' } }] } })).status, 400);
    const disk = JSON.parse(await readFile(join(directory, 'content.json'), 'utf8'));
    assert.equal(disk.revision, current.revision);
    assert.deepEqual(disk.document, document);
    assert.equal((await readdir(join(directory, 'backups'))).length, 1);
    await server.close(); base = await start();
    assert.deepEqual(await (await fetch(base + '/api/content')).json(), document);
    assert.deepEqual(Buffer.from(await (await fetch(base + file.url)).arrayBuffer()), png);
    // A restarted server invalidates the former editing session.
    assert.equal((await fetch(base + '/api/admin/content', { headers })).status, 401);
  } finally {
    await server?.close();
    if (previous === undefined) delete process.env.PORTFOLIO_DATA_DIR; else process.env.PORTFOLIO_DATA_DIR = previous;
    await rm(directory, { recursive: true, force: true });
  }
});
