# 作品内容接口（预留）

本轮提供统一内容模型与 HTTP 读取接口。管理后台、登录、文件上传、数据库和对象存储尚未实现。前台默认使用从用户提供的简历整理的占位内容，条目用 `source` 标明页码。详情见 `docs/resume-placement.md`。旧示例文件继续保留用于接口测试。

## 接入方式

复制 `.env.example` 为 `.env.local`，设置 `VITE_CONTENT_URL`，然后重启开发服务（部署时重新构建）。前台启动后会向该地址发送一次 GET，请求 JSON，成功后用返回的完整作品集合替换默认集合。

可以先用 `VITE_CONTENT_URL=/content/portfolio.example.json` 验证读取。这个文件包含所有示例数据，修改它不会改动房间、交互点或界面组件。接口异常或数据不符合模型时，保留本地默认内容，并在作品索引显示加载失败提示。

未来后台上传文件后，把可访问的图片/视频 URL 保存到作品记录中的 `cover` 或 `media`，通过同一接口返回即可。前台不依赖具体数据库或存储供应商。`VITE_` 变量会进入客户端代码，不能放服务端密钥。

## 响应结构

```json
{
  "version": 1,
  "entries": [
    {
      "id": "my-film-001",
      "kind": "film",
      "category": "短片",
      "title": "我的影片",
      "description": "影片简介",
      "locationId": "marc-cinema",
      "date": "2026.10.03",
      "duration": "3 分 24 秒",
      "cover": { "id": "poster-001", "type": "image", "url": "/uploads/poster.jpg", "alt": "影片海报" },
      "media": [{ "id": "video-001", "type": "video", "url": "/uploads/film.mp4", "poster": "/uploads/poster.jpg", "caption": "完整影片" }],
      "tags": ["短片"],
      "isSample": false
    }
  ]
}
```

必填：`id`（全局唯一）、`kind`、`category`、`title`、`description`、`media`（可为空数组）、`tags`（可为空数组）。可选字段不要填 `null`，无内容时省略。

可选：`subtitle`、`body`（纯文本，保留换行）、`englishTitle`、`date`、`duration`、`hours`（非负数）、`locationId`、`section`、`cover`、`demoUrl`、`caseStudy`、`isSample`、`source`、`status`、`fileSize`、`documentUrl`、`attachments`。`caseStudy` 为 `[{"heading":"背景","text":"项目背景"}]`。

媒体包含 `id`、`type`（`image` 或 `video`）、`url`，可选 `caption`、`alt`、`poster`。媒体、封面、poster、Demo、文档和附件 URL 使用相同校验：支持 HTTP(S)、`/` 开头的站内路径和 `./` 相对路径；拒绝危险协议、`//` 协议相对地址、反斜杠、空白、控制字符及带用户名/密码的 HTTP(S) 地址。图片和视频使用原文件比例，视频支持浏览器原生控制；媒体失效时显示明确提示。影院以 `media` 内的第一个视频为播放源。

## 场景映射

| kind | category | locationId | 呈现 |
| --- | --- | --- | --- |
| writing | tvc / brand / ecommerce / audience | print-house | 四个固定分类、项目简介、竖图组合与原图放大；TVC 影片入口 |
| brand | ip / art / brand / ecommerce | brand-museum | 四栏折页；轻文字入口直接打开完整案例大图与信息，左右切换项目 |
| film | 自由文本，如短片、广告、MV | marc-cinema | 电影票、票根播放与完整项目大图 |
| game-experience | journey | arcade | 第一台街机：全宽游戏经历列表，仅图片、名称与 hours |
| game-project | making | arcade | 第二台街机：游戏互动图与名称列表，直接完整项目大图 |
| hobby | photo / reading / vinyl / cycling / film | my-studio | 五类照片、书籍、唱片、骑行与电影展柜；选中后直接查看媒体 |
| experiment | film / game / interaction / brand / visual | experiment-lab | 左侧五类档案，右侧标题与简介，直接完整项目大图与资源 |
| general | 自由文本 | 其他有效地标 ID | 全览索引和通用详情 |

可设置 `VITE_CONTENT_URL=/content/portfolio.resume.json` 验证简历占位集合。

文字工坊预览只使用 `title`、`description`，右侧用带轻纸纹的底板。详情左侧展示图片，右上展示 `title` 与 `subtitle`，右下展示项目概述。非 TVC 优先读取 `caseStudy` 中“项目详情”或“项目概述”，其次读取真实 `body`；内容未补充时显示“项目详情待补充。”。TVC 使用 `description` 与“我的角色”的短概述，影片入口读取 `media` 内第一个有效视频；未提供视频则显示禁用的“影片待上传”，不将封面当成影片。

图片从 `cover` 和 `media` 合并，按 URL 去重。依据首张图片的自然比例，非 TVC 竖图最多三张紧密并排；左右按钮、A / D 和触摸横滑连续移动组合，末尾环绕，横图单张显示。每张图仍可独立放大看原图，左下角只保留轻文字提示。`section` 可继续保留为数据元信息，当前文字工坊不据此过滤项目；资料出处 `source` 不在其详情中显示。W / S 切分类，A / D 切项目；进入详情后 A / D 切图，W / S 阅读右侧概述，J 放大，K / ESC 逐层返回。

品牌馆封面和小字“查看案例”均直接进入同一层完整案例查看器，不经过通用详情页。查看器合并 `cover` 与 `media`、按 URL 去重，完整展示全部作品图片并保留原始比例；长图纵向滚动。右侧同步展示项目名称、简介与已有项目说明，不显示 `source` 页码或媒体的简历图说明。A / D、← / → 或外侧前后按钮按内容集合的顺序循环切换品牌案例，跨分类时同步更新四栏中的分类和项目；W / S 阅读完整图片，K / ESC 返回品牌折页，焦点回到入口。

