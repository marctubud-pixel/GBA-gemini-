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
| writing | tvc / brand / ecommerce / audience | print-house | 双页书册；section 为 IDEA / WORDS / LIFE，省略默认 WORDS |
| brand | ip / art / brand / ecommerce | brand-museum | 四栏折页与各自案例 |
| film | 自由文本，如短片、广告、MV | marc-cinema | 票根、影片信息与播放器 |
| game-experience | journey | arcade | 游戏经历与 hours |
| game-project | making | arcade | 游戏制作与 demoUrl |
| hobby | photo / reading / vinyl / games / cycling / film / figures | my-studio | 七分类展柜、多媒体与收藏笔记 |
| experiment | film / game / interaction / brand / visual | experiment-lab | 五类彩色实验档案、日志正文、文档、附件和视频 / Demo |
| general | 自由文本 | 其他有效地标 ID | 全览索引和通用详情 |

可设置 `VITE_CONTENT_URL=/content/portfolio.resume.json` 验证简历占位集合。

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

实验室左侧按五类列出日志，点击记录或按 ↑↓ 切换。查看文档 / J 打开同面板内的日志正文，再由文档地址打开原文件；打开附件显示可选择的文件清单；K / ESC 逐层返回，顶层关闭后恢复小镇。没有附件时按钮禁用，没有实际视频或 Demo 时 Play 禁用。日志正文仍可阅读；原始文档未上传时明确显示待添加。远程接口返回多个同类日志时逐条列出，空实验集合显示空态。

旧示例文件中的五条实验日志全部为 `isSample: true`，不代表真实项目完成情况、文件大小或播放素材。默认集合现使用三条依据简历的过程档案占位，不填未确认的状态、日期或文件大小。原有实验室的通用案例已从默认示例集合移除，避免双重内容入口。

## 后续后台边界

后台负责身份认证、上传权限、文件大小和类型验证、持久保存、分类、排序与发布。GET 内容接口供访客读取已发布作品；管理写入接口与上传接口在后续后台阶段实现。跨域内容接口和媒体存储需允许网站访问；视频服务需正确返回媒体类型并支持播放所需的范围请求。

前台接口定义位于 `src/data/contentTypes.ts`，HTTP 校验与加载位于 `src/content/contentRepository.ts`，各场景 UI 和全览索引共用 `src/store/useContentStore.ts`。保持 `version: 1` 结构即可替换内容。`status` 与 `fileSize` 仅用于前台展示；后台后续需提供真实文件大小与发布状态，不能把客户端显示文本当作上传验证。
