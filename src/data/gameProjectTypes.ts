import type { ContentEntry } from './contentTypes';

export const GAME_PROJECT_TYPES = ['H5', 'Demo', '短片', '互动原型', '游戏'] as const;
export type GameProjectType = typeof GAME_PROJECT_TYPES[number];

export function gameProjectType(entry: ContentEntry): GameProjectType | undefined {
  if (entry.projectType) return entry.projectType;
  const words = [entry.subtitle, entry.description, ...entry.tags].join(' ');
  if (/\bH5\b/i.test(words)) return 'H5';
  if (/\bDemo\b/i.test(words)) return 'Demo';
  if (/短片/.test(words)) return '短片';
  if (/互动原型/.test(words)) return '互动原型';
  return undefined;
}
