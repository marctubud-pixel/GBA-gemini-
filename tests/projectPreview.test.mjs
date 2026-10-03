import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('draft preview rejects stale sessions and unsafe or missing works without changing the draft', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'portfolio-preview-cache-'));
  const server = await createServer({ configFile: false, cacheDir, server: { middlewareMode: true, hmr: false }, logLevel: 'silent' });
  try {
    const { parsePreviewMessage, previewContext, readPreviewContext } = await server.ssrLoadModule('/src/content/projectPreview.ts');
    const token = '642a5b78-401c-438a-9f72-136797eeb2d2';
    const requestId = 'a6b19dc0-c794-4090-a626-d8d97a2d7aa3';
    const entry = { id: 'draft:unpublished', kind: 'brand', category: 'brand', title: '尚未保存的品牌方案', description: '', tags: [], media: [],
      detail: { type: 'pdf', url: '/api/uploads/draft.pdf' }, coverLayout: { ratio: '9:16', fit: 'contain' } };
    const message = { type: 'portfolio-project-preview', token, requestId, entryId: entry.id, page: 'detail', document: { version: 1, entries: [entry] } };
    const original = structuredClone(message);
    const parsed = parsePreviewMessage(message, token);
    assert.equal(parsed.document.entries[0].detail.url, '/api/uploads/draft.pdf');
    assert.deepEqual(message, original);
    assert.deepEqual(readPreviewContext(previewContext('detail', entry.id, requestId)), { page: 'detail', entryId: entry.id });
    for (const change of [
      { token: requestId }, { requestId: '' }, { entryId: 'not-in-this-draft' }, { page: 'save' },
      { document: { version: 1, entries: [entry, entry] } },
      { document: { version: 1, entries: [{ ...entry, detail: { type: 'link', url: 'javascript:alert(1)' } }] } },
      { document: { version: 1, entries: [{ ...entry, media: [{ id: 'video', type: 'video', url: '//other.example/clip.mp4' }] }] } },
    ]) assert.throws(() => parsePreviewMessage({ ...message, ...change }, token));
    assert.equal(readPreviewContext('making'), null);
    assert.equal(readPreviewContext('preview:detail:wrong-session:draft'), null);
  } finally { await server.close(); await rm(cacheDir, { recursive: true, force: true }); }
});
