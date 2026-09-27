# MY WORLD — Bright Coastal GBA 横版最终开发方案

> 版本：v1.0  
> 项目类型：Playable Portfolio / Interactive Personal Homepage  
> 最终视觉方向：Bright Coastal GBA-inspired Side-scrolling Pixel Art  
> 平台：Desktop Web First  
> 技术栈：Vite + React + TypeScript + Phaser 3 + Zustand + React DOM Overlay  
> 当前决策：停止继续扩展高成本实时 3D 方案；不再做测试分支，直接按本方案进入正式生产。  
> 核心体验：骑自行车沿一条横向展开的海边创作世界，从入口一路经过作品、兴趣与未来，最终上坡抵达 Observatory。

---

# 0. 最终产品定义

MY WORLD 是一个可以“骑进去”的个人作品集。

访客不是进入传统 Portfolio 首页，而是进入一条持续向右延伸的海边道路。  
玩家骑自行车穿过不同建筑和区域，在移动中逐步理解：

1. What can I make?
2. What shapes me?
3. Where am I going?

核心不是平台跳跃、闯关或模拟经营，而是：

> **Ride → Discover → Park → Walk → Interact → View Work → Return → Continue**

横版结构让体验从“自由地图探索”变成“连续旅程”，降低导航成本，同时强化叙事顺序。

---

# 1. 世界结构

整个世界主要沿 X 轴连续展开。

```text
ENTRANCE
→ CENTRAL PLAZA
→ PRINT HOUSE
→ BRAND & CREATIVE MUSEUM
→ MARC CINEMA
→ EXPERIMENT LAB
→ ARCADE
→ MY STUDIO
→ FUTURE HILL
↗ UPHILL
→ OBSERVATORY
```

不使用传统 Level Loading。

所有区域连接成一个连续世界带。

推荐首版世界总长度：

```text
约 8000–12000 px
```

完整骑行时间：

```text
约 2–3 分钟
```

完整浏览体验：

```text
约 5–12 分钟
```

---

# 2. 三段式叙事

## MAIN TOWN — What can I make?

包含：

- Central Plaza
- Print House
- Brand & Creative Museum
- MARC CINEMA
- Experiment Lab

视觉：

- 建筑最密集
- 商业与创作空间丰富
- 招牌、海报、雨棚、街灯、植物较多
- 最具有“海边小镇主街”感觉

---

## INTEREST AREA — What shapes me?

包含：

- Arcade
- My Studio
- 少量兴趣环境节点

视觉逐渐变得：

- 更生活化
- 更松弛
- 植物增多
- 商业建筑减少
- 小店、住宅、工作室、个人物件增加

---

## FUTURE HILL — Where am I going?

包含：

- Future Hill
- Observatory

路线必须明确是：

> **UPHILL**

不是下坡。

通过视觉表达上山：

- 道路向右上方倾斜
- 建筑逐渐消失
- 护栏、石墙、花草、岩石增加
- 城镇密度降低
- 天空面积增加
- Observatory 位于高处终点

最终玩家骑到山顶，再步行进入 Observatory。

---

# 3. 最终美术方向

正式定义：

> **Bright Coastal GBA-inspired Pixel Art**

参考目标：

- 精致 GBA / 16-bit-inspired 场景
- 高质量现代 Indie Pixel Art
- 横版连续海边小镇
- 明亮、青春、清新、有活力
- 大量可读建筑变化
- 丰富但不嘈杂的环境细节
- 手工像素 Cluster，而不是矢量图像像素化

---

# 4. 色彩规范

必须延续原 MY WORLD 3D 方向的综合色彩。

## 主色

```text
Sky:
Bright Cyan / Aqua Blue

Sea:
Clear Teal Blue

Vegetation:
Fresh Muted Green
Deep Emerald Shadow

Buildings:
Warm Cream
Soft Off-white
Pale Gray-Green

Road:
Cool Blue-Gray

Windows / Deep Shadow:
Deep Navy / Charcoal Blue

Accent:
Muted Teal
Dusty Blue
Soft Coral
Muted Orange
Sunny Yellow
Dusty Red
```

## 情绪

```text
Bright
Fresh
Youthful
Coastal
Optimistic
Creative
Airy
```

## 禁止

