# 写实 GBA 机身素材

本轮使用 Codex 内置 imagegen 生成，未使用 CLI。参考用户提供的原版 GBA 照片，游戏内像素美术保持原样。三款透明 PNG 使用同一机位与布局；前端等比摆放、按实体轮廓遮罩，屏幕与按键热区由同一组坐标校准。

## 最终素材

- `public/media/hardware/gba-physical-classic-grey.png`
- `public/media/hardware/gba-physical-indigo.png`
- `public/media/hardware/gba-physical-gold.png`

## 生成提示词

### 机身与经典紫

Photorealistic product asset. Image 2, the actual front-facing gold console photograph, is the EXACT GEOMETRY reference. Reproduce that very same physical machine outline and proportions: its body is about 1.75 times wider than tall. Image 1 is ONLY a purple surface/color reference and is too flattened; do not use its wide short geometry. Produce a square-on front photograph of the Image 2 body, with the entire machine inside the frame on genuine transparent background. The shell is classic indigo/violet fine-stipple ABS and the buttons and shoulders pale warm grey as in Image 1. The D-pad arms have equal widths and the two round action buttons stay circular, not vertically or horizontally stretched. Match Image 2's original wide side grips, thick rounded black lens occupying 54% of body width, original rectangular LCD 43% of body width with 3:2 shape, authentic START/SELECT positions, speaker slots, embossed and printed factory markings. LCD is blank dark black. Body silhouette is 1.75 width/height and has the slightly tapered sides and bottom belly of Image 2. Render as a tangible original plastic object: resolved fine pebbled stipple, micro-roughness, moulded transitions, seam gaps, gently domed button caps, realistic recessed black lens seat and substantial sidewall, neutral softbox light from upper-left and natural soft fill. Frame is tall enough for the original body: leave small transparent margins around all edges. Do not clip the object. Absolutely preserve the physical proportions of Image 2 rather than stretching the whole Image 1 raster.

### 经典灰（以最终经典紫为编辑源）

Edit Image 1. Change ONLY its colorway to the grey GBA on the LEFT of Image 2. Neutral warm light grey fine-stipple ABS housing, black charcoal D-pad, yellow lower-left B button, red upper-right A button, green left shoulder and blue right shoulder. START and SELECT stay pale warm grey. Image 2 is only a color reference; do not include the controller or adopt its angled camera. Preserve EXACTLY the first image pixel dimensions, object position, outline, wide left and right grips, all button positions and circular shapes, dark LCD opening and thick black lens surround. Keep the same square-on front camera, fine physical plastic stipple, embossed factory markings, seam gaps, real button recess shadows, softbox lighting and alpha transparency. Do not stretch, recrop, rotate or change any geometry. This is only a material color substitution of the existing photo. 

### 香槟金（以最终经典紫为编辑源）

Edit Image 1. Change ONLY the purple shell color to the subdued champagne gold of Image 2. Fine subtle metallic flakes in satin gold ABS, not bright yellow or mirror chrome. All buttons and shoulder caps stay pale warm grey. Image 2 is only a color/material reference. Preserve EXACTLY the first image pixel dimensions, object position, outline, wide left and right grips, all button positions and circular shapes, dark LCD opening and thick black lens surround. Keep the same square-on front camera, fine physical plastic stipple, embossed factory markings, seam gaps, real button recess shadows, softbox lighting and alpha transparency. Do not stretch, recrop, rotate or change any geometry. This is only a material color substitution of the existing photo. 

## 显示与互动

保留细颗粒 ABS 塑料、黑色镜片的厚度、肩键、侧壳接缝、按钮底部投影与标识。照片不做拉伸或改写；SVG 轮廓遮罩只排除物体外的抠图杂点。原 LCD 内居中显示 16:9 游戏，不挤压世界、人物或弹窗。机身下沿的音量控件控制音乐、环境声、音效和视频；三种颜色可切换并保存偏好。

