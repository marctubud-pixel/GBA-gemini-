export interface PortfolioProject {
  id: string;
  locationId: string;
  title: string;
  subtitle: string;
  category: string;
  date: string;
  oneLiner: string;
  context: string;
  problem: string;
  insight: string;
  strategy: string;
  idea: string;
  execution: string;
  myRole: string;
  tools: string[];
  collaborators?: string[];
  result: string;
  coverImage?: string;
  gallery?: {
    caption: string;
    description?: string;
    url?: string;
    type?: 'image' | 'video' | 'code';
  }[];
  externalLink?: {
    label: string;
    url: string;
  };
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'film-01',
    locationId: 'marc-cinema',
    title: 'Good Stories Brighter People',
    subtitle: '年度品牌情感叙事微电影 & AI 概念镜头设计',
    category: 'Film & Visual Storytelling',
    date: '2025.12',
    oneLiner: '通过探索移动影像、人与光影构筑更开阔明亮的情感叙事世界。',
    context: '在新科技浪潮加速冲刷个体日常的当下，创作者与大众对“未来的温度”产生深刻共情渴望。',
    problem: '传统商业宣传片容易流于冰冷的功能陈列或空洞的宏大叙事，无法建立深层情感认同。',
    insight: '最打动人心的不是科技本身的精密，而是人们在科技映照下依然保有的纯真、好奇与骑向远方的勇气。',
    strategy: '以“骑行者探索海边世界”为视觉隐喻，结合实景摄影与 AI 生成的概念意象，打破虚实界限。',
    idea: '“Ride Further, Create Brighter.” — 每一段踩踏脚踏板的旅程，都是对可能性的好奇探索。',
    execution: '统筹分镜、色彩脚本与美术基调，采用柔和午后光影（Soft Afternoon Light）配合深蓝海水与象牙白建筑，形成独具辨识度的视觉语言。',
    myRole: 'Director, Narrative Concept & AI Visual Pipeline',
    tools: ['Midjourney v6', 'Runway Gen-3', 'DaVinci Resolve', 'Premiere Pro', 'Figma'],
    collaborators: ['Sound Designer: Echo Studio', 'Colorist: Studio M'],
    result: '作品在社交平台与设计圈获得广泛自发传播，全网播放量突破 120W+，被多所高校创意社群推荐为跨媒介叙事案例。'
  },
  {
    id: 'film-02',
    locationId: 'marc-cinema',
    title: 'The Seaside Observatory',
    subtitle: '科幻微纪录短片 · 追逐远方星光的守望者',
    category: 'Film & Visual Storytelling',
    date: '2025.08',
    oneLiner: '当小镇少年与山顶的天文台望远镜相遇，探索欲成为终生的精神锚点。',
    context: '作为个人电影三部曲的第二部，深入挖掘海边山城与天文台的地理意象。',
    problem: '如何用短片体量呈现出长篇电影级的情感张力与世界观厚度？',
    insight: '用物体作为记忆容器：一辆老旧自行车、一本磨破边的星图手记、一座斑驳的穹顶。',
    strategy: '以低对白、强氛围的声音设计与沉浸式镜头运动，引导观众跟随视线缓缓上坡。',
    idea: '即使世界再大，每一个抬头仰望星空的人都在共享同一片苍穹。',
    execution: '采用 2.39:1 宽荧幕构图，结合手绘纹理与定格动画质感的 AI 帧渲染，打造现代与复古交织的质感。',
    myRole: 'Writer, Director & Editor',
    tools: ['Blender 4.0', 'After Effects', 'AI Upscaling', 'Logic Pro'],
    result: '入选 2025 独立青年影像周展映单元，获得“最佳视觉概念奖”。'
  },
  {
    id: 'film-03',
    locationId: 'marc-cinema',
    title: 'Neon Arcade Memories',
    subtitle: '赛博怀旧实验短片 · 游戏卡带里的夏天',
    category: 'Film & Visual Storytelling',
    date: '2025.04',
    oneLiner: '把童年街机厅投币声与夏日蝉鸣编织成视听交响诗。',
    context: '数字原生代对复古介质（如 GBA、磁带、街机机台）的触感式怀恋。',
    problem: '避免简单贴标签式的复古拼贴，需要发掘深层的童年情绪价值。',
    insight: '游戏的意义从来不只是分数，而是并肩站立在投币机前的伙伴与微汗的掌心。',
    strategy: '混合实拍与逐帧像素动画，声音采集大量街机原版 FM 音源。',
    idea: 'INSERT COIN TO CONTINUE — 人生亦是一场无限续币的探险。',
    execution: '设计了 12 套原创像素街机海报与动画过场，作为短片内的核心叙事线索。',
    myRole: 'Creative Director & Pixel Animator',
    tools: ['Aseprite', 'Photoshop', 'Final Cut Pro'],
    result: '在 Bilibili 获得 25W+ 播放与 3000+ 弹幕互动。'
  },
  {
    id: 'writing-01',
    locationId: 'print-house',
    title: '海边字像志：文案与叙事手册',
    subtitle: '品牌核心文案集、微型小说与概念提案手稿',
    category: 'Writing & Narrative',
    date: '2025.10',
    oneLiner: '用最克制干净的文字，击中复杂喧嚣中最柔软的那根心弦。',
    context: '在注意力被碎片化收割的时代，好文字依然具备穿透周期的力量。',
    problem: '商业文案普遍陷入套路同质化，缺少真诚呼吸感。',
    insight: '读者并不需要居高临下的说教，他们需要被看见、被理解、被唤醒。',
    strategy: '提出“呼吸感文字”（Breathable Copywriting）原则：留白、具象细节、明亮动词、节奏声律。',
    idea: '文字是给眼睛听的音乐，是思想投掷在纸页上的长影子。',
    execution: '为 8 个创意项目撰写全套品牌纲领、Slogan、长文案与微型剧本，排版采用考究的手作印刷排字网格。',
    myRole: 'Copywriter, Author & Editorial Layout',
    tools: ['InDesign', 'Typora / Markdown', 'Figma'],
    result: '实体小册限量印制 500 本，在独立书店展出并于 3 天内赠阅告罄。'
  },
  {
    id: 'writing-02',
    locationId: 'print-house',
    title: 'MY WORLD: 互动叙事设计手记',
    subtitle: '从平面作品集到可骑行世界的游戏世界观设定集',
    category: 'Writing & Narrative',
    date: '2026.01',
    oneLiner: '详细拆解游戏化作品集如何通过空间叙事传递个人身份认同。',
    context: '探索个人作品集的终极形态：它如何不仅是 PDF 简历，而是一件活着的可玩作品。',
    problem: '传统网站的扁平链接无法传递创作者的完整心境与审美体系。',
    insight: '骑行是一种绝妙的节奏媒介：慢速、自由、伴随风景展开、有物理的踩踏前进感。',
    strategy: '用“What can I make → What shapes me → Where am I going”构筑三幕式横轴旅程。',
    idea: '把每一个技能节点做成一座有温度的临海建筑。',
    execution: '完成了超过 3 万字的世界观设定、NPC 行为白皮书与区域美术语言圣经。',
    myRole: 'Worldbuilder & Narrative Designer',
    tools: ['Notion', 'Markdown', 'Obsidian'],
    result: '即为您正在游历探索的这个世界的完整设计基石！'
  },
  {
    id: 'brand-01',
    locationId: 'brand-museum',
    title: 'Coastal Nomad: 户外轻骑生活方式品牌',
    subtitle: '全案品牌策略定位、VI 视觉识别与整合营销传播',
    category: 'Brand & Creative Strategy',
    date: '2025.06',
    oneLiner: '重新定义城市与自然的边界，为新一代年轻骑行者提供轻盈自由的生活提案。',
    context: '城市轻户外与通勤骑行热潮兴起，但市场上品牌多偏向硬核竞速或纯机能主义。',
    problem: '缺乏一个既具有日常美学、又具备文化归属感的情感向骑行生活方式品牌。',
    insight: '骑行对于年轻人而言不是“比赛拿冠军”，而是“下班后吹吹海风的喘息时刻”。',
    strategy: '定位“阳光、清新、轻便、乐观”，主打莫兰迪灰蓝与暖白为主色的清爽视觉体系。',
    idea: '“The Wind Knows Where You Belong.”（风知道你的归途）',
    execution: '打造从 Logo、色彩体系、包材、车身涂装、App UI 到快闪店空间的完整品牌体验。',
    myRole: 'Brand Strategist & Creative Director',
    tools: ['Figma', 'Illustrator', 'Cinema 4D', 'Keynote'],
    result: '品牌上线首季即完成首轮天使投资，首批联名骑行包售出 15,000+ 件。'
  },
  {
    id: 'brand-02',
    locationId: 'brand-museum',
    title: 'Studio Lumos 创意实验室品牌重塑',
    subtitle: '跨媒介数字艺术团队的品牌架构升级与视觉革新',
    category: 'Brand & Creative Strategy',
    date: '2024.11',
    oneLiner: '打破传统设计工作室边界，以“光与算法”重塑品牌符号。',
    context: '设计工作室由传统平面转型为集生成艺术、WebGL、AI 影像于一体的综合团队。',
    problem: '原有品牌形象过于拘谨，无法体现前沿技术探索的先锋感。',
    insight: '科技的冷感需要艺术的情感来中和，光（Lumos）是最具生命力的媒介。',
    strategy: '引入动态生成式视觉识别系统（Generative Identity），让 Logo 会随时间与声音呼吸波动。',
    idea: '“Light Up The Unknown.”',
    execution: '编写 WebGL 交互 Logo 生成器，设计全套名片、提案模板与展厅导视系统。',
    myRole: 'Lead Brand Designer',
    tools: ['Processing', 'Three.js', 'Figma', 'Illustrator'],
    result: '斩获多项国际设计大奖提名，成功吸引包括 Apple、Sony 在内的商业客户合作。'
  },
  {
    id: 'game-01',
    locationId: 'experiment-lab',
    title: 'GBA Pixel Town: 横版平台探索引擎原型',
    subtitle: '基于 Phaser 3 + TypeScript 的轻量复古物理探索框架',
    category: 'Game & Interaction Prototype',
    date: '2026.02',
    oneLiner: '在 640x360 逻辑分辨率下复刻 GBA 黄金时代的像素温润触感。',
    context: '如何用现代 Web 栈开发具备极致复古手感与轻盈体积的网页端微型游戏？',
    problem: '现代 Web 框架容易臃肿，过重的物理引擎导致手感松散且加载缓慢。',
    insight: '像素游戏的核心魅力在于“精确而克制的像素簇”、“匀速与缓动的舒适平衡”。',
    strategy: '自主封装 Arcade 自行车加速度/减速度控制器与上坡 Slope Speed Modifier。',
    idea: '把 Phaser 的高性能画布与 React 现代响应式 DOM 无缝桥接。',
    execution: '实现像素级最近邻放大（Nearest Neighbor）、平滑侧滚跟随相机（Side-Scroll Look-ahead Camera）与分区懒加载。',
    myRole: 'Lead Game Developer',
    tools: ['Phaser 3', 'TypeScript', 'React', 'Zustand', 'Vite'],
    result: '首屏加载小于 1.5MB，60FPS 满帧运行，零掉帧体验。'
  },
  {
    id: 'ai-01',
    locationId: 'experiment-lab',
    title: 'AI 像素资产工作流与自动切片工具',
    subtitle: '基于扩散模型与算法修边的一体化像素精灵图生产管线',
    category: 'Game & Interaction Prototype',
    date: '2025.11',
    oneLiner: '让独立创作者拥有一个小型像素美术工作室的生产力。',
    context: '独立开发往往受制于庞大的场景资产绘制工作量。',
    problem: '纯 AI 生成像素图容易出现杂色点、色块不均、无网格对齐等“假像素”瑕疵。',
    insight: 'AI 负责造型与光影草图，算法负责调色板映射与像素网格量化，手工负责关键帧微调。',
    strategy: '搭建 Python 脚本 + ComfyUI 节点，自动去除抗锯齿并限色至 16/32 色 GBA 调色板。',
    idea: '“AI as Apprentice, Human as Master.”',
    execution: '成功批量化生产本主页中的上百个场景 Tile、建筑立面、海报与植被道具。',
    myRole: 'Tools Engineer & Technical Artist',
    tools: ['Python', 'ComfyUI', 'OpenCV', 'Aseprite Scripting'],
    result: '资产制作周期缩短 70%，且完全保持手绘像素的纯净质感。'
  },
  {
    id: 'arcade-01',
    locationId: 'arcade',
    title: 'Pixel Mini-Games 趣味复古小游戏集',
    subtitle: '自行车计时冲刺、投币打砖块与像素抓娃娃机',
    category: 'Play & Memories',
    date: '2025.07',
    oneLiner: '把童年最快乐的 100 种微小瞬间放进一个投币街机箱。',
    context: '探寻玩心与交互设计的本质：为什么简单的机制能带来巨大的快乐？',
    problem: '现代游戏动辄追求 3A 画面，却常丢失了最纯粹的即时反馈快感。',
    insight: '清晰的视听奖励反馈（Screen Flash、8-bit 音效、精准抖动）是乐趣的放大器。',
    strategy: '设计 3 个可在 30 秒内上手并带来欢笑的 Micro-Games。',
    idea: '“Never lose your inner child.”',
    execution: '采用纯 JavaScript 逻辑与轻量 Web Audio API 合成音效，即点即玩。',
    myRole: 'Game Designer & Developer',
    tools: ['Canvas 2D', 'Web Audio API', 'TypeScript'],
    result: '在朋友群测中达成平均单人游玩 18 次的高粘性。'
  },
  {
    id: 'studio-profile',
    locationId: 'my-studio',
    title: '关于创作者 (Marc) · 工作流与日常',
    subtitle: '桌面上的一杯冷萃、一卷胶片与一整排折叠单车手办',
    category: 'About & Daily Studio',
    date: 'Now',
    oneLiner: '这里是灵感发生的地方，记录着生活塑造我的那些细碎事物。',
    context: '了解一个创作者，最好的方式是看看他的书架、他的相机与他每天骑行的路线。',
    problem: '简历是冰冷的列表，无法展示真实的人格与生活态度。',
    insight: '创作是生活方式的溢出。你读过的书、看过的海、骑过的路，都会流淌进你的作品中。',
    strategy: '以工作台第一视角，陈列个人摄影选辑、年度阅读清单、音乐胶片与装备库。',
    idea: '生活本身就是最长的一件作品。',
    execution: '整理了过去 3 年的海边胶片记录与个人工作哲学问答。',
    myRole: 'The Creator',
    tools: ['Ricoh GR IIIx', 'Leica M6', 'Notion', 'Coffee Beans'],
    result: '欢迎常来坐坐！如果对任何项目感兴趣，欢迎通过邮箱或社交媒体联络我。'
  },
  {
    id: 'future-01',
    locationId: 'observatory',
    title: '星穹与远景：Next Projects & Long-term Horizons',
    subtitle: '面向未来的探索清单 · What I Am Learning & Building',
    category: 'Future Horizons',
    date: '2026+',
    oneLiner: '站在坡顶看海，所有的路都在前方舒展。',
    context: '到达 Observatory 不是终点，而是望向下一个可能性的起点。',
    problem: '如何在作品集中不仅展示过去，更表达对未来的野心与学习路径？',
    insight: '好的合作伙伴关注的不仅是你过去做过什么，更是你明天能一起创造什么。',
    strategy: '公开个人未来 1-2 年的研发目标：空间计算（Vision Pro / WebXR）、自主 Agent 协同创作系统、以及一部完整的独立叙事像素游戏。',
    idea: '“Same Sky. A Brighter You.”',
    execution: '定期更新学习路线图与实验中 Demo 仓库链接。',
    myRole: 'Explorer & Lifelong Learner',
    tools: ['Curiosity', 'Persistence', 'Open Source', 'Coffee'],
    result: '旅程才刚刚开始。感谢你的骑行与探索！'
  }
];
