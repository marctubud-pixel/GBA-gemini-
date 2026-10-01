import drawWriting from './writing';
import drawCinema from './cinema';
import drawBrand from './brand';
import drawArcade from './arcade';
import drawHobby from './hobby';
import drawLab from './newlab';
import type { InteriorDefinition, InteriorId } from './types';

/** Interaction coordinates share the same space as the approved procedural art. */
export const INTERIORS: Record<InteriorId, InteriorDefinition> = {
  'print-house': {
    name: '文案工坊',
    draw: drawWriting,
    interactions: [{ x: 480, radius: 65, prompt: '阅读文案作品', modal: 'write-house', bounds: { x: 450, y: 221, width: 70, height: 21 } }],
  },
  'brand-museum': {
    name: '品牌创意馆',
    draw: drawBrand,
    interactions: [{ x: 476, radius: 65, prompt: '查看品牌与视觉作品', modal: 'brand-museum', bounds: { x: 426, y: 226, width: 109, height: 34 } }],
  },
  'marc-cinema': {
    name: '影像放映室',
    draw: drawCinema,
    interactions: [{ x: 480, radius: 70, prompt: '观看影像作品', modal: 'marc-cinema', bounds: { x: 314, y: 70, width: 347, height: 113 } }],
  },
  arcade: {
    name: '游戏厅',
    draw: drawArcade,
    interactions: [
      { x: 246, radius: 48, prompt: '查看我的游戏历程', modal: 'arcade', context: 'journey', bounds: { x: 225, y: 182, width: 42, height: 78 } },
      { x: 410, radius: 48, prompt: '查看游戏制作', modal: 'arcade', context: 'making', bounds: { x: 389, y: 182, width: 42, height: 78 } },
    ],
  },
  'my-studio': {
    name: '个人兴趣工作室',
    draw: drawHobby,
    interactions: [
      { x: 132, radius: 43, prompt: '查看摄影记录', modal: 'my-hobby', context: 'photo', bounds: { x: 98, y: 217, width: 70, height: 43 } },
      { x: 270, radius: 38, prompt: '翻阅阅读书架', modal: 'my-hobby', context: 'reading', bounds: { x: 218, y: 67, width: 99, height: 177 } },
      { x: 547, radius: 42, prompt: '查看黑胶与音乐', modal: 'my-hobby', context: 'vinyl', bounds: { x: 515, y: 213, width: 63, height: 47 } },
      { x: 745, radius: 42, prompt: '查看骑行记录', modal: 'my-hobby', context: 'cycling', bounds: { x: 694, y: 207, width: 85, height: 54 } },
      { x: 910, radius: 35, prompt: '查看游戏收藏', modal: 'my-hobby', context: 'games', bounds: { x: 867, y: 91, width: 68, height: 157 } },
    ],
  },
  'experiment-lab': {
    name: '交互实验室',
    draw: drawLab,
    interactions: [{ x: 480, radius: 65, prompt: '查看实验与开发日志', modal: 'experiment-lab', bounds: { x: 456, y: 212, width: 58, height: 28 } }],
  },
};

export function nearestInteriorInteraction(id: InteriorId, playerX: number) {
  return INTERIORS[id].interactions
    .filter((point) => Math.abs(playerX - point.x) <= point.radius)
    .sort((a, b) => Math.abs(playerX - a.x) - Math.abs(playerX - b.x))[0] ?? null;
}
