export interface ProfileData {
  name: string;
  englishName: string;
  title: string;
  tagline: string;
  shortBio: string;
  longBio: string;
  email: string;
  location: string;
  cvUrl?: string;
  avatarUrl?: string;
  links: {
    label: string;
    url: string;
    icon?: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  experience: {
    company: string;
    role: string;
    period: string;
    responsibilities: string[];
  }[];
}

export const profile: ProfileData = {
  name: '张震',
  englishName: 'Marc Zhang',
  title: '内容与创意策划 · 游戏 / 互动内容',
  tagline: '把抽象创意拆解为体验流程、视觉表现与可执行内容。',
  shortBio: '9 年内容与创意策划经验，拥有互动玩法、交互体验、叙事内容、视觉表现及项目落地经验。',
  longBio: '拥有 9 年内容与创意策划经验，以及 AIGC 内容制作与开发经历。曾独立负责互动 H5 的玩法机制、体验流程、交互设计及文案，并通过 Vibe Coding 制作可操作的剧情互动原型。长期深度体验 ACT / ARPG / RPG，累计核心游戏体验 1000h+。擅长将抽象创意拆解为体验流程、视觉表现及可执行内容，具备叙事、审美、分镜及跨专业沟通能力，希望长期向游戏内容设计、玩法原型、关卡体验及叙事演出方向发展。',
  email: 'marctubud@126.com',
  location: '杭州',
  avatarUrl: '/media/resume/portrait.webp',
  links: [],
  skills: [
    {
      category: '游戏与互动',
      items: ['玩法设计', '交互流程设计', '用户体验拆解', '可操作原型', 'Vibe Coding']
    },
    {
      category: '内容与表现',
      items: ['叙事设计', '脚本 / 分镜', '动作与镜头设计', '视觉创意', '文案']
    },
    {
      category: '制作能力',
      items: ['AIGC 内容制作', '视频剪辑', '手绘示意', '摄影摄像']
    },
    {
      category: '项目能力',
      items: ['跨团队协作', '项目推进', '流程 SOP', '项目复盘', '团队培训']
    }
  ],
  experience: [
    {
      company: '上海聚光溢彩文化科技有限公司（青岛）',
      role: 'AI 制作组组长',
      period: '2025.10–2026.06',
      responsibilities: [
        '负责 AI 内容项目从概念设计、剧本优化、镜头拆解、美术方案到最终剪辑的完整制作流程，将抽象创意拆解为角色、场景、动作、镜头及制作任务。',
        '根据实际生成结果持续调整角色表现、动作逻辑、镜头节奏和视觉反馈，通过快速制作、验证、修改推进内容落地。',
        '搭建团队制作 SOP、质量检查及项目复盘机制，负责组员在提示词、制作思路与工作流方面的培训。'
      ]
    },
    {
      company: '杭州全速网络技术有限公司',
      role: '创意策划',
      period: '2022.07–2025.08',
      responsibilities: [
        '负责互动 H5、IP、影像及数字内容项目的创意与体验策划，完成核心概念、用户流程、互动机制、内容结构及视觉表达方案。',
        '主导爱普生 × 超级植物互动 H5、浦发银行 IP、招商信诺周年项目、洋河品牌传播等数字内容项目，参与从前期方案、交互流程、页面内容到最终执行与体验优化的完整流程。',
        '拓展 10+ 新行业项目，累计推动 700 万+ 品牌合作；参与项目评估体系、流程 SOP 及新人培训体系建设。'
      ]
    },
    {
      company: '比亚迪汽车销售有限公司',
      role: '资深创意',
      period: '2021.04–2022.07',
      responsibilities: [
        '负责比亚迪海豚、唐 EV、宋 Pro DM-i、元 PLUS 等车型上市内容及 TVC 创意策划，参与创意概念、文案、脚本、分镜及视觉表达。',
        '参与大型发布会及品牌内容项目，积累复杂项目下多团队协作、内容推进及现场执行经验。'
      ]
    },
    {
      company: '深圳市崇知文化创意有限公司',
      role: '策划主管',
      period: '2018.06–2019.06',
      responsibilities: [
        '根据需求拟定创意策略及撰写文案，涉及活动策划、H5、海报、绘本等。',
        '主导腾讯公益《声音杂货铺》互动 H5 创意策划，参与互动形式、用户体验流程、内容结构与文案设计，项目获腾讯广告创益突破奖。'
      ]
    }
  ],
};
