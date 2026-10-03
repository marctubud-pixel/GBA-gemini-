import { randomBytes, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, open, readFile, readdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { parseContentDocument } from '../src/content/contentRepository';
import { CONTENT_SEED } from '../src/data/contentSeed';
import type { ContentDocument } from '../src/data/contentTypes';

const TYPES: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf', mp4: 'video/mp4', webm: 'video/webm' };
class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
function fileType(bytes: Buffer): string | undefined {
  if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'png';
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'jpg';
  if (/^GIF8[79]a$/.test(bytes.toString('ascii', 0, 6))) return 'gif';
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (bytes.toString('ascii', 0, 5) === '%PDF-') return 'pdf';
  if (bytes.toString('ascii', 4, 8) === 'ftyp' && /^(isom|iso[2-9]|mp4[12]|avc1|M4V |MSNV)/.test(bytes.toString('ascii', 8, 12))) return 'mp4';
  if (bytes.subarray(0, 4).equals(Buffer.from([26,69,223,163])) && bytes.includes(Buffer.from('webm'))) return 'webm';
}

function localRequest(req: IncomingMessage) {
  const remote = req.socket.remoteAddress;
  if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote || '')) throw new ApiError(403, '后台仅限本机访问');
  const host = req.headers.host || '';
  if (!/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)) throw new ApiError(403, '请通过 localhost 或 127.0.0.1 打开后台');
  if (req.headers['sec-fetch-site'] === 'cross-site') throw new ApiError(403, '不接受其他网站的后台请求');
  if (req.headers.origin && req.headers.origin !== `http://${host}` && req.headers.origin !== `https://${host}`) throw new ApiError(403, '后台请求来源不匹配');
}

async function jsonBody(req: IncomingMessage) {
  const parts: Buffer[] = []; let length = 0;
  for await (const chunk of req) {
    const part = Buffer.from(chunk); length += part.length;
    if (length > 8 * 1024 * 1024) throw new ApiError(413, '作品信息过大，请通过文件上传添加媒体');
    parts.push(part);
  }
  try { return JSON.parse(Buffer.concat(parts).toString('utf8')); }
  catch { throw new ApiError(400, '提交内容不是有效 JSON'); }
}
function respond(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(body));
}

