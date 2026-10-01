export interface CopywritingWork {
  id: string;
  category: 'tvc' | 'brand' | 'ecommerce' | 'audience';
  title: string;
  subtitle: string;
  thumbnail: string;
  excerpt: string[];
  fullContent?: {
    background: string;
    script?: string[];
    coreIdea: string;
    highlights: string[];
  };
}

export interface CopywritingCategory {
  id: 'tvc' | 'brand' | 'ecommerce' | 'audience';
  name: string;
  iconName: 'file-text' | 'crown' | 'shopping-cart' | 'users';
}

export const COPYWRITING_CATEGORIES: CopywritingCategory[] = [
  { id: 'tvc', name: 'TVC文案', iconName: 'file-text' },
  { id: 'brand', name: '品牌文案', iconName: 'crown' },
  { id: 'ecommerce', name: '电商文案', iconName: 'shopping-cart' },
  { id: 'audience', name: '人群文案', iconName: 'users' },
];

export const COPYWRITING_WORKS: CopywritingWork[] = [
  // ==========================================
  // 1. TVC 文案
  // ==========================================
  {
    id: 'tvc-01',
    category: 'tvc',
    title: '更好的明天',
    subtitle: '某生活方式品牌TVC文案',
    thumbnail: '/assets/interiors/thumb_better_tomorrow.png',
    excerpt: [
      '生活不在别处，',
      '就在每一个认真出发的今天。',
      '把小小的日常，过成更好的明天。'
    ],
    fullContent: {
      coreIdea: '以日常细微的幸福感连接受众，打破宏大叙事的距离感，让品牌主张融入普通人的清晨与黄昏。',
      background: '面对当下年轻群体的焦虑情绪，品牌希望传达一种松弛且笃定的生活态度——真正的力量不在于追赶所有期待，而在于把脚下的每一天过好。',
      script: [
        '【画面：清晨的海边公路，单车缓缓滑过带有晨露的石阶】',
        '旁白：你有多久，没有认真看过一朵浪花被阳光镀上金色的样子？',
        '【画面：厨房里正在萃取的咖啡，水汽在微风中轻盈升腾】',
        '旁白：生活不在别处，就在每一个认真出发的今天。',
        '【画面：黄昏归途，路灯初亮，与迎面走来的邻居微笑点头】',
        '旁白：不必等到达某个终点才去感受幸福。',
        '旁白：把小小的日常，过成更好的明天。'
      ],
      highlights: [
        '温情而不煽情，语感克制而有余味',
        '强化生活场景中与品牌的自然情感联结',
        '全网传播播放量突破 500w+'
      ]
    }
  },
  {
    id: 'tvc-02',
    category: 'tvc',
    title: '风从海面吹来',
    subtitle: '海滨文旅品牌年度形象片TVC',
    thumbnail: '/assets/interiors/thumb_better_tomorrow.png',
    excerpt: [
      '当风吹过海面，',
      '所有的心事都在浪涌里找到了归宿。',
      '带上轻简的行囊，赴一场自由的约。'
    ],
    fullContent: {
      coreIdea: '唤醒城市人对自然与海浪的向往，将海滨度假定义为一次心灵的充电与回归。',
      background: '文旅品牌面向一二线城市青年客群，通过充满呼吸感的视听语言，呈现一段治愈的海滨短途旅行。',
      script: [
        '【画面：空镜俯瞰蔚蓝海湾，白色海鸥掠过红瓦屋顶】',
        '旁白：城市的时钟总是太快，快到让人忘记了呼吸的节奏。',
        '【画面：赤脚踩在温热沙滩上，海水缓缓漫过脚踝】',
        '旁白：但在海边，时间是由潮水说了算的。',
        '【画面：夜幕低垂，海风掀起白色窗帘，灯火倒映在波光中】',
        '旁白：来海边吧，让海风吹散所有多余的心事。'
      ],
      highlights: [
        '诗意散文化的旁白写作风格',
        '突出声画对位与氛围感的营造',
        '有效提升文旅预订转化率 35%'
      ]
    }
  },
  {
    id: 'tvc-03',
    category: 'tvc',
    title: '时间的刻度',
    subtitle: '独立腕表品牌概念TVC',
    thumbnail: '/assets/interiors/thumb_better_tomorrow.png',
    excerpt: [
      '秒针走过一圈，是时间的流逝；',
      '而你专注其中的每分每秒，',
      '是生命的厚度。'
    ],
    fullContent: {
      coreIdea: '不谈虚荣与奢华，探讨时间与专注的关系，将腕表定义为专注者前行路上的静默伙伴。',
      background: '为新一代匠人腕表品牌撰写的概念片文案，打破传统钟表行业的精英化套路，转向内求的精神共鸣。',
      script: [
        '【画面：暗调光线下，工匠手执镊子校对微型齿轮，齿轮轻微咬合】',
        '旁白：如果时间是一条看不见的河流，我们如何证明自己曾认真活过？',
        '【画面：设计师在图纸上画下第一条线条，目光专注如炬】',
        '旁白：不随波逐流，不惊慌失措。',
        '【画面：晨曦照进工作室，表盘指针稳健走向清晨七点整】',
        '旁白：时间的刻度，只为懂得专注的人停驻。'
      ],
      highlights: [
        '哲学维度的品牌立意提炼',
        '字斟句酌的文学品质感',
        '荣获年度文案金句推荐'
      ]
    }
  },

  // ==========================================
  // 2. 品牌文案
  // ==========================================
  {
    id: 'brand-01',
    category: 'brand',
    title: '文字的自我修养',
    subtitle: '个人创作工作室核心主张',
    thumbnail: '/assets/interiors/thumb_better_tomorrow.png',
    excerpt: [
      '好的文字不是喧闹的修辞，',
      '而是一把精准的刻刀。',
      '在混乱的声音里，留下笃定的印记。'
    ],
    fullContent: {
      coreIdea: '克制、精准、富有温度的叙事美学，致力于用文字为品牌塑造经得起时间考验的灵魂。',
      background: '工作室的立身宣言，挂在 Write House 醒目的白墙之上，时刻提醒创作者：保持诚恳，不写无病呻吟的文字。',
      script: [
        '我们坚信：',
        '信息过载的时代，人们缺少的不是声音，而是值得停留的共鸣。',
        '商业文案的最高境界，是让商业逻辑在人文关怀的底色里悄然生根。',
        '每一个字，都是通往内心的微小引桥。'
      ],
      highlights: [
        '明确个人工作室的价值观与审美准则',
        '成为多项知名品牌合作的敲门砖'
      ]
    }
  },
  {
    id: 'brand-02',
    category: 'brand',
    title: '自然之物，日常之美',
    subtitle: '家居生活美学品牌年度主张',
    thumbnail: '/assets/interiors/thumb_better_tomorrow.png',
    excerpt: [
      '让一件器物，安住在一整天的阳光里。',
      '所谓的日常，',
      '不过是被用心对待的每一件小物。'
    ],
    fullContent: {
      coreIdea: '重塑人与器物的关系，倡导“慢下来、善待每一寸生活”的东方自然哲学。',
      background: '面向注重精神品质的都市家庭，为原创家居品牌打造从品牌手册到空间导视的完整文案体系。',
      script: [
        '木头有它的年轮与脾气，',
        '棉麻有它的褶皱与呼吸。',
        '真正的奢侈，不是拥有多昂贵的陈设，',
        '而是在清晨倒下一杯温水时，手心触碰到的那份笃定。'
      ],
      highlights: [
        '打造极具辨识度的“呼吸感”品牌语调（Tone of Voice）',
        '落地应用于全国 12 家线下生活美学空间'
      ]
    }
  },
  {
    id: 'brand-03',
    category: 'brand',
    title: '向光而行，步履不停',
    subtitle: '专业户外运动品牌年度宣言',
    thumbnail: '/assets/interiors/thumb_better_tomorrow.png',
    excerpt: [
      '没有不可跨越的山海，',
      '只要脚下仍有向前的节律。',
      '出发吧，光就在风的尽头。'
    ],
    fullContent: {
      coreIdea: '激发探索者内心的原始力量，鼓励人们走到户外，在山川与旷野中重新找回敏锐的知觉。',
      background: '为国内新锐越野与徒步装备品牌定制的年度整合传播文案。',
      script: [
        '当你在办公室的荧幕前坐得太久，',
        '别忘了山谷里正在落下一场清爽的阵雨。',
        '背上行囊不是为了征服山峰，',
        '而是为了向世界证明：我们依然充满好奇。'
      ],
      highlights: [
        '力量感与诗意兼备的语言风格',
        '精准击中户外新中产的心理痛点'
      ]
    }
  },

  // ==========================================
  // 3. 电商文案
  // ==========================================
  {
    id: 'ecommerce-01',
    category: 'ecommerce',
    title: '海边咖啡：一口夏日微风',
    subtitle: '精品咖啡豆夏日限定上新详情页',
    thumbnail: '/assets/interiors/thumb_better_tomorrow.png',
    excerpt: [
      '采摘于高山云雾，烘焙于海浪微咸。',
      '撕开包装的瞬间，',
      '扑面而来的，是一整个夏天的海风。'
    ],
    fullContent: {
      coreIdea: '通过通感修辞将咖啡的风味描述转化为鲜活的夏日感官体验，极大提升详情页跳失率与加购率。',
      background: '独立精品烘焙品牌夏日冷萃专线上市，需要一套区别于传统“酸度/苦度参数”的诗意化风味文案。',
      script: [
        '【前调 · 柠檬草与白桃】：就像七月午后第一口含在嘴里的薄荷冰水。',
        '【中调 · 茉莉花茶韵】：如同风吹过沿海公路旁的盛开花园。',
        '【尾韵 · 枫糖回甘】：是日落时分留在舌尖那一抹温软的甜。'
      ],
      highlights: [
        '打破冷冰冰的风味轮术语，打造有画面感的通感文案',
        '上新首周售罄 10,000+ 罐限定冷萃包'
      ]
    }
  },
  {
    id: 'ecommerce-02',
    category: 'ecommerce',
    title: '手作陶杯：掌心里的温热',
    subtitle: '景德镇手作器物详情页故事',
    thumbnail: '/assets/interiors/thumb_better_tomorrow.png',
    excerpt: [
      '每一只杯子，都保留着泥土与指尖相遇的温度。',
      '不追求工业的绝对完美，',
      '只求握在手心时的那一份妥帖。'
    ],
    fullContent: {
      coreIdea: '传递手作的不可复制性与拙朴之美，让每一件器物都成为使用者生活中的忠实伙伴。',
      background: '针对传统手工艺人产品的线上化包装，挖掘每件器物背后数道柴烧与拉胚工序的情感价值。',
      script: [
        '泥土经过 1300 度烈火淬炼，',
        '留下了草木灰自然流淌的釉色斑驳。',
        '世界上没有两只完全相同的杯子，',
        '就像世界上，没有两个完全相同的清晨。'
      ],
      highlights: [
        '赋予手工制品深厚的精神附加值',
        '客单价提升 40%，退货率低于行业均值 70%'
      ]
    }
  },
  {
    id: 'ecommerce-03',
    category: 'ecommerce',
    title: '亚麻衬衫：会呼吸的自在',
    subtitle: '独立服饰品牌夏日主打款文案',
    thumbnail: '/assets/interiors/thumb_better_tomorrow.png',
    excerpt: [
      '比风更轻柔的，是晒过太阳的法国诺曼底亚麻。',
      '给身体松绑，',
      '穿上一整天的无拘与松弛。'
    ],
    fullContent: {
      coreIdea: '将服装面料的透气、亲肤特性转化为“给身体松绑”的生活方式主张。',
      background: '中高端棉麻服饰品牌夏季主推款上市文案，强调无拘无束的穿衣体验。',
      script: [
        '别让紧绷的剪裁束缚了你的夏天。',
        '源自诺曼底雨水充沛的优质麻纤维，',
        '带着天然的垂坠与微褶。',
        '不需熨烫得一丝不苟，随性才是真正的时髦。'
      ],
      highlights: [
        '倡导“松弛感”穿搭态度',
        '单品成为当季全渠道销售冠军'
      ]
    }
  },

  // ==========================================
  // 4. 人群文案
  // ==========================================
  {
    id: 'audience-01',
    category: 'audience',
    title: '致认真出发的赶路人',
    subtitle: '青年生活方式社群年度共鸣信',
    thumbnail: '/assets/interiors/thumb_better_tomorrow.png',
    excerpt: [
      '你深夜穿过的街巷，清晨早起的晨雾，',
      '都在默默见证你对生活的热忱。',
      '愿你步履不停，也能随时驻足看海。'
    ],
    fullContent: {
      coreIdea: '向在城市中默默打拼的普通青年致敬，给予坚实的情感抚慰与肯定。',
      background: '社群周年庆之际写给数万名读者的公开信文案，以真诚、体贴的笔触引发全网自发转发与讨论。',
      script: [
        '我们见过你挤在早高峰地铁里的专注，',
        '也见过你加班深夜站在天桥上远眺的眼神。',
        '世界有时很大，大到让人觉得自己渺小；',
        '但你每一次不服输的坚持，都在照亮属于自己的小小天地。',
        '累了的时候，就允许自己停下来，听一听风的声音。'
      ],
      highlights: [
        '引发强烈的读者心理共鸣，留言区收获 10,000+ 条真挚分享',
        '阅读量突破 10w+'
      ]
    }
  },
  {
    id: 'audience-02',
    category: 'audience',
    title: '都市游牧者的海边来信',
    subtitle: '数字游民社区故事与圈层主张',
    thumbnail: '/assets/interiors/thumb_better_tomorrow.png',
    excerpt: [
      '带上一台电脑与一颗好奇的心，',
      '世界就是你的办公室。',
      '在海边敲击键盘，代码和文字都有了浪潮的节拍。'
    ],
    fullContent: {
      coreIdea: '定义新型数字游民的自由与责任，展现地理自由之外的深度专注与生活掌控力。',
      background: '针对海边创客社区与共居空间策划的招募文案，面向自由职业者、独立开发者与创意写作者。',
      script: [
        '我们逃离的不是工作，而是被固化的生活轨迹。',
        '在可以眺望海湾的露台上敲下回车键，',
        '身旁有一杯冒着热气的咖啡，窗外是掠过的海鸥。',
        '在这里，工作是生活的一部分，而不是生活的全部。'
      ],
      highlights: [
        '精准描摹数字游民群体的精神图景',
        '共居空间首期招募超额完成 200%'
      ]
    }
  },
  {
    id: 'audience-03',
    category: 'audience',
    title: '向内求索，向外生长',
    subtitle: '女性成长社群力量访谈专栏文案',
    thumbnail: '/assets/interiors/thumb_better_tomorrow.png',
    excerpt: [
      '不再向外界索要赞许的目光，',
      '开始懂得倾听内心的声音。',
      '每一个阶段的你，都是最好的盛开。'
    ],
    fullContent: {
      coreIdea: '鼓励女性摆脱年龄与角色枷锁，勇敢探索属于自己的无限可能。',
      background: '人物深度访谈专栏的发刊词与卷首语文案。',
      script: [
        '别让世俗的评价尺子，量度你丰富而独特的灵魂。',
        '在喧嚣中保留一块属于自己的静谧花园，',
        '向内扎根，向外生长，',
        '勇敢去爱，去创造，去成为你真正想成为的人。'
      ],
      highlights: [
        '温润而坚定的人文女性视角',
        '专栏入选平台年度精选内容榜单'
      ]
    }
  }
];
