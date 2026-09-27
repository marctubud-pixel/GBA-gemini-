# MY WORLD — GBA Content System & Device Shell 补充开发规范

> 文档类型：Addendum / 补充规范  
> 适用基线：`MY_WORLD_BRIGHT_COASTAL_GBA_FINAL_PLAN_v1.0_CN.md`  
> 版本：v1.0  
> 目的：补充内容管理、作品替换、个人信息维护，以及 GBA-like / Retro TV 外壳系统的正式实现规范。  
> 注意：本文件不推翻主开发方案，仅补充内容层与外壳层架构。

---

# 1. 核心原则

MY WORLD 必须严格拆分为三层：

```text
GAME WORLD
负责：骑行、停车、步行、世界、建筑、互动触发

CONTENT DATA
负责：作品、个人信息、CV、图片、视频、Landmark 与作品关系

REACT UI
负责：Portfolio Overlay、INDEX、INFO、CV、Device Shell
```

核心目标：

> 后续替换作品、文案、图片、视频、CV、个人信息时，不修改 Phaser 世界逻辑。

Phaser 只负责回答：

```text
玩家在哪
玩家靠近什么
玩家触发了哪个 Location
```

React / Content Data 负责回答：

```text
这个 Location 展示哪些作品
作品内容是什么
如何展示
```

---

# 2. 推荐内容目录

```text
src/
  data/
    profile.ts
    projects.ts
    locations.ts
    worldSegments.ts
    deviceThemes.ts

  portfolio/
    PortfolioOverlay.tsx
    ProjectView.tsx
    ProjectIndex.tsx

  shell/
    DeviceShell.tsx
    GBADeviceShell.tsx
    RetroTVShell.tsx
    NoFrameShell.tsx

content/
  projects/
    film-01.md
    brand-01.md
    writing-01.md
    interactive-01.md

public/
  portfolio/
    film-01/
      cover.webp
      image-01.webp
      image-02.webp
      video.mp4

    brand-01/
      cover.webp
      image-01.webp

  cv/
    cv.pdf
```

---

# 3. Profile 数据

个人信息统一放在一个数据源中。

推荐：

```ts
export interface ProfileData {
  name: string
  title: string
  shortBio: string
  longBio?: string
  email?: string
  location?: string
  cvUrl?: string
  avatarUrl?: string

  links?: {
    label: string
    url: string
  }[]
}
```

示例：

```ts
export const profile: ProfileData = {
  name: '...',
  title: 'Creative / Interactive / Game',
  shortBio: '...',
  cvUrl: '/cv/cv.pdf',
  links: [
    { label: 'LinkedIn', url: '...' },
    { label: 'GitHub', url: '...' }
  ]
}
```

后续修改：

- Name
- Bio
- Job Direction
- Email
- CV
- Social Links

都只修改 `profile.ts` 或相关静态文件。

禁止把个人信息写死在多个 React Component 中。

---

# 4. Project 数据

Portfolio 项目必须 Data-driven。

推荐：

```ts
export interface PortfolioProject {
  id: string
  title: string
  subtitle?: string
  category: string
  locationId: string

  year?: string
  oneLiner?: string

  context?: string
  problem?: string
  insight?: string
  strategy?: string
  idea?: string
  execution?: string

  role?: string
  contribution?: string
  collaborators?: string[]
  tools?: string[]

  result?: string
  impact?: string

  cover?: string
  gallery?: string[]
  video?: string

  featured?: boolean
}
```

Location 与 Project 通过：

```ts
locationId
```

建立关系。

例如：

```ts
{
  id: 'film-01',
  title: 'Film Project',
  category: 'Film',
  locationId: 'marc-cinema'
}
```

以后将作品从 Cinema 移到其他 Location，只改数据，不改 Phaser。

---

# 5. 长篇 Case Study

复杂项目不建议全部写在 TypeScript 对象中。

推荐使用：

```text
Markdown
或
MDX
```

例如：

```text
content/projects/film-01.md
```

结构：

```md
---
id: film-01
title: Film Project
category: Film
locationId: marc-cinema
year: 2026
role: Director
cover: /portfolio/film-01/cover.webp
---

# Context

...

# Problem

...

# Insight

...

# Idea

...

# Execution

...

# My Role

...

# Result

...
```

React Portfolio Overlay 负责读取并渲染。

目标：

> 后续维护作品集尽量像“编辑文章”，而不是“修改游戏代码”。

---

# 6. Location 数据

Landmark 不直接包含作品正文。

推荐：

```ts
export interface WorldLocation {
  id: string
  name: string
  zone: 'main-town' | 'interest-area' | 'future-hill'

  x: number
  parkingX: number
  interactionX: number

  action:
    | 'READ'
    | 'VIEW'
    | 'WATCH'
    | 'PLAY'
    | 'ENTER'
    | 'LOOK'

  projectIds: string[]
}
```

