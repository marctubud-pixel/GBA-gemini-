export type ActionType = 'READ' | 'VIEW' | 'WATCH' | 'PLAY' | 'ENTER' | 'LOOK';

export interface WorldLocation {
  id: string;
  name: string;
  subtitle: string;
  zone: 'main-town' | 'interest-area' | 'future-hill';
  x: number; // Building center
  parkingX: number; // Bike parking anchor (at building side)
  parkingWidth: number; // Width of parking zone
  interactionX: number; // Point to press E to interact
  interactionWidth: number; // Active zone width
  action: ActionType;
  promptText: string;
  projectIds: string[];
  bannerColor: string;
}

export const WORLD_LOCATIONS: WorldLocation[] = [
  {
    id: 'entrance',
    name: '01 Entrance',
    subtitle: '海边入口 · The Journey Begins',
    zone: 'main-town',
    x: 300,
    parkingX: 200,
    parkingWidth: 70,
    interactionX: 300,
    interactionWidth: 80,
    action: 'LOOK',
    promptText: 'E · LOOK',
    projectIds: ['entrance-manifesto'],
    bannerColor: '#38bdf8'
  },
  {
    id: 'central-plaza',
    name: '02 Central Plaza',
    subtitle: '中央广场 · Heart of Town',
    zone: 'main-town',
    x: 900,
    parkingX: 790,
    parkingWidth: 70,
    interactionX: 900,
    interactionWidth: 80,
    action: 'VIEW',
    promptText: 'E · VIEW',
    projectIds: ['plaza-guide'],
    bannerColor: '#f58e3f'
  },
  {
    id: 'print-house',
    name: 'Write House',
    subtitle: 'Words Make a Brighter Tomorrow · 文案与叙事字工坊',
    zone: 'main-town',
    x: 1500,
    parkingX: 1420, // Roadside anchor to the left of the building
    parkingWidth: 70,
    interactionX: 1500,
    interactionWidth: 80,
    action: 'ENTER',
    promptText: 'ENTER',
    projectIds: ['writing-01', 'writing-02'],
    bannerColor: '#0284c7'
  },
  {
    id: 'brand-museum',
    name: 'Brand & Visual',
    subtitle: '让品牌具象化 · 品牌与视觉展厅',
    zone: 'main-town',
    x: 2100,
    parkingX: 2020, // Left open courtyard anchor
    parkingWidth: 70,
    interactionX: 2100,
    interactionWidth: 80,
    action: 'VIEW',
    promptText: 'E · VIEW',
    projectIds: ['brand-01', 'brand-02'],
    bannerColor: '#2e6db4'
  },
  {
    id: 'marc-cinema',
    name: 'Marc Cinema',
    subtitle: '海岸放映厅 · 影像与叙事空间',
    zone: 'main-town',
    x: 2740,
    parkingX: 2630,
    parkingWidth: 90,
    interactionX: 2740,
    interactionWidth: 90,
    action: 'WATCH',
    promptText: 'E · WATCH',
    projectIds: ['film-01', 'film-02', 'film-03'],
    bannerColor: '#ef6453'
  },
  {
    id: 'experiment-lab',
    name: 'Experiment Lab',
    subtitle: '原型与交互实验工坊',
    zone: 'main-town',
    x: 3380,
    parkingX: 3270,
    parkingWidth: 70,
    interactionX: 3380,
    interactionWidth: 70,
    action: 'PLAY',
    promptText: 'E · PLAY',
    projectIds: ['game-01', 'ai-01'],
    bannerColor: '#52a869'
  },
  {
    id: 'arcade',
    name: 'My Game',
    subtitle: '快乐街机厅 · 游戏经历与玩家档案',
    zone: 'interest-area',
    x: 4020,
    parkingX: 3910,
    parkingWidth: 70,
    interactionX: 4020,
    interactionWidth: 70,
    action: 'PLAY',
    promptText: 'E · PLAY',
    projectIds: ['arcade-01'],
    bannerColor: '#ef6453'
  },
  {
    id: 'my-studio',
    name: 'My Hobby',
    subtitle: 'Hobby Studio · 个人爱好与灵感工坊',
    zone: 'interest-area',
    x: 4660,
    parkingX: 4550,
    parkingWidth: 70,
    interactionX: 4660,
    interactionWidth: 70,
    action: 'ENTER',
    promptText: 'E · ENTER',
    projectIds: ['studio-profile'],
    bannerColor: '#2a8b9f'
  },
  {
    id: 'observatory',
    name: 'Observatory',
    subtitle: '未来之丘 · 星穹天文台',
    zone: 'future-hill',
    x: 5900,
    parkingX: 5790,
    parkingWidth: 80,
    interactionX: 5900,
    interactionWidth: 80,
    action: 'LOOK',
    promptText: 'E · LOOK',
    projectIds: ['future-01'],
    bannerColor: '#78c8ec'
  }
];
