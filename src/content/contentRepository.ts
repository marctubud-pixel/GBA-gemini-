import type { ContentDocument, ContentEntry, ContentRepository, MediaAsset } from '../data/contentTypes';

const KINDS = new Set(['writing', 'brand', 'film', 'game-experience', 'game-project', 'hobby', 'general']);

export function isContentUrl(value: unknown): value is string {
  return typeof value === 'string' && /^(https?:\/\/[^\s]+|\/(?!\/)[^\s]*|\.\/[^\s]+)$/.test(value);
}

function optionalStringsAreValid(value: Record<string, unknown>, fields: string[]) {
  return fields.every(field => value[field] === undefined || typeof value[field] === 'string');
}

function mediaIsValid(asset: unknown): asset is MediaAsset {
  if (!asset || typeof asset !== 'object') return false;
  const a = asset as Record<string, unknown>;
  return typeof a.id === 'string' && !!a.id && (a.type === 'image' || a.type === 'video')
    && isContentUrl(a.url) && optionalStringsAreValid(a, ['caption', 'alt'])
    && (a.poster === undefined || isContentUrl(a.poster));
}

export function parseContentDocument(value: unknown): ContentDocument {
  if (!value || typeof value !== 'object') throw new Error('内容文件不是有效对象');
  const doc = value as Record<string, unknown>;
  if (doc.version !== 1 || !Array.isArray(doc.entries)) throw new Error('内容文件版本或 entries 字段不正确');
  const ids = new Set<string>();
  const entries = doc.entries.map((value: unknown) => {
    if (!value || typeof value !== 'object') throw new Error('存在无效作品条目');
    const entry = value as Record<string, unknown>;
    if (typeof entry.id !== 'string' || !entry.id || ids.has(entry.id)
      || typeof entry.kind !== 'string' || !KINDS.has(entry.kind)
      || typeof entry.category !== 'string' || typeof entry.title !== 'string'
      || typeof entry.description !== 'string' || !Array.isArray(entry.media)
      || !entry.media.every(mediaIsValid) || !Array.isArray(entry.tags)
      || !entry.tags.every(tag => typeof tag === 'string')) throw new Error('作品字段不完整或 ID 重复');
    if (entry.cover !== undefined && !mediaIsValid(entry.cover)) throw new Error('作品封面格式不正确');
    if (!optionalStringsAreValid(entry, ['subtitle', 'body', 'date', 'duration', 'englishTitle', 'locationId'])
      || (entry.hours !== undefined && (typeof entry.hours !== 'number' || !Number.isFinite(entry.hours) || entry.hours < 0))
      || (entry.demoUrl !== undefined && !isContentUrl(entry.demoUrl))
      || (entry.section !== undefined && !['IDEA', 'WORDS', 'LIFE'].includes(entry.section as string))
      || (entry.isSample !== undefined && typeof entry.isSample !== 'boolean')
      || (entry.caseStudy !== undefined && (!Array.isArray(entry.caseStudy) || !entry.caseStudy.every(section =>
        section && typeof section === 'object' && typeof section.heading === 'string' && typeof section.text === 'string')))) {
      throw new Error('作品的可选字段格式不正确');
    }
    ids.add(entry.id);
    return entry as unknown as ContentEntry;
  });
  return { version: 1, entries };
}

export class HttpContentRepository implements ContentRepository {
  constructor(private readonly url: string) {}
  async load(signal?: AbortSignal): Promise<ContentDocument> {
    const response = await fetch(this.url, { signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`内容接口返回 ${response.status}`);
    return parseContentDocument(await response.json());
  }
}
