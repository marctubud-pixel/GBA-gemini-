export interface WorldSegment {
  id: string;
  name: string;
  subname: string;
  startX: number;
  endX: number;
  backgroundTheme: 'coastal-start' | 'town-center' | 'town-dense' | 'creative-block' | 'cinema-strip' | 'lab-quarter' | 'arcade-corner' | 'studio-green' | 'hill-uphill' | 'observatory-summit';
  assetSet: string[];
  locationId?: string;
  slope?: number; // 0: flat, > 0: uphill slope factor
  elevationStart?: number; // Y offset baseline
  elevationEnd?: number; // Y offset at end
  description: string;
}

export const WORLD_SEGMENTS: WorldSegment[] = [
  {
    id: 'entrance',
    name: '01 ENTRANCE',
    subname: '海边入口 · The Journey Begins',
    startX: 0,
    endX: 1000,
    backgroundTheme: 'coastal-start',
    assetSet: ['sea', 'low-wall', 'flowers', 'my-world-sign', 'bike-path'],
    slope: 0,
    elevationStart: 0,
    elevationEnd: 0,
    description: '碧海与微风相迎的小镇起点，竖立着“MY WORLD: RIDE · EXPLORE · CREATE”入口木牌与护栏。'
  },
  {
    id: 'central-plaza',
    name: '02 CENTRAL PLAZA',
    subname: '中央广场 · Heart of Town',
    startX: 1000,
    endX: 2100,
    backgroundTheme: 'town-center',
    assetSet: ['fountain', 'benches', 'clock-tower', 'direction-board', 'trees'],
    slope: 0,
    elevationStart: 0,
    elevationEnd: 0,
    description: '开阔的市民休闲广场，拥有喷泉、大钟楼与指路牌，提示通往各创作街区的方向。'
  },
  {
    id: 'print-house',
    name: '03 PRINT HOUSE',
    subname: '印刷与字像所 · Narrative & Editorial',
    startX: 2100,
    endX: 3200,
    backgroundTheme: 'town-dense',
    assetSet: ['print-shop-facade', 'poster-rack', 'books-window', 'cream-wall'],
    locationId: 'print-house',
    slope: 0,
    elevationStart: 0,
    elevationEnd: 0,
    description: '小型手作印刷与文案工坊，窗明几净，展示书籍排版、叙事剧本与文字创意成果。'
  },
  {
    id: 'brand-museum',
    name: '04 BRAND & CREATIVE MUSEUM',
    subname: '品牌创意馆 · Strategy & Campaign',
    startX: 3200,
    endX: 4400,
    backgroundTheme: 'creative-block',
    assetSet: ['gallery-facade', 'modern-window', 'curated-posters', 'sculpture'],
    locationId: 'brand-museum',
    slope: 0,
    elevationStart: 0,
    elevationEnd: 0,
    description: '现代风格小型展馆，呈现策略推演、品牌重塑以及整合营销传播的核心案卷。'
  },
  {
    id: 'marc-cinema',
    name: '05 MARC CINEMA',
    subname: '马克影院 · Visual Storytelling & Film',
    startX: 4400,
    endX: 5700,
    backgroundTheme: 'cinema-strip',
    assetSet: ['cinema-hero', 'marquee', 'poster-boxes', 'awning', 'lamps'],
    locationId: 'marc-cinema',
    slope: 0,
    elevationStart: 0,
    elevationEnd: 0,
    description: '整座小镇最醒目的地标建筑！亮眼复古顶冠、霓虹灯影院招牌、海报灯箱与大落地影院门厅。'
  },
  {
    id: 'experiment-lab',
    name: '06 EXPERIMENT LAB',
    subname: '灵感实验坊 · Interaction & AI Prototypes',
    startX: 5700,
    endX: 6800,
    backgroundTheme: 'lab-quarter',
    assetSet: ['lab-facade', 'pipes', 'workshop-door', 'exp-sign', 'gadgets'],
    locationId: 'experiment-lab',
    slope: 0,
    elevationStart: 0,
    elevationEnd: 0,
    description: '充满创客生机的轻工业风工作室，摆放着各种代码实验原型、AI 工具流实验与交互硬件。'
  },
  {
    id: 'arcade',
    name: '07 ARCADE',
    subname: '街机厅 · Play & Memories',
    startX: 6800,
    endX: 7900,
    backgroundTheme: 'arcade-corner',
    assetSet: ['arcade-blue-facade', 'arcade-sign', 'vending-machine', 'game-posters'],
    locationId: 'arcade',
    slope: 0,
    elevationStart: 0,
    elevationEnd: 0,
    description: '克莱因蓝外墙与复古招牌的像素街机厅，充满怀旧玩具与纯粹乐趣，连接童年记忆。'
  },
  {
    id: 'my-studio',
    name: '08 MY STUDIO',
    subname: '个人画室与工坊 · Personal Studio',
    startX: 7900,
    endX: 9000,
    backgroundTheme: 'studio-green',
    assetSet: ['studio-facade', 'plants', 'window-desk', 'camera-tripod', 'bookshelf'],
    locationId: 'my-studio',
    slope: 0,
    elevationStart: 0,
    elevationEnd: 0,
    description: '绿植缠绕的私人工坊，放着摄影器材、唱片架与手稿桌，记录平日真实的创作生活。'
  },
  {
    id: 'future-hill',
    name: '09 FUTURE HILL',
    subname: '向阳之坡 · Uphill Road',
    startX: 9000,
    endX: 10800,
    backgroundTheme: 'hill-uphill',
    assetSet: ['stone-retaining-wall', 'mountain-guardrail', 'cypress-trees', 'wildflowers', 'slope-road'],
    slope: 0.25, // uphill slope grade
    elevationStart: 0,
    elevationEnd: 160, // rises 160px over 1800px width
    description: '持续延伸向右上方的海边盘山路，建筑物逐渐退去，石墙、野花与松柏相伴，坡度逐渐升高。'
  },
  {
    id: 'observatory',
    name: '10 OBSERVATORY',
    subname: '星穹天文台 · The Summit & Horizons',
    startX: 10800,
    endX: 12000,
    backgroundTheme: 'observatory-summit',
    assetSet: ['observatory-dome', 'telescope', 'lookout-fence', 'vast-sky'],
    locationId: 'observatory',
    slope: 0,
    elevationStart: 160,
    elevationEnd: 160, // summit plateau
    description: '屹立于最高坡顶的白色圆顶天文台与观景台，背靠广阔无际的天空与大海，望向未来的可能性。'
  }
];

export const TOTAL_WORLD_WIDTH = 12000;
export const WORLD_BASE_Y = 270; // ground baseline in 640x360 logic resolution
