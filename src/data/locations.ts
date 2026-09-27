export type ActionType = 'READ' | 'VIEW' | 'WATCH' | 'PLAY' | 'ENTER' | 'LOOK';

export interface WorldLocation {
  id: string;
  name: string;
  subtitle: string;
  zone: 'main-town' | 'interest-area' | 'future-hill';
  x: number; // Building center
  parkingX: number; // Bike parking anchor (snug beside entrance)
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
    id: 'print-house',
    name: 'Print House',
    subtitle: '印刷与叙事字工坊',
    zone: 'main-town',
    x: 1500,
    parkingX: 1465, // Close to entrance
    parkingWidth: 70,
    interactionX: 1500,
    interactionWidth: 70,
    action: 'READ',
    promptText: 'E · READ',
    projectIds: ['writing-01', 'writing-02'],
    bannerColor: '#f58e3f'
  },
  {
    id: 'brand-museum',
    name: 'Brand & Creative Museum',
    subtitle: '品牌与创想美术馆',
    zone: 'main-town',
    x: 2100,
    parkingX: 2065,
    parkingWidth: 70,
    interactionX: 2100,
    interactionWidth: 70,
    action: 'VIEW',
    promptText: 'E · VIEW',
    projectIds: ['brand-01', 'brand-02'],
    bannerColor: '#2e6db4'
  },
  {
    id: 'marc-cinema',
    name: 'Marc Cinema',
    subtitle: '马克电影院 · 影像与叙事空间',
    zone: 'main-town',
    x: 2740,
    parkingX: 2700,
    parkingWidth: 80,
    interactionX: 2740,
    interactionWidth: 80,
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
    parkingX: 3345,
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
    name: 'Arcade',
    subtitle: '快乐街机厅 · 玩心与像素',
    zone: 'interest-area',
    x: 4020,
    parkingX: 3985,
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
    name: 'My Studio',
    subtitle: '个人工作室 · 工作台与日常',
    zone: 'interest-area',
    x: 4660,
    parkingX: 4625,
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
    x: 6900,
    parkingX: 6860,
    parkingWidth: 80,
    interactionX: 6900,
    interactionWidth: 80,
    action: 'LOOK',
    promptText: 'E · LOOK',
    projectIds: ['future-01'],
    bannerColor: '#78c8ec'
  }
];
