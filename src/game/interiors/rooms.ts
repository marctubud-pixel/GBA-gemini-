import drawWriting from './writing';
import drawCinema from './cinema';
import drawBrand from './brand';
import drawArcade from './arcade';
import drawHobby from './hobby';
import type { InteriorDefinition, InteriorId } from './types';

/** Interaction coordinates share the same space as the approved procedural art. */
export const INTERIORS: Record<InteriorId, InteriorDefinition> = {
  'print-house': {
    name: '文案工坊',
    draw: drawWriting,
    interactions: [{ x: 480, radius: 65, prompt: '阅读文案作品', modal: 'write-house' }],
  },
  'brand-museum': {
    name: '品牌创意馆',
    draw: drawBrand,
    interactions: [{ x: 476, radius: 65, prompt: '查看品牌与视觉作品', modal: 'brand-museum' }],
  },
  'marc-cinema': {
    name: '影像放映室',
    draw: drawCinema,
    interactions: [{ x: 480, radius: 70, prompt: '观看影像作品', modal: 'marc-cinema' }],
  },
  arcade: {
    name: '游戏厅',
    draw: drawArcade,
    interactions: [
      { x: 246, radius: 48, prompt: '查看我的游戏历程', modal: 'arcade', context: 'journey' },
      { x: 410, radius: 48, prompt: '查看游戏制作', modal: 'arcade', context: 'making' },
    ],
  },
  'my-studio': {
    name: '个人兴趣工作室',
    draw: drawHobby,
    interactions: [
      { x: 132, radius: 43, prompt: '查看摄影记录', modal: 'my-hobby', context: 'photo' },
      { x: 270, radius: 38, prompt: '翻阅阅读书架', modal: 'my-hobby', context: 'reading' },
      { x: 552, radius: 42, prompt: '查看黑胶与音乐', modal: 'my-hobby', context: 'vinyl' },
      { x: 745, radius: 42, prompt: '查看骑行记录', modal: 'my-hobby', context: 'cycling' },
      { x: 910, radius: 35, prompt: '查看游戏收藏', modal: 'my-hobby', context: 'games' },
    ],
  },
};

export function nearestInteriorInteraction(id: InteriorId, playerX: number) {
  return INTERIORS[id].interactions
    .filter((point) => Math.abs(playerX - point.x) <= point.radius)
    .sort((a, b) => Math.abs(playerX - a.x) - Math.abs(playerX - b.x))[0] ?? null;
}