```text
Sepia
Dirty Brown Retro Palette
Dark DOS Palette
Heavy CRT
Strong Scanlines
RGB Split
Neon Cyberpunk
Washed-out Corporate Pastel
Flat Vector Illustration
```

GBA 是“绘制语言”，不是“旧显示器滤镜”。

---

# 5. 像素规格

内部逻辑分辨率：

```text
640 × 360
```

浏览器：

```text
Nearest Neighbor Scaling
pixelArt: true
antialias: false
```

推荐资产尺度：

```text
Creator Character: 48–64 px 高
Bike + Rider: 64–80 px 高
Small Props: 24–64 px
Tree: 80–160 px
Normal Building: 160–280 px
Hero Building: 220–360+ px
```

不追求严格 GBA 240×160。

目标是：

> GBA-inspired，而不是硬件复刻。

---

# 6. 场景构成

不以巨大远景 Parallax 为核心。

主要视觉信息来自玩家所在的“当前街道与建筑”。

场景基本层级：

```text
Layer 1 — Sky / Simple Clouds
Layer 2 — Immediate Background / Sea / Nearby Hills
Layer 3 — Buildings / Trees / Urban Scene
Layer 4 — Sidewalk / Road / Interactive World
Layer 5 — Player / Bike
Layer 6 — Occasional Foreground Props
```

可以有轻量 Parallax，但禁止让远景抢走建筑和地标。

核心视觉节奏：

> **建筑变化 → 街区变化 → 环境变化 → 山路变化**

---

# 7. 区域美术语法

## 01 ENTRANCE

作用：

- Welcome to MY WORLD
- 第一次建立海边、骑行、创作世界感

元素：

- Sea
- Low wall
- Flowers
- Sign: MY WORLD
- Bike path
- Small gate / stone entrance
- Direction sign

情绪：

> Journey begins.

---

## 02 CENTRAL PLAZA

作用：

- 世界导航中心
- 第一次空间展开

元素：

- Fountain
- Benches
- Main MY WORLD signage
- Clock tower / small civic landmark
- Trees
- Direction boards
- Bikes / plants / posters

不承担作品详情。

---

## 03 PRINT HOUSE

代表：

- Writing
- Narrative
- Content
- Copy
- Editing

视觉：

- Small creative print shop
- Posters
- Paper / books
- Window display
- Warm cream facade
- Muted red/orange accent sign

Interaction:

```text
E · READ
```

---

## 04 BRAND & CREATIVE MUSEUM

代表：

- Brand
- Strategy
- Creative
- Campaign

视觉：

- Small contemporary gallery
- Cream facade
- Large windows
- Exhibition poster
- Slightly more designed / curated than surrounding town

Interaction:

```text
E · VIEW
```

---

## 05 MARC CINEMA

代表：

- Film
- Direction
- Visual Storytelling
- AI Video

视觉必须为核心 Hero Building：

- Warm cream facade
- Muted teal / cyan canopy
- Coral / orange-red MARC CINEMA sign
- Deep blue-gray entrance
- Poster frames
- Small plants
- Lamps
- Roof details

Interaction:

```text
E · WATCH
```

---

## 06 EXPERIMENT LAB

代表：

- Game
- Interaction
- Prototype
- Code
- AI Experiment

视觉：

- Light industrial creative workshop
- Pipes
- Workshop doors
- EXP. sign
- Posters
- Small equipment
- Still bright and friendly

Interaction:

```text
E · PLAY
```

---

## 07 ARCADE

进入 INTEREST AREA。

视觉：

- Strong blue facade
- Coral / orange ARCADE sign
- Game posters
- Small machines visible through windows
- More playful props

Interaction:

```text
E · PLAY
```

---

## 08 MY STUDIO

代表：

- About
- Photography
- Reading
- Music
- How I Work
- Current self

视觉：

- Small creative home / studio
- Plants
- Bike
- Work table visible through window
- Books
- Camera-related props
- Warm, personal, lived-in

Interaction:

```text
E · ENTER
```

---

## 09 FUTURE HILL

重要：

路线必须向右上方持续上坡。

视觉变化：

```text
Buildings ↓
Trees ↑
Flowers ↑
Rock ↑
Sky ↑
Urban Props ↓
```

出现：

- Stone retaining walls
- Guardrail
- Direction sign
- Flowers
- Roadside grass
- Viewing spots

文字可出现：

```text
HIGHER
FURTHER
A BRIGHTER YOU
```

