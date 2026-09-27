# MY WORLD — Bright Coastal GBA 正式开发启动提示词

```text
请从现在开始把 MY WORLD 的正式实现方向切换为：

Bright Coastal GBA-inspired Side-scrolling Playable Portfolio

这不是测试 Demo，而是正式产品开发。

不要删除现有 3D 项目；将其保留作为归档分支。新实现使用独立分支 / 目录推进。

【最终产品】

MY WORLD 是一个横向连续展开的个人创作世界。

玩家从入口开始骑自行车，一路向右穿过：

ENTRANCE
→ CENTRAL PLAZA
→ PRINT HOUSE
→ BRAND & CREATIVE MUSEUM
→ MARC CINEMA
→ EXPERIMENT LAB
→ ARCADE
→ MY STUDIO
→ FUTURE HILL
→ OBSERVATORY

整个世界主要沿 X 轴展开，不做自由地图迷路。

Future Hill 必须表现为向右上方持续上坡，Observatory 位于山顶终点。

【技术栈】

使用：

Vite
React
TypeScript
Phaser 3
Zustand
React DOM Overlay

不要使用 Three.js 作为世界运行时。

Desktop Web First。

游戏内部逻辑分辨率：

640 × 360

Phaser：

pixelArt: true
antialias: false

浏览器使用 nearest-neighbor scaling。

【美术方向】

目标：

Bright Coastal GBA-inspired Pixel Art

不是廉价 8-bit。
不是 Flat Vector Illustration。
不是 Rectangle / Circle Programmer Art。

正式资产必须具有：

deliberate pixel clusters
stepped pixel edges
3–5 tone shading
pixel highlights
pixel shadows
clear silhouettes
rich but readable details
handcrafted sprite feeling

综合色彩：

Bright Cyan / Aqua Sky
Clear Teal-blue Sea
Fresh Muted Green
Warm Cream / Soft Off-white Buildings
Cool Blue-gray Road
Deep Blue-gray Windows
Muted Teal
Dusty Blue
Soft Coral
Muted Orange
Sunny Yellow
Dusty Red
Charcoal shadows

整体必须：

bright
fresh
youthful
coastal
optimistic
creative

不要 Sepia。
不要 Dark DOS Palette。
不要强 CRT。
不要强扫描线。
不要 RGB Split。

【世界结构】

建立一个连续横轴世界。

推荐总长度先按约 8000–12000 px 组织。

代码内部按 WorldSegment 分段：

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

视觉连续，但逻辑分段，便于 Lazy Load、Debug 与替换美术。

【区域设计】

Entrance：
海边入口、MY WORLD 标志、花草、护栏。

Central Plaza：
喷泉、长椅、树、方向牌、Clock Tower / civic landmark。

Print House：
小型创意印刷店，海报、书、橱窗。
交互：E · READ

Brand & Creative Museum：
小型现代创意展馆，大窗、海报。
交互：E · VIEW

MARC CINEMA：
Hero Building。
Warm Cream facade
Muted Teal / Cyan canopy
Coral / Orange-red MARC CINEMA sign
Deep Blue-gray entrance
Poster frames
plants / lamps / roof details
交互：E · WATCH

Experiment Lab：
明亮创意实验室，少量管道、设备、EXP. Sign。
交互：E · PLAY

Arcade：
Blue facade + Coral/Orange ARCADE sign，游戏氛围更活泼。
交互：E · PLAY

My Studio：
更生活化，有植物、桌子、书、相机、自行车、个人物件。
交互：E · ENTER

Future Hill：
必须持续上坡。
Buildings 减少。
Trees / Flowers / Rocks 增加。
出现 Stone Wall、Guardrail、Direction Sign。
Bike 上坡轻微减速。

Observatory：
必须在坡顶。
Cream observatory + blue-gray dome + telescope + lookout。
交互：E · LOOK

【Player State】

至少：

RIDING
PARKING
WALKING
INTERACTING

【Bike】

Controls：

A / Left = Ride Left
D / Right = Ride Right
E = Park / Interact
ESC = Close Overlay

Bike 使用 Arcade Movement。

实现：

acceleration
deceleration
maxSpeed
direction
simple collision
slopeFactor

不要真实 Bicycle Physics。

Future Hill 根据坡度降低最高速度，但不能让玩家觉得困难。

【Camera】

横版 Follow Camera。

主要跟随 X。
Y 只随地形缓慢变化。

加入轻微 Look-ahead：
向右骑时 Camera 略微向右提前。
向左骑反之。

禁止自由相机、Camera Shake、旋转。

【Parking】

每个主要 Landmark 配置：

SlowZone
ParkingZone
ParkingAnchor
InteractionZone

进入 SlowZone：
降低 Bike Max Speed。

ParkingZone：
显示 E · PARK。

按 E：
Bike 对齐 ParkingAnchor。
Bike+Rider 隐藏。
显示 Parked Bike。
显示 Walking Character。
State → WALKING。

非 ParkingZone 禁止下车。

【Walking】

A / D = Walk
E = Interact

不要 Jump。
不要 Platforming。
不要 Combat。

步行只用于建筑附近短距离互动。

靠近 Parked Bike：

E · RIDE

按 E 后恢复 RIDING。

【Interaction】

统一行为：

READ
VIEW
WATCH
PLAY
ENTER
LOOK

只有 WALKING 状态可以触发 Landmark Interaction。

【Portfolio Overlay】

世界由 Phaser 运行。

作品内容必须由 React DOM Overlay 呈现。

不要在 Phaser 中制作 Case Study UI。

Overlay 支持：

Title
One-liner
Context
Problem
Insight
Strategy
Idea
Execution
Role
Tools
Result
Gallery
Video

打开 Overlay：
锁定 Phaser Input。
State → INTERACTING。

ESC / Close：
关闭 Overlay。
恢复 WALKING。

【Character】

Creator Avatar：

Blue-gray cap
dark hair
blue/off-white striped shirt
slate-blue shorts
dark crossbody bag
light socks
light sneakers

正式 Pixel Sprite 约 48–64 px 高。

Walking：
Idle + Walk
Walk 4 frames
Left / Right mirror allowed

【Bike Art】

Bike + Rider 作为组合 Sprite。

正式动画：

Idle
Ride
Brake

Ride 建议 4 frames。

停车后使用独立 ParkedBike Sprite。

【资产生产】

建立统一 Sprite / Tileset 接口。

不要让 Scene 依赖程序化 Rectangle / Circle 作为正式美术。

Placeholder 可以存在，但必须可以直接替换成：

PNG
WebP
Sprite Sheet
Texture Atlas

建立至少以下 Kit：

Town Kit
Street Kit
Nature Kit
Future Hill Kit

【数据驱动】

WorldLocation、WorldSegment、PortfolioProject 都必须 Data-driven。

不要在 WorldScene 内硬编码项目内容。

【INDEX / INFO】

React 层继续保留：

WELCOME
INDEX
INFO / CV

INDEX 是招聘方快速浏览入口。

支持 Deep Link：

/project/:id

【Mobile】

Desktop 是完整 Playable Experience。

Mobile 第一版直接进入 INDEX / Project 浏览，不做虚拟摇杆。

【开发阶段】

按以下顺序执行：

PHASE 01
React + Phaser Foundation

PHASE 02
完整 Horizontal World Skeleton

PHASE 03
Bike + Camera + Slope

PHASE 04
Parking + Walking + Return-to-bike

PHASE 05
统一 Landmark Interaction + React Overlay

PHASE 06
Pixel Art Core Kit + Art Bible

PHASE 07
Main Town Final Art

PHASE 08
Interest Area Final Art

PHASE 09
Future Hill + Observatory Final Art

PHASE 10
Real Portfolio Content

PHASE 11
Audio + UI + Animation Polish

PHASE 12
Optimization + Mobile INDEX + Release

【当前第一轮执行】

请现在开始 PHASE 01–03。

第一轮需要做到：

1. 检查当前仓库
2. 建立新的正式 GBA 分支结构
3. 保留现有项目，不破坏旧版本
4. 建立 React / Phaser / Zustand 基础桥接
5. 建立完整 WorldSegment 数据结构
6. 建立 Entrance → Observatory 的完整横轴 Greybox
7. Future Hill 明确向右上方上坡
8. 实现 Bike 横向移动
9. 实现 slopeFactor
10. 实现 Side-scroll Camera + Look-ahead
11. 运行 build / typecheck
12. 修复全部错误

本轮可以继续使用 Placeholder，但代码必须为之后替换正式 Pixel Art 做好 Sprite / Atlas 接口。

【本轮 Acceptance Criteria】

- [ ] 新正式分支可独立运行
- [ ] 旧 3D / Pixel 版本未被破坏
- [ ] Welcome 可以进入新横版世界
- [ ] 世界从 Entrance 连续延伸到 Observatory
- [ ] 所有 10 个 WorldSegment 已建立
- [ ] Future Hill 是明确的持续上坡
- [ ] Observatory 位于最终坡顶
- [ ] Bike 可左右骑行
- [ ] acceleration / deceleration 正常
- [ ] slopeFactor 正常
- [ ] Camera Smooth Follow 正常
- [ ] Camera Look-ahead 正常
- [ ] 无地图卡死区域
- [ ] World / Location 数据不写死在 Scene
- [ ] npm build / typecheck 通过
- [ ] Console 无阻塞性 Error

【正式 V1 不做】

Combat
Jump Platforming
Quest
Inventory
Economy
Multiplayer
Achievement
Collectibles
Bike Racing
Bike Upgrade
Real Bike Physics
Complex NPC
Full Interior
Account
Login
Cloud Save

请先给出：
1. 当前仓库检查结果
2. 实施计划
3. 准备新增 / 修改的文件

然后直接开始开发，不需要再次询问确认。
```
