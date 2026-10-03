import { parseContentDocument } from '../content/contentRepository';
import type { ContentDocument } from '../data/contentTypes';

export type Snapshot = { revision: string; document: ContentDocument };
export async function adminRequest<T>(path: string, token?: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, { ...init, headers: { ...(token ? { 'X-Admin-Token': token } : {}), ...init.headers } });
  const result = await response.json().catch(() => ({ error: '后台未启动，请用本机服务打开管理页面' }));
  if (!response.ok) throw new Error(result.error || `保存失败 (${response.status})`);
  return result as T;
}
export async function loadSnapshot(token: string): Promise<Snapshot> {
  const result = await adminRequest<Snapshot>('content', token);
  return { revision: result.revision, document: parseContentDocument(result.document) };
}
export async function saveSnapshot(token: string, snapshot: Snapshot, document: ContentDocument): Promise<Snapshot> {
  const valid = parseContentDocument(document);
  return adminRequest('content', token, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revision: snapshot.revision, document: valid }) });
}
export interface UploadResult { id: string; url: string; mime: string; size: number; }
export function uploadFile(file: File, token: string, onProgress: (percent: number) => void): Promise<UploadResult> {
  const max = file.type.startsWith('video/') ? 250 : 50;
  if (file.size > max * 1024 * 1024) return Promise.reject(new Error(`${file.name} 超过 ${max} MB，请压缩后上传`));
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/uploads'); xhr.setRequestHeader('X-Admin-Token', token);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream'); xhr.responseType = 'json';
    xhr.upload.onprogress = event => { if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100)); };
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve(xhr.response) : reject(new Error(xhr.response?.error || '上传失败'));
    xhr.onerror = () => reject(new Error('上传中断，请检查本机后台是否运行'));
    xhr.onabort = () => reject(new Error('上传已取消'));
    xhr.send(file);
  });
}