例如：

```ts
{
  id: 'marc-cinema',
  name: 'MARC CINEMA',
  zone: 'main-town',
  x: 3600,
  parkingX: 3450,
  interactionX: 3650,
  action: 'WATCH',
  projectIds: ['film-01', 'film-02']
}
```

Phaser 只读取：

```text
Position
Parking
Interaction
Action
```

React 根据：

```text
projectIds
```

读取作品。

---

# 7. 内容替换流程

以后用户更新作品时，标准流程应该是：

```text
1. 新增 / 替换图片与视频
2. 更新 Project Data / Markdown
3. 如有需要修改 projectIds
4. Build
5. Deploy
```

不需要：

```text
修改 WorldScene
修改 Bike Controller
修改 Parking
修改 Interaction System
重新制作游戏逻辑
```

这是正式架构要求。

---

# 8. Device Shell 系统

MY WORLD 正式增加一层：

> **Device Shell**

作用：

- 强化第一印象
- 把“游戏世界”包装成一个虚构互动设备
- 提供额外导航入口
- 允许未来切换 GBA-like / Retro TV / No Frame

Device Shell 必须使用：

```text
React + CSS
```

实现。

禁止把外壳画入 Phaser World Scene。

正确层级：

```text
Browser
│
├── DeviceShell
│   └── GameViewport
│       └── Phaser Canvas
│
├── Portfolio Overlay
├── INDEX
├── INFO / CV
└── Global Navigation
```

---

# 9. 默认 Device Theme

V1 推荐默认：

> **MY WORLD Fictional Handheld**

不是复制真实 Game Boy Advance。

它是 MY WORLD 自己的虚构掌机。

推荐文字：

```text
MY WORLD

PORTABLE CREATIVE SYSTEM

RIDE · EXPLORE · CREATE
```

外壳可以借鉴：

- GBA 横向布局
- D-pad
- A / B
- START / SELECT
- Speaker holes
- Power light
- Screen bezel

但禁止 1:1 复制真实任天堂硬件外观与 Logo。

---

# 10. DeviceTheme 数据结构

推荐：

```ts
export type DeviceFrame =
  | 'gba'
  | 'retro-tv'
  | 'none'

export interface DeviceTheme {
  id: string
  frame: DeviceFrame
  label: string
  enabled: boolean
}
```

例如：

```ts
export const deviceThemes: DeviceTheme[] = [
  {
    id: 'my-world-handheld',
    frame: 'gba',
    label: 'MY WORLD Portable',
    enabled: true
  },
  {
    id: 'retro-tv',
    frame: 'retro-tv',
    label: 'Retro TV',
    enabled: false
  },
  {
    id: 'clean',
    frame: 'none',
    label: 'Clean',
    enabled: true
  }
]
```

---

# 11. DeviceShell Component 结构

推荐：

```text
DeviceShell
├── GBADeviceShell
├── RetroTVShell
└── NoFrameShell
```

接口：

```ts
interface DeviceShellProps {
  children: React.ReactNode
  theme: DeviceFrame
}
```

Phaser Canvas 作为 `children` 放入屏幕区域。

Game World 不需要知道自己是否被 GBA 或 TV 包裹。

---

# 12. GBA-like 外壳交互

V1 可以让外壳按钮部分具有真实功能。

推荐映射：

```text
D-PAD
→ optional keyboard / navigation mirror

A
→ Interact / E

B
→ Back / Close

START
→ INDEX

SELECT
→ INFO / CV
```

鼠标点击按钮时可触发相同事件。

键盘仍然是 Desktop 主控制方式。

外壳按钮不是必须依赖鼠标操作。

---

# 13. Retro TV 预留

Retro TV 不要求 V1 实现，但必须确保架构支持。

未来可映射：

```text
Channel 1
→ MY WORLD

Channel 2
→ INDEX

Channel 3
→ INFO

Channel 4
→ Featured Project
```

实现 Retro TV 时：

- 不修改 Phaser
- 不修改 Portfolio Data
- 只新增 `RetroTVShell.tsx`

---

# 14. 响应式要求

Desktop：

```text
Device Shell
+
Game Screen
```

保持完整展示。

当窗口过小：

- Device Shell 可以缩放
- Game Canvas 保持逻辑比例
- 禁止拉伸 Pixel Aspect

Mobile：

不强制展示 Device Shell。

默认：

```text
INDEX / Project Mode
```

避免把虚拟 GBA 控制器作为 Mobile 主方案。

---

# 15. Portfolio Overlay 与 Device Shell 层级

Portfolio Overlay 必须显示在 Device Shell 上方。

推荐层级：

