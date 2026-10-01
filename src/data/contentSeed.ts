import { COPYWRITING_WORKS } from './copywritingProjects';
import { PORTFOLIO_PROJECTS, type PortfolioProject } from './projects';
import type { ContentEntry, ContentKind } from './contentTypes';

export function projectToContentEntry(project: PortfolioProject): ContentEntry {
  const kind: ContentKind = project.locationId === 'marc-cinema' ? 'film'
    : project.locationId === 'brand-museum' ? 'brand'
    : project.locationId === 'print-house' ? 'writing' : 'general';
  return {
    id: project.id, kind, category: project.category, title: project.title,
    subtitle: project.subtitle, description: project.oneLiner, date: project.date,
    body: project.execution, locationId: project.locationId, tags: project.tools,
    section: kind === 'writing' ? 'IDEA' : undefined, isSample: true,
    cover: project.coverImage ? { id: `${project.id}-cover`, type: 'image', url: project.coverImage } : undefined,
    media: (project.gallery || []).flatMap((item, i) => item.url && (item.type === 'image' || item.type === 'video')
      ? [{ id: `${project.id}-media-${i}`, type: item.type, url: item.url, caption: item.caption }] : []),
    caseStudy: [
      { heading: '背景', text: project.context }, { heading: '问题', text: project.problem },
      { heading: '洞察', text: project.insight }, { heading: '策略', text: project.strategy },
      { heading: '创意', text: project.idea }, { heading: '执行', text: project.execution },
      { heading: '我的角色', text: project.myRole }
    ]
  };
}

const words: ContentEntry[] = COPYWRITING_WORKS.map(work => ({
  id: `writing-${work.id}`, kind: 'writing', category: work.category, section: 'WORDS',
  title: work.title, subtitle: work.subtitle, description: work.excerpt.join('\n'),
  body: work.fullContent?.script?.join('\n\n') || work.excerpt.join('\n'),
  locationId: 'print-house', media: [], tags: ['文案', work.category], isSample: true,
  caseStudy: work.fullContent ? [
    { heading: '项目背景', text: work.fullContent.background },
    { heading: '核心创意', text: work.fullContent.coreIdea }
  ] : []
}));

const categories = ['tvc', 'brand', 'ecommerce', 'audience'];
const writingNotes: ContentEntry[] = (['IDEA', 'LIFE'] as const).flatMap(section => categories.map((category, i) => ({
  id: `writing-${section.toLowerCase()}-${category}`, kind: 'writing', category, section,
  title: section === 'IDEA'
    ? ['让故事从一个问题开始', '从一句话找到品牌声音', '把产品放进真实生活', '先理解人，再寻找表达'][i]
    : ['骑行途中记下的句子', '在日常中观察品牌', '一件物品的生活片段', '给每一种生活留一点空间'][i],
  subtitle: section === 'IDEA' ? '创意笔记 · 示例' : '生活手记 · 示例',
  description: section === 'IDEA' ? '从观察、问题和洞察出发，整理一段创意形成的过程。' : '把看见的日常、遇见的人和沿途的风景，写成简短的记录。',
  body: '这是一条用于验证分类与阅读流程的示例。后续可通过内容接口替换标题、正文、图片或视频。',
  locationId: 'print-house', media: [], tags: [section], isSample: true
})));

const brands: ContentEntry[] = [
  { id: 'brand-ip', category: 'ip', title: '海边伙伴 · 角色与 IP', subtitle: '让角色成为品牌的好朋友。', description: '从角色设定、表情与故事，到它在品牌中的应用。' },
  { id: 'brand-art', category: 'art', title: '海岸色彩 · 艺术与插画', subtitle: '用视觉表达更大的想象。', description: '把色彩、形状与观察变成可分享的视觉作品。' },
  { id: 'brand-01', category: 'brand', title: 'Coastal Nomad · 品牌设计', subtitle: '从策略到视觉，塑造品牌价值。', description: '品牌定位、视觉识别与日常物件的整体设计。' },
  { id: 'brand-commerce', category: 'ecommerce', title: '海风日常 · 电商与传播', subtitle: '让设计走进真实的日常。', description: '产品页面、视觉内容与活动传播的协同表达。' }
].map(item => ({ ...item, kind: 'brand', locationId: 'brand-museum', body: '示例项目：在后台接入后，可替换案例说明、封面、图片画廊与视频。', media: [], tags: ['品牌与视觉'], isSample: true }));

