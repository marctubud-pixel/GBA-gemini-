import type { ContentDocument, ContentEntry } from '../data/contentTypes';
import type { InteriorId, InteriorModal } from '../game/interiors/types';
import { parseContentDocument } from './contentRepository';

export type PreviewPage = 'panel' | 'detail';
export const PREVIEW_PARAM = 'projectPreview';
const TOKEN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export function getPreviewToken() {
  const value = new URLSearchParams(window.location.search).get(PREVIEW_PARAM);
  return value && TOKEN.test(value) ? value : null;
}
export interface PreviewMessage {
  type: 'portfolio-project-preview'; token: string; document: ContentDocument;
  entryId: string; page: PreviewPage; requestId: string;
}
export function parsePreviewMessage(value: unknown, token: string): PreviewMessage {
  if (!value || typeof value !== 'object') throw new Error('预览内容格式不正确');
  const data = value as Record<string, unknown>;
  if (data.type !== 'portfolio-project-preview' || data.token !== token || !TOKEN.test(token)
    || typeof data.entryId !== 'string' || typeof data.requestId !== 'string' || !TOKEN.test(data.requestId)
    || !['panel', 'detail'].includes(data.page as string)) throw new Error('预览请求不正确');
  const document = parseContentDocument(data.document);
  if (!document.entries.some(entry => entry.id === data.entryId)) throw new Error('预览作品未找到');
  return { ...data, document } as unknown as PreviewMessage;
}
export function previewContext(page: PreviewPage, id: string, requestId: string) { return `preview:${page}:${requestId}:${id}`; }
export function readPreviewContext(context: string | null) {
  const match = /^preview:(panel|detail):[a-f0-9-]{36}:(.+)$/i.exec(context || '');
  return match ? { page: match[1] as PreviewPage, entryId: match[2] } : null;
}
export function previewDestination(entry: ContentEntry): { interior: InteriorId; modal: InteriorModal } | null {
  switch (entry.kind) {
    case 'writing': return { interior: 'print-house', modal: 'write-house' };
    case 'brand': return { interior: 'brand-museum', modal: 'brand-museum' };
    case 'film': return { interior: 'marc-cinema', modal: 'marc-cinema' };
    case 'game-experience': case 'game-project': return { interior: 'arcade', modal: 'arcade' };
    case 'hobby': return { interior: 'my-studio', modal: 'my-hobby' };
    case 'experiment': return { interior: 'experiment-lab', modal: 'experiment-lab' };
    default: return null;
  }
}