但应克制。

---

## 10 OBSERVATORY

世界终点 Landmark。

位于真正的坡顶。

视觉：

- Dome
- White / cream walls
- Blue-gray roof
- Telescope
- Garden / lookout
- Wide sky
- Quiet atmosphere

Interaction:

```text
E · LOOK
```

内容：

- Future
- Learning
- Next
- To Be Made

最后不是“游戏结束”。

而是：

> **The journey continues.**

---

# 8. Player State Machine

```ts
type PlayerState =
  | 'RIDING'
  | 'PARKING'
  | 'WALKING'
  | 'INTERACTING'
```

可后续增加：

```text
MOUNTING
DISMOUNTING
```

但不影响 V1。

---

# 9. Riding

Controls：

```text
A / Left  = Ride Left
D / Right = Ride Right
E         = Park / Interact
ESC       = Close Overlay
```

Bike 使用 Arcade Movement。

需要：

```text
acceleration
deceleration
maxSpeed
direction
simple slope speed modifier
collision bounds
```

不做：

```text
real physics
balance simulation
falling
damage
stamina
racing
```

玩家主要体验：

> 横向旅行。

---

# 10. 上坡系统

Future Hill 需要简单坡度机制。

不做真实物理。

道路区域包含：

```ts
slopeFactor
```

例如：

```text
Flat:
1.0

Gentle Uphill:
0.85

Steeper Uphill:
0.7
```

只轻微降低 Bike 速度。

目的：

> 让“骑到山顶”有感觉，而不是增加困难。

---

# 11. Parking

每个主要 Landmark 都有：

```text
SlowZone
ParkingZone
ParkingAnchor
```

流程：

```text
Enter SlowZone
↓
降低 Bike Max Speed
↓
Enter ParkingZone
↓
E · PARK
↓
Bike 停靠到 ParkingAnchor
↓
Bike+Rider → Parked Bike + Walking Character
↓
WALKING
```

非 ParkingZone：

```text
Find a bike parking spot to dismount.
```

---

# 12. Walking

Controls：

```text
A / D = Walk
E = Interact
```

Walking 只服务建筑入口附近的小范围移动。

不做：

```text
Jump
Platforming
Combat
Sprint
Crouch
Parkour
```

玩家离开 Bike 的范围应控制较小，避免横版步行变成主要移动方式。

---

# 13. Return To Bike

靠近 Parked Bike：

```text
E · RIDE
```

执行：

```text
Walking Character hide
Parked Bike hide
Bike + Rider show
State = RIDING
```

V1 可用 0.2–0.4 秒简单过渡。

---

# 14. Character Art

Creator Avatar 固定：

```text
Blue-gray Cap
Dark Hair
Blue / Off-white Striped Shirt
Warm Off-white Inner Shirt
Slate-blue Shorts
Dark Crossbody Bag
Light Socks
Light Sneakers
```

Sprite：

```text
Idle
Walk
```

Walking：

```text
4 frames
```

Left / Right 允许镜像。

不做高成本 8-direction。

---

# 15. Bike Art

Bike + Rider 作为组合 Sprite。

动画：

```text
Bike_Idle
Bike_Ride
Bike_Brake
```

Ride：

```text
4 frames recommended
```

左右镜像。

必须读出：

```text
Two Wheels
Frame
Handlebar
Rider
Pedaling Legs
```

停车后使用独立：

```text
ParkedBike
```

---

# 16. Pixel Art 生产规范

所有正式资产必须是真正 Pixel Art。

禁止：

```text
Rectangle Building
Circle Tree
SVG-look
Flat Vector Illustration
Smooth Shape + pixelArt:true
Programmer Art as Final Asset
```

必须有：

```text
Deliberate Pixel Clusters
Stepped Edges
Pixel-level Highlight
Pixel-level Shadow
3–5 Tone Value Structure
Readable Silhouette
Small Controlled Details
```

建筑允许：

- Roof edge
- Window frame
- Door recess
- Awning
- AC
- Drainpipe
- Sign
- Plants
- Poster
- Roof equipment

但不要过度噪声。

原则：

> Rich but readable.

---

# 17. 环境资产 Kit

## Town Kit

```text
Cream Wall
Window
Door
Awning
Balcony
AC Unit
Drainpipe
Poster Frame
Shop Sign
Roof Tile
Small Chimney
```

