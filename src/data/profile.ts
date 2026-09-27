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
}

export const profile: ProfileData = {
  name: '哈吉米 (Marc)',
  englishName: 'Marc',
  title: 'Creative Technologist / Game & Interactive Director',
  tagline: 'Ride · Explore · Create — A Brighter Creative Journey',
  shortBio: '专注于交互叙事、游戏原型开发、品牌创意与数字体验的跨领域创作者。用代码与像素构建充满呼吸感与乐观精神的世界。',
  longBio: '热爱骑行与探索海边小镇的创作者。从写作叙事、品牌策略到独立游戏开发与 AI 视觉实验，坚信最好的作品不仅解决实际问题，更能唤起人们内心的好奇心与对更广阔世界（A Brighter World）的向往。',
  email: 'marc.creative@example.com',
  location: 'Shanghai / Coastal Nomad',
  cvUrl: '#',
  links: [
    { label: 'GitHub', url: 'https://github.com' },
    { label: 'Bilibili', url: 'https://bilibili.com' },
    { label: 'X (Twitter)', url: 'https://x.com' },
    { label: 'Email Me', url: 'mailto:marc.creative@example.com' }
  ],
  skills: [
    {
      category: 'Game & Tech',
      items: ['Phaser 3', 'TypeScript', 'React', 'Vite', 'Three.js / WebGL', 'Shader (GLSL)', 'Zustand', 'Node.js']
    },
    {
      category: 'Creative & Art',
      items: ['Pixel Art (Aseprite)', 'Cel-Shading 3D', 'Art Direction', 'Visual Storytelling', 'Game Design', 'Level Design']
    },
    {
      category: 'Tools & AI',
      items: ['Midjourney / Stable Diffusion', 'LLM Prompt Engineering', 'Blender', 'Photoshop', 'Figma']
    }
  ]
};