const films: ContentEntry[] = [
  { id: 'film-01', title: '海岸的夏天', englishTitle: 'A SUMMER BY THE SEA', category: '短片', date: '2023.07.14', duration: '118 分钟', description: '关于一个夏天、一座海边小镇，和那些依然发光的时光。' },
  { id: 'film-02', title: '海边星穹天文台', englishTitle: 'THE SEASIDE OBSERVATORY', category: '影像实验', date: '2025.08', duration: '时长待更新', description: '沿着山路向上走，让探索成为一段关于远方的影像叙事。' },
  { id: 'film-03', title: '霓虹街机夏天', englishTitle: 'NEON ARCADE MEMORIES', category: 'MV', date: '2025.04', duration: '时长待更新', description: '用投币声、像素与夏日记忆串起一段视听实验。' }
].map(item => ({ ...item, kind: 'film', locationId: 'marc-cinema', body: '影片信息为界面示例。上传视频后，这里将使用真实播放器播放对应作品。', media: [], tags: [item.category], isSample: true }));

const gameExperience: ContentEntry[] = [
  ['stardew', 'Stardew Valley', 320, '在耕耘与日常的节奏里寻找平静。'],
  ['zelda', 'The Legend of Zelda', 280, '探索、路径与世界设计带来的灵感。'],
  ['minecraft', 'Minecraft', 265, '把方块当作思维的积木，构建自己的世界。'],
  ['hollow-knight', 'Hollow Knight', 180, '观察地图、节奏和环境叙事的连接。'],
  ['celeste', 'Celeste', 95, '通过精确的操作与情绪叙事体验成长。'],
  ['terraria', 'Terraria', 90, '从探索到建造，让每一次旅程都有新发现。']
].map(([id, title, hours, description]) => ({
  id: `game-${id}`, kind: 'game-experience', category: 'journey', title: String(title),
  hours: Number(hours), description: String(description), locationId: 'arcade',
  body: '游玩时长与感想目前为界面示例，后续可在内容接口中替换为个人记录。', media: [], tags: ['游戏经历'], isSample: true
}));

const gameProjects: ContentEntry[] = [
  ['seaside-days', 'Seaside Days', '在阳光与海风中，创造属于自己的海边小镇。'],
  ['night-cat', 'Night Cat', '与一只小猫一起，在夜色中的城市探索。'],
  ['little-island', 'Little Island', '从一座小岛开始，建造自己的世界。'],
  ['last-train', 'Last Train', '搭上最后一班列车，去看更大的世界。'],
  ['blue-memories', 'Blue Memories', '在像素的时光里，保存温柔的回忆。']
].map(([id, title, description]) => ({
  id: `demo-${id}`, kind: 'game-project', category: 'making', title, description,
  locationId: 'arcade', body: '示例项目。添加实际 Demo 链接后，“Play Demo”将打开可游玩的版本。',
  media: [], tags: ['游戏制作'], isSample: true
}));

const hobbies: ContentEntry[] = [
  ['photo', 'Photography', '海岸与光影', '用相机记录沿途的风景，以及日常里容易错过的光。'],
  ['reading', 'Reading', '纸页里的远方', '关于设计、故事与生活的阅读记录。'],
  ['vinyl', 'Vinyl', '黑胶回响', '唱片、声音与它们留下的记忆。'],
  ['games', 'Games', '交互与想象', '收集那些启发创作的游戏与体验。'],
  ['cycling', 'Cycling', '海滨骑行', '让身体、道路与海平线一起向前。'],
  ['film', 'Film', '胶片记忆', '记录那些值得再看一次的镜头与故事。'],
  ['figures', 'Figures', '收藏的小世界', '从角色造型到物件细节，观察立体创作。']
].map(([category, subtitle, title, description]) => ({
  id: `hobby-${category}`, kind: 'hobby', category, title, subtitle, description,
  locationId: 'my-studio', body: '收藏介绍为界面示例。接入后台后，可以为这个分类添加多条记录及图片、视频。',
  media: [], tags: [subtitle], isSample: true
}));