影院票面只显示 `title`、`category` 和作为上映日期的 `date`；未知日期留空，前台显示待补充。右侧独立票根包含播放入口，读取 `media` 内第一个视频；未上传时禁用并提示影片待上传。淡三角或 A / D 循环切换影片，J 播放。票面右下角“作品详情”直接打开完整项目大图与介绍，不再出现中间详情或子菜单。该层合并 `cover` 与全部 `media`，按 URL 去重、保留原图比例，右侧显示介绍、正文与 `caseStudy`；重复的简介不会再显示一遍。A / D 切换完整项目，W / S 阅读，K / ESC 返回当前电影票并恢复入口焦点。播放器中的 K 返回电影票，外侧关闭退出面板；票内不增加返回放映室或再看一部按钮。

游戏厅两台街机分别以 `journey` 和 `making` 上下文打开固定的游戏经历 / 游戏互动集合；弹窗内不再放分类切换按钮。经历行使用小图、`title` 与 `hours`，未提供时长则显示待补充，不另开右侧预览或详情。互动行只显示小图与名称，点击整行或 J 直接进入完整大图与介绍。两种列表在当前游戏尺寸中同时显示至少三项，W / S 选择并滚动；仅通过外侧关闭或 K / ESC 退出面板。互动大图合并 `cover` 与 `media`、按 URL 去重、保留原图比例，A / D 切项目，W / S 阅读，K / ESC 回列表。已有的有效 `demoUrl` 在完整介绍中直接打开；不添加未提供的 Demo。

没有实际视频或 Demo URL 时，播放按钮会明确显示待添加并禁用。没有图片时，显示程序绘制的像素示意图。依据真实资料的作品请将 `isSample` 设为 `false`。`source` 可记录资料出处，例如 `"简历第5页"`；作品信息仍可有待补充项。上传后的大图可先由后台生成小封面，原图保留在 `media`。

## 实验室日志

`kind: "experiment"` 的 `category` 必须为五个分类之一。记录可包含 `status`（`in-progress` / `completed` / `planned`，对应进行中 / 已归档 / 计划中），`fileSize`（展示文本，例如 `"12.4 MB"`），`documentUrl`（原始文档地址），以及 `attachments`（`[{"id":"source-001","title":"原型源文件","url":"/uploads/prototype.zip"}]`）。附件 ID 在同一条记录内唯一，标题不能为空；未提供的可选字段直接省略。

```json
{
  "id": "experiment-film-001",
  "kind": "experiment",
  "category": "film",
  "title": "海风片段 · 镜头测试",
  "description": "记录环境声与镜头节奏的测试。",
  "body": "实验目标、方法、观察与下一步。",
  "locationId": "experiment-lab",
  "date": "2026.10.02",
  "status": "in-progress",
  "fileSize": "12.4 MB",
  "documentUrl": "/uploads/shot-test.pdf",
  "attachments": [{"id":"source-001","title":"镜头测试源文件","url":"/uploads/shot-test.zip"}],
  "media": [],
  "tags": ["影像", "测试"],
  "isSample": false
}
```

实验室左侧五类档案柜、同类多条记录与滚动保持，点击或 W / S、↑ / ↓ 切换。右侧只使用 `title`、`description` 的首句和一个“查看详情”入口；预览不再放封面、标签、日期、状态、文件大小或多组操作。点击入口或 J 直接进入完整项目大图，不经过日志子菜单。完整层显示全部原始图片与视频、完整 `description`、`body` 与 `caseStudy`。有效 `documentUrl`、`attachments` 和 `demoUrl` 在同层以直接链接呈现，无额外附件清单子菜单；未提供的资源不生成虚假入口。A / D 切换项目，W / S 阅读，K / ESC 返回当前档案并恢复焦点。顶层关闭后保持当前实验室内景，空实验集合显示空态。

旧示例文件中的五条实验日志全部为 `isSample: true`，不代表真实项目完成情况、文件大小或播放素材。默认集合现使用三条依据简历的过程档案占位，不填未确认的状态、日期或文件大小。原有实验室的通用案例已从默认示例集合移除，避免双重内容入口。

## 后续后台边界

后台负责身份认证、上传权限、文件大小和类型验证、持久保存、分类、排序与发布。GET 内容接口供访客读取已发布作品；管理写入接口与上传接口在后续后台阶段实现。跨域内容接口和媒体存储需允许网站访问；视频服务需正确返回媒体类型并支持播放所需的范围请求。

前台接口定义位于 `src/data/contentTypes.ts`，HTTP 校验与加载位于 `src/content/contentRepository.ts`，各场景 UI 和全览索引共用 `src/store/useContentStore.ts`。保持 `version: 1` 结构即可替换内容。`status` 与 `fileSize` 仅用于前台展示；后台后续需提供真实文件大小与发布状态，不能把客户端显示文本当作上传验证。

兴趣工作室的架子由 `cover` 与 `media` 生成。照片与骑行展示各媒体，书籍 / 唱片 / 电影每项展示一个封面，其余媒体在原图层切换。缺少媒体时保留禁用空框；无条目时显示空展柜。旧 `games` / `figures` 数据仍可读取，但不在兴趣馆导航或热点中展示，不会删除存储内容。后台仍只有内容读取接口，没有上传或管理页面。
