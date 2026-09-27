export type ActionType = 'READ' | 'VIEW' | 'WATCH' | 'PLAY' | 'ENTER' | 'LOOK';

export interface WorldLocation {
  id: string;
  name: string;
  subtitle: string;
  zone: 'main-town' | 'interest-area' | 'future-hill';
  x: number; // Building center
  parkingX: number; // Bike parking anchor
  parkingWidth: number; // Width of parking zone (triggering E · PARK)
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
    x: 2650,
    parkingX: 2520,
    parkingWidth: 100,
    interactionX: 2650,
    interactionWidth: 90,
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
    x: 3800,
    parkingX: 3660,
    parkingWidth: 100,
    interactionX: 3800,
    interactionWidth: 90,
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
    x: 5050,
    parkingX: 4880,
    parkingWidth: 110,
    interactionX: 5050,
    interactionWidth: 100,
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
    x: 6250,
    parkingX: 6100,
    parkingWidth: 100,
    interactionX: 6250,
    interactionWidth: 90,
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
    x: 7350,
    parkingX: 7200,
    parkingWidth: 100,
    interactionX: 7350,
    interactionWidth: 90,
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
    x: 8450,
    parkingX: 8300,
    parkingWidth: 100,
    interactionX: 8450,
    interactionWidth: 90,
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
    x: 11400,
    parkingX: 11220,
    parkingWidth: 110,
    interactionX: 11400,
    interactionWidth: 100,
    action: 'LOOK',
    promptText: 'E · LOOK',
    projectIds: ['future-01'],
    bannerColor: '#78c8ec'
  }
];