## Street Kit

```text
Sidewalk
Road
Guardrail
Lamp
Utility Pole
Wire
Bench
Trash Bin
Road Sign
Bike Parking Sign
Planter
Vending Machine
```

## Nature Kit

```text
Tree A/B/C
Bush
Grass Cluster
Flower Cluster
Rock
Coastal Plant
Palm
```

## Future Hill Kit

```text
Stone Wall
Mountain Guardrail
Hill Road
Large Rock
Wildflower
Cypress / Tall Tree
Direction Sign
Observation Fence
```

---

# 18. Camera

Side-scrolling follow camera。

规则：

```text
Follow Player X
Soft Damp
Very Limited Y Following
Look-ahead in movement direction
```

Future Hill：

允许 Camera Y 随道路缓慢上升。

但整体仍然保持横版阅读。

禁止：

```text
Camera Shake
Free Camera
Zoom Spam
Rotation
```

---

# 19. Portfolio Overlay

核心原则：

> Pixel world负责探索，现代网页负责专业表达。

Portfolio Overlay 使用普通 React DOM。

不需要 Pixel 化。

Case Study：

```text
TITLE
ONE-LINER
CONTEXT
PROBLEM
INSIGHT
STRATEGY
IDEA
EXECUTION
MY ROLE
TOOLS
RESULT
```

Cinema 支持：

```text
Video
Storyboard
Gallery
```

Overlay 打开：

```text
Lock Phaser Input
State = INTERACTING
```

关闭：

```text
Return to WALKING
```

---

# 20. INDEX / INFO

正式版仍然保留：

```text
INDEX
INFO / CV
```

INDEX 是招聘方快速浏览模式。

不强迫所有用户玩完整世界。

支持：

```text
/project/:id
```

Deep Link。

---

# 21. Mobile

第一版 Mobile 不复制横版游戏控制。

Mobile 直接进入：

```text
Welcome
↓
INDEX
↓
Project
```

可以提供：

```text
VIEW WORLD PREVIEW
```

但完整 playable experience Desktop First。

---

# 22. Audio

V1：

```text
Sea
Wind
Birds
Bike Chain
Bike Tire
Town Ambience
Soft UI Sounds
```

音乐可晚些加入。

必须提供：

```text
SOUND ON / OFF
```

---

# 23. 数据结构

```ts
interface WorldLocation {
  id: string
  name: string
  zone: 'main-town' | 'interest-area' | 'future-hill'
  x: number
  parkingX: number
  interactionX: number
  action: 'READ' | 'VIEW' | 'WATCH' | 'PLAY' | 'ENTER' | 'LOOK'
  projectIds: string[]
}

interface PortfolioProject {
  id: string
  title: string
  subtitle?: string
  category: string
  role?: string
  context?: string
  problem?: string
  insight?: string
  strategy?: string
  idea?: string
  execution?: string
  tools?: string[]
  result?: string
  cover?: string
  gallery?: string[]
  video?: string
  locationId: string
}
```

World 与 Portfolio Content 必须 Data-driven。

---

# 24. 推荐项目结构

```text
src/
  app/
    App.tsx

  game/
    Game.ts

    scenes/
      BootScene.ts
      WorldScene.ts

    player/
      PlayerState.ts
      RidingController.ts
      WalkingController.ts

    bike/
      BikeController.ts

    parking/
      ParkingZone.ts

    interaction/
      InteractionZone.ts

    camera/
      SideScrollCamera.ts

    world/
      WorldSegment.ts
      WorldBuilder.ts

  portfolio/
    PortfolioOverlay.tsx
    ProjectView.tsx

  data/
    locations.ts
    projects.ts
    worldSegments.ts

  store/
    useWorldStore.ts

  styles/
```

---

# 25. 世界分段系统

虽然视觉是连续的，但代码上分 Segment。

```text
entrance
central-plaza
print-house
brand-museum
marc-cinema
experiment-lab
arcade
my-studio
future-hill
observatory
```

每段定义：

```ts
interface WorldSegment {
  id: string
  startX: number
  endX: number
  backgroundTheme: string
  assetSet: string[]
  locationId?: string
  slope?: number
}
```

这样方便：

- Lazy Load
- Art Replacement
- Debug
- 单独调整区域
- 性能优化

---

# 26. 开发阶段

## PHASE 01 — Foundation

