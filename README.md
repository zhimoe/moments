# 拾光集 · 家庭相册

一个无需数据库、可直接部署到 GitHub Pages 的静态家庭相册。设计采用“布面精装相册”概念，支持桌面双页和手机单页阅读。

## 本地预览

在当前目录启动任意静态文件服务器：

```bash
python3 -m http.server 4173
```

然后打开 `http://localhost:4173`。

## 更换照片

1. 将经过压缩的照片放入 `assets/photos/`。
2. 编辑 `albums.js`，新增或修改相册对象。
3. 为每张照片填写正确的 `orientation`：
   - `landscape`：横图
   - `portrait`：竖图
   - `square`：正方形

阅读器始终使用 `object-fit: contain`，不会为了适应版式裁掉照片内容。桌面端显示双页，窄屏自动切换成单页。

## 新增相册

复制 `albums.js` 中任意一个相册对象，至少修改：

- `id`：唯一英文标识
- `number`：册号
- `title`、`subtitle`、`date`
- `tone`：目前支持 `moss` 与 `ocean`；也可在 CSS 中添加新布面颜色
- `cover`：封面照片
- `photos`：照片、说明与原始方向

## 图片建议

- 长边控制在 1600–2400px，网页展示已经足够。
- 推荐 WebP，质量 80–86。
- 发布前移除 GPS 等 EXIF 信息。
- 不要把相机原始文件或数十 MB 的原图提交到 Git。

示例图片由 OpenAI 图像生成工具生成，仅用于演示布局；生成说明见 [PHOTO_NOTES.md](PHOTO_NOTES.md)。

## 部署

这个目录不依赖 Node.js 或构建步骤，已经包含 GitHub Pages 工作流。完整步骤见 [DEPLOYMENT.md](DEPLOYMENT.md)，其中包括：

- 首次启用 GitHub Pages
- 配置 `album.zhi.moe` 子域名和 HTTPS
- 在现有 Hugo 博客中增加“相册”菜单
- 日常更新照片和触发部署
- DNS 与部署故障排查