const experiments: ContentEntry[] = [
  { id: 'experiment-film', category: 'film', title: '海风片段 · 影像实验', subtitle: 'EXPERIMENT 01 / FILM', date: '2026.09.18', status: 'in-progress', description: '尝试用声音、光线与镜头节奏，把一段海边的日常写成影像。', body: '实验日志（示例）\n\n起点：同一片海面，在清晨和傍晚会呈现怎样不同的情绪？\n\n方法：先记录环境声，再根据声音选择镜头长度与转场。\n\n下一步：补充镜头测试与剪辑版本。实际影片和制作文档尚未添加。', tags: ['影像', '声音', '剪辑'] },
  { id: 'experiment-game', category: 'game', title: '口袋小镇 · 游戏实验', subtitle: 'EXPERIMENT 02 / GAME', date: '2026.09.20', status: 'in-progress', description: '用像素小镇测试探索、交互提示和轻量叙事的连接。', body: '实验日志（示例）\n\n问题：玩家能否仅凭地标与短提示，找到想看的内容？\n\n方法：从一个可行走的街区开始，每次只加入一种交互。\n\n观察：空间中的停留节奏会影响内容的阅读顺序。实际可玩的 Demo 尚未添加。', tags: ['像素', '探索', '原型'] },
  { id: 'experiment-interaction', category: 'interaction', title: '一封可探索的信 · 交互实验', subtitle: 'EXPERIMENT 03 / INTERACTION', date: '2026.09.22', status: 'completed', description: '把翻页、选择与反馈写进一封信，探索阅读的另一种节奏。', body: '实验日志（示例）\n\n假设：微小的选择可以让同一段文字拥有不同的阅读路径。\n\n方法：为三个关键句设置分支，并让反馈保持简短。\n\n归档：这条记录用于演示完成状态。真实交互原型与测试记录待补充。', tags: ['叙事', '阅读', '反馈'] },
  { id: 'experiment-brand', category: 'brand', title: '海盐电台 · 品牌实验', subtitle: 'EXPERIMENT 04 / BRAND', date: '2026.09.24', status: 'planned', description: '从一句话、一种声音和一个符号，试着构建小型品牌的性格。', body: '实验日志（示例）\n\n主题：一个只在傍晚播出的海边电台，会有怎样的品牌声音？\n\n计划：整理品牌关键词，测试标志与片头的配合。\n\n状态：目前为计划示例，视觉稿、音频和品牌文档尚未添加。', tags: ['品牌', '声音', '识别'] },
  { id: 'experiment-visual', category: 'visual', title: '潮汐色卡 · 视觉实验', subtitle: 'EXPERIMENT 05 / VISUAL', date: '2026.09.26', status: 'completed', description: '用有限色阶与清楚的形状，记录海岸从白天到夜晚的变化。', body: '实验日志（示例）\n\n约束：每组画面使用五种主要颜色。\n\n方法：先观察明暗关系，再用相同的色阶重新组织场景。\n\n归档：用于展示视觉实验的记录方式。真实图像、色卡与源文件待添加。', tags: ['色彩', '像素', '构图'] },
].map(item => ({ ...item, kind: 'experiment', status: item.status as ContentEntry['status'], locationId: 'experiment-lab', media: [], attachments: [], isSample: true }));

const general = PORTFOLIO_PROJECTS.filter(p => !['print-house', 'brand-museum', 'marc-cinema', 'experiment-lab'].includes(p.locationId)).map(projectToContentEntry);
export const CONTENT_SEED: ContentEntry[] = [...words, ...writingNotes, ...brands, ...films, ...gameExperience, ...gameProjects, ...hobbies, ...experiments, ...general];