完成：

- React Shell
- Phaser Boot
- Zustand bridge
- WorldScene
- PlayerState
- Save-free session state

---

## PHASE 02 — Final World Skeleton

一次性建立完整横轴结构：

```text
Entrance
→ Plaza
→ Main Town
→ Interest Area
→ Future Hill
→ Observatory
```

此阶段仍可使用临时图。

重点先锁：

- 世界长度
- 区域节奏
- Landmark 间距
- Future Hill 上坡长度

---

## PHASE 03 — Riding

完成：

- Bike movement
- Camera follow
- Slope factor
- Collision
- World bounds

---

## PHASE 04 — Parking / Walking

完成：

- SlowZone
- ParkingZone
- ParkingAnchor
- Walking
- Return-to-bike

---

## PHASE 05 — Interaction / Overlay

完成所有 Landmark 的统一：

```text
E · READ
E · VIEW
E · WATCH
E · PLAY
E · ENTER
E · LOOK
```

接 React Portfolio Overlay。

---

## PHASE 06 — Core Pixel Art Kit

制作：

- Creator
- Bike
- Generic buildings
- Road
- Sidewalk
- Trees
- Street props
- Future Hill nature kit

先建立统一 Art Bible。

---

## PHASE 07 — Main Town Art

完成：

- Entrance
- Central Plaza
- Print House
- Brand Museum
- MARC CINEMA
- Experiment Lab

---

## PHASE 08 — Interest Area Art

完成：

- Arcade
- My Studio
- Interest props
- Area transition

---

## PHASE 09 — Future Hill Art

完成：

- Uphill road
- Vegetation
- Stone walls
- Observatory
- Final lookout

---

## PHASE 10 — Real Portfolio Content

将真实：

- Writing
- Brand
- Film
- Game / Interaction
- About
- Future

放入 Overlay。

---

## PHASE 11 — Audio / Polish

完成：

- Ambient audio
- Prompts
- Transitions
- UI
- Pixel animation polish
- Minor environmental animation

---

## PHASE 12 — Performance / Release

完成：

- Sprite Atlas
- Lazy Loading
- WebP / PNG optimization
- Preload budget
- Desktop browser tests
- Mobile INDEX fallback
- Deployment
- Analytics

---

# 27. 当前执行顺序

从现在开始：

```text
1. Create project branch
2. Build full horizontal world skeleton
3. Implement complete Riding
4. Implement Parking / Walking
5. Implement Overlay
6. Lock Pixel Art Bible
7. Create Character + Bike
8. Create MARC CINEMA
9. Build Main Town
10. Build Interest Area
11. Build Future Hill
12. Replace placeholders
13. Add real portfolio content
14. Polish
15. Release
```

不再以“先测试一个小段”为目标。

直接朝完整产品推进，但仍按模块逐步验收。

---

# 28. P0 / P1

## P0 — 正式上线必须有

```text
Welcome
Index
Info / CV
Horizontal World
Bike
Parking
Walking
Interaction
Portfolio Overlay
All 7 Landmarks
Future Hill Uphill
Observatory
Real Portfolio Content
Desktop Release
Mobile INDEX
```

## P1 — 上线后增强

```text
Animals
More ambient animations
Additional interest nodes
Music player
More world props
Weather variants
Night visual experiment
Extra Bike skins
Screenshot / Postcard
```

---

# 29. 明确不做

V1 禁止：

```text
Combat
Jumping Platformer
Quest System
Inventory
Economy
Multiplayer
Achievements
Collectibles
Racing
Bike Upgrades
Real Bike Physics
Complex NPC AI
Full Interiors
Day / Night Runtime Cycle
Complex Weather
Account / Login
Cloud Save
```

---

# 30. 产品成功标准

## 10 秒

用户理解：

> 这是一个可以骑行探索的个人作品集。

## 30 秒

用户：

- 已经骑过至少一个明显 Landmark
- 知道可以停车
- 知道建筑代表作品内容

## 3 分钟

用户已经理解：

```text
What can I make?
What shapes me?
Where am I going?
```

并到达或看到 Future Hill / Observatory。

---

# 31. 最终项目一句话

> **MY WORLD is a bright coastal GBA-inspired playable portfolio where visitors ride a bicycle through a continuous side-scrolling creative world—from what I make, through what shapes me, toward where I am going.**