/** Local-only persistent content service, used in both Vite dev and preview. */
export function localContentPlugin(): Plugin {
  let root: string;
  let isBuild = false;
  const token = randomBytes(32).toString('hex');
  let initPromise: Promise<void> | undefined;
  let writes = Promise.resolve();
  const dataPath = () => resolve(process.env.PORTFOLIO_DATA_DIR || join(root, '.portfolio-data'));
  const snapshotPath = () => join(dataPath(), 'content.json');
  const initialize = () => initPromise ||= (async () => {
    await mkdir(join(dataPath(), 'uploads'), { recursive: true });
    await mkdir(join(dataPath(), 'backups'), { recursive: true });
    try { await stat(snapshotPath()); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      // Never replace an existing collection, including on server restarts.
      await writeFile(snapshotPath(), JSON.stringify({ revision: randomUUID(), document: { version: 1, entries: CONTENT_SEED } }, null, 2), { flag: 'wx', mode: 0o600 });
    }
  })();
  const load = async (): Promise<{ revision: string; document: ContentDocument }> => {
    await initialize();
    const value = JSON.parse(await readFile(snapshotPath(), 'utf8'));
    return { revision: value.revision, document: parseContentDocument(value.document) };
  };

  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const path = (req.url || '').split('?')[0];
    if (path.startsWith('/pdf-support/') && (req.method === 'GET' || req.method === 'HEAD')) {
      const match = /^\/pdf-support\/(cmaps|standard_fonts|wasm)\/([\w.-]+)$/.exec(path);
      if (match && !match[2].startsWith('.')) {
        try {
          const bytes = await readFile(join(root, 'node_modules/pdfjs-dist', match[1], match[2]));
          const mime = match[2].endsWith('.wasm') ? 'application/wasm' : /\.m?js$/.test(match[2]) ? 'text/javascript' : 'application/octet-stream';
          res.writeHead(200, { 'Content-Type': mime, 'X-Content-Type-Options': 'nosniff' });
          res.end(req.method === 'HEAD' ? undefined : bytes); return;
        } catch { respond(res, 404, { error: 'PDF 阅读资源不存在' }); return; }
      }
      respond(res, 404, { error: '资源不存在' }); return;
    }
    if (!path.startsWith('/api/')) { next(); return; }
    try {
      if (path === '/api/content' && (req.method === 'GET' || req.method === 'HEAD')) {
        const snapshot = await load(); respond(res, 200, snapshot.document); return;
      }
      if (path.startsWith('/api/uploads/')) {
        if (!['GET', 'HEAD'].includes(req.method || '')) throw new ApiError(405, '不支持的操作');
        const name = path.slice('/api/uploads/'.length);
        if (!/^[a-f0-9-]{36}\.(png|jpg|gif|webp|pdf|mp4|webm)$/.test(name)) throw new ApiError(404, '文件不存在');
        await initialize();
        const file = join(dataPath(), 'uploads', name);
        const info = await stat(file).catch(() => { throw new ApiError(404, '文件不存在'); });
        let start = 0, end = info.size - 1, status = 200;
        if (req.headers.range) {
          const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
          if (!match || (!match[1] && !match[2])) throw new ApiError(416, '无效文件范围');
          start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]));
          end = match[1] && match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
          if (start > end || start >= info.size) { res.setHeader('Content-Range', `bytes */${info.size}`); throw new ApiError(416, '文件范围超出长度'); }
          status = 206;
        }
        res.writeHead(status, { 'Content-Type': TYPES[name.split('.').pop()!], 'Content-Length': end - start + 1,
          'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff',
          ...(status === 206 ? { 'Content-Range': `bytes ${start}-${end}/${info.size}` } : {}) });
        if (req.method === 'HEAD') res.end();
        else { const stream = createReadStream(file, { start, end }); stream.on('error', () => res.destroy()); res.on('close', () => stream.destroy()); stream.pipe(res); }
        return;
      }
      if (!path.startsWith('/api/admin/')) throw new ApiError(404, '接口不存在');
      localRequest(req);
      if (path === '/api/admin/session' && req.method === 'GET') {
        respond(res, 200, { token, storage: 'local', dataDirectory: dataPath() }); return;
      }
      if (req.headers['x-admin-token'] !== token) throw new ApiError(401, '后台连接已过期，请刷新管理页面');
      if (path === '/api/admin/content' && req.method === 'GET') { respond(res, 200, await load()); return; }
      if (path === '/api/admin/content' && req.method === 'PUT') {
        const body = await jsonBody(req);
        let document: ContentDocument;
        try { document = parseContentDocument(body.document); }
        catch (error) { throw new ApiError(400, (error as Error).message); }
        if (document.entries.some(entry => !entry.title.trim())) throw new ApiError(400, '请填写项目名称');
        const operation = writes.then(async () => {
          const previous = await load();
          if (body.revision !== previous.revision) throw new ApiError(409, '其他页面已更新作品，请重新载入后再保存');
          const revision = randomUUID();
          await writeFile(join(dataPath(), 'backups', `${previous.revision}.json`), JSON.stringify(previous, null, 2), { flag: 'wx', mode: 0o600 });
          const temporary = join(dataPath(), `content-${revision}.tmp`);
          await writeFile(temporary, JSON.stringify({ revision, document }, null, 2), { mode: 0o600 });
          await rename(temporary, snapshotPath());
          return { revision, document };
        });
        writes = operation.then(() => undefined, () => undefined);
        respond(res, 200, await operation); return;
      }
      if (path === '/api/admin/uploads' && req.method === 'POST') {
        await initialize();
        const temporary = join(dataPath(), 'uploads', `${randomUUID()}.tmp`);
        const handle = await open(temporary, 'wx', 0o600);
        let size = 0; let prefix = Buffer.alloc(0); let extension: string | undefined;
        try {
          for await (const chunk of req) {
            const part = Buffer.from(chunk); size += part.length;
            if (size > 250 * 1024 * 1024) throw new ApiError(413, '视频最大 250 MB');
            if (prefix.length < 4096) prefix = Buffer.concat([prefix, part]).subarray(0, 4096);
            await handle.writeFile(part);
          }
          extension = fileType(prefix);
          if (!extension) throw new ApiError(415, '支持 JPG、PNG、WebP、GIF、MP4、WebM 和 PDF；H5 请上传画面并填写体验链接');
          if (!['mp4', 'webm'].includes(extension) && size > 50 * 1024 * 1024) throw new ApiError(413, '图片和 PDF 最大 50 MB');
          await handle.close();
          const id = randomUUID(); const name = `${id}.${extension}`;
          await rename(temporary, join(dataPath(), 'uploads', name));
          respond(res, 201, { id, url: `/api/uploads/${name}`, mime: TYPES[extension], size });
        } catch (error) { await handle.close().catch(() => {}); await unlink(temporary).catch(() => {}); throw error; }
        return;
      }
      throw new ApiError(405, '不支持的后台操作');
    } catch (error) {
      if (res.headersSent) { res.destroy(); return; }
      const status = error instanceof ApiError ? error.status : 500;
      respond(res, status, { error: status === 500 ? '本机文件保存失败，请检查磁盘和内容备份' : (error as Error).message });
    }
  };
  return { name: 'local-portfolio-content', configResolved: config => { root = config.root; isBuild = config.command === 'build'; },
    async buildStart() {
      if (!isBuild) return;
      for (const directory of ['cmaps', 'standard_fonts', 'wasm']) {
        for (const filename of await readdir(join(root, 'node_modules/pdfjs-dist', directory))) {
          this.emitFile({ type: 'asset', fileName: `pdf-support/${directory}/${filename}`, source: await readFile(join(root, 'node_modules/pdfjs-dist', directory, filename)) });
        }
      }
    },
    configureServer: server => { server.middlewares.use(handler); },
    configurePreviewServer: server => { server.middlewares.use(handler); } };
}
