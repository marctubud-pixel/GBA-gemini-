# 作品内容接口（预留）

本轮提供统一内容模型与 HTTP 读取接口。管理后台、登录、文件上传、数据库和对象存储尚未实现。前台默认使用明确标注的示例内容。

## 接入方式

复制 `.env.example` 为 `.env.local`，设置 `VITE_CONTENT_URL`，然后重启开发服务（部署时重新构建）。前台启动后会向该地址发送一次 GET，请求 JSON，成功后用返回的完整作品集合替换示例集合。

可以先用 `VITE_CONTENT_URL=/content/portfolio.example.json` 验证读取。这个文件包含所有示例数据，修改它不会改动房间、交互点或界面组件。接口异常或数据不符合模型时，保留示例内容，并在作品索引显示加载失败提示。

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

可选：`subtitle`、`body`（纯文本，保留换行）、`englishTitle`、`date`、`duration`、`hours`（非负数）、`locationId`、`section`、`cover`、`demoUrl`、`caseStudy`、`isSample`。`caseStudy` 为 `[{"heading":"背景","text":"项目背景"}]`。

媒体包含 `id`、`type`（`image` 或 `video`）、`url`，可选 `caption`、`alt`、`poster`。URL 支持 HTTP(S)、`/` 开头的站内路径和 `./` 相对路径。图片和视频使用原文件比例，视频支持浏览器原生控制；媒体失效时显示明确提示。影院以 `media` 内的第一个视频为播放源。

## 场景映射

| kind | category | locationId | 呈现 |
| --- | --- | --- | --- |
| writing | tvc / brand / ecommerce / audience | print-house | 双页书册；section 为 IDEA / WORDS / LIFE，省略默认 WORDS |
| brand | ip / art / brand / ecommerce | brand-museum | 四栏折页与各自案例 |
| film | 自由文本，如短片、广告、MV | marc-cinema | 票根、影片信息与播放器 |
| game-experience | journey | arcade | 游戏经历与 hours |
| game-project | making | arcade | 游戏制作与 demoUrl |
| hobby | photo / reading / vinyl / games / cycling / film / figures | my-studio | 七分类展柜、多媒体与收藏笔记 |
| general | 自由文本 | 其他有效地标 ID | 全览索引和通用详情 |

没有实际视频或 Demo URL 时，播放按钮会明确显示待添加并禁用。没有图片时，显示程序绘制的像素示意图。正式作品请将 `isSample` 设为 `false`。上传后的大图可先由后台生成小封面，原图保留在 `media`。

## 后续后台边界

后台负责身份认证、上传权限、文件大小和类型验证、持久保存、分类、排序与发布。GET 内容接口供访客读取已发布作品；管理写入接口与上传接口在后续后台阶段实现。跨域内容接口和媒体存储需允许网站访问；视频服务需正确返回媒体类型并支持播放所需的范围请求。

前台接口定义位于 `src/data/contentTypes.ts`，HTTP 校验与加载位于 `src/content/contentRepository.ts`，五类 UI 和全览索引共用 `src/store/useContentStore.ts`。保持 `version: 1` 结构即可替换内容。
