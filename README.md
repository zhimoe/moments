# 拾光集 · 家庭相册

一个无需数据库、可直接部署到 GitHub Pages 的静态家庭相册。设计采用“布面精装相册”概念，支持桌面双页和手机单页阅读。

## 本地预览

在当前目录启动任意静态文件服务器：

```bash
python3 -m http.server 4173
```

然后打开 `http://localhost:4173`。

## 更新相册

每册相册现在独立保存在 `albums/<相册 id>/`，照片和对应的 `album.js` 放在一起。原始照片可以是 JPG、PNG、TIFF 或 WebP；创建命令会完成转换、判断图片方向、生成配置并更新首页索引：

```bash
npm install
npm run album:create -- summer-2026 ~/Pictures/summer-2026
```

随后补全新 `album.js` 中留空的相册和照片说明，再检查并预览：

```bash
npm run albums:check
python3 -m http.server 4173
```

也可以在 `cover` 或任意照片的 `src` 中直接使用 HTTPS 图床 URL，并与本地图片混用。

完整步骤、配置示例和图床写法见 [ALBUM_WORKFLOW.md](ALBUM_WORKFLOW.md)。

阅读器始终使用 `object-fit: contain`，不会为了适应版式裁掉照片内容。桌面端显示双页，窄屏自动切换成单页。

## 图片建议

- 长边控制在 1600–2400px，网页展示已经足够。
- 本地照片统一由命令转换为 WebP，默认质量 84。
- 发布前移除 GPS 等 EXIF 信息。
- 不要把相机原始文件或数十 MB 的原图提交到 Git。

示例图片由 OpenAI 图像生成工具生成，仅用于演示布局；生成说明见 [PHOTO_NOTES.md](PHOTO_NOTES.md)。

## 部署

这个目录不依赖 Node.js 或构建步骤，已经包含 GitHub Pages 工作流。完整步骤见 [DEPLOYMENT.md](DEPLOYMENT.md)，其中包括：

- 首次启用 GitHub Pages
- 配置 `moments.zhi.moe` 子域名和 HTTPS
- 在现有 Hugo 博客中增加“相册”菜单
- 日常更新照片和触发部署
- DNS 与部署故障排查