```text
Portfolio Overlay        z-index highest
Global UI
Device Shell
Phaser Canvas
```

打开 Portfolio 时：

- Phaser Input Lock
- Device Shell 可以保持可见
- Overlay 覆盖游戏 Screen 或整个 Device

第一版推荐：

> Overlay 覆盖整个浏览器区域，而不是被限制在掌机小屏幕内部。

原因：

Portfolio 内容需要高分辨率、专业、可阅读。

---

# 16. INDEX / INFO 与 Device Shell

START：

```text
Open INDEX
```

SELECT：

```text
Open INFO / CV
```

但 INDEX / INFO 依然是普通 React 页面 / Overlay。

不把它们做成 Phaser Scene。

---

# 17. 状态桥接

推荐 Zustand 统一桥接：

```ts
interface AppState {
  gameMode: 'world' | 'index' | 'info' | 'project'
  activeProjectId?: string
  deviceTheme: DeviceFrame

  openProject: (id: string) => void
  closeProject: () => void
  openIndex: () => void
  openInfo: () => void
  setDeviceTheme: (theme: DeviceFrame) => void
}
```

Phaser 与 React 通过 Store / Event Bridge 通信。

避免直接让 Phaser 操作 DOM。

---

# 18. 开发顺序补充

在主方案 PHASE 01–05 中增加以下工作。

## CONTENT FOUNDATION

尽早建立：

```text
profile.ts
projects.ts
locations.ts
worldSegments.ts
```

不要等全部世界完成后才迁移数据。

## DEVICE SHELL

推荐在：

```text
Foundation 完成
+
Phaser Canvas 可运行
```

以后立即建立基础 `DeviceShell`。

V1 外壳可以先非常简洁，但结构必须正确。

正式美术可以后补。

---

# 19. Agent 执行任务

建议增加：

```text
MW-GBA-CONTENT-001
建立 profile / project / location / worldSegment 数据结构

MW-GBA-CONTENT-002
PortfolioOverlay 改为完全读取 Data

MW-GBA-CONTENT-003
支持 Markdown / MDX Case Study

MW-GBA-SHELL-001
建立 DeviceShell 抽象

MW-GBA-SHELL-002
实现 GBADeviceShell

MW-GBA-SHELL-003
将 START / SELECT / A / B 接入应用状态

MW-GBA-SHELL-004
实现 none theme

MW-GBA-SHELL-005
预留 RetroTVShell interface
```

---

# 20. Acceptance Criteria

## Content

- [ ] Profile 不写死在多个 Component
- [ ] Portfolio Projects 全部来自统一数据源
- [ ] Location 与 Project 通过 ID 关联
- [ ] Phaser Scene 不包含 Portfolio 正文
- [ ] 替换一个作品无需修改 Phaser
- [ ] 替换 CV 无需修改游戏代码
- [ ] Image / Video 路径可通过数据修改
- [ ] Markdown / MDX 项目可以正常渲染

## Device Shell

- [ ] Phaser Canvas 被 React DeviceShell 包裹
- [ ] Device Shell 不属于 Phaser Scene
- [ ] 默认支持 GBA-like theme
- [ ] 支持 none theme
- [ ] Retro TV 有独立 Component 预留
- [ ] START 可打开 INDEX
- [ ] SELECT 可打开 INFO
- [ ] A 可以映射 Interact
- [ ] B 可以映射 Back / Close
- [ ] Portfolio Overlay 正确显示在 Shell 上方
- [ ] Shell Resize 不破坏 Pixel Aspect Ratio

---

# 21. 禁止事项

禁止：

```text
把 Portfolio 文案写进 WorldScene
把 Profile 写死在多个 UI 文件
每个 Landmark 单独写一套 Interaction Logic
把 GBA 外框画进 Phaser
让 Phaser 直接控制 React DOM
为更换作品修改游戏控制代码
复制真实 Game Boy Advance Logo / 品牌设计
为了 Retro TV 重写游戏世界
```

---

# 22. 最终架构

```text
MY WORLD APP
│
├── CONTENT
│   ├── Profile
│   ├── Projects
│   ├── Locations
│   └── World Segments
│
├── REACT
│   ├── Welcome
│   ├── Device Shell
│   ├── INDEX
│   ├── INFO / CV
│   └── Portfolio Overlay
│
└── PHASER
    ├── World
    ├── Bike
    ├── Parking
    ├── Walking
    ├── Interaction
    └── Camera
```

原则：

> **Game World 决定如何发现内容。**  
> **Content Data 决定内容是什么。**  
> **React 决定内容如何被专业地展示。**  
> **Device Shell 决定整个体验如何被包装。**

这样后续 MY WORLD 可以持续换作品、换信息、换设备外壳，而不需要重做核心游戏。
