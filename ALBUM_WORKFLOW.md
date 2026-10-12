# 相册更新说明

现在每册相册都是一个独立目录，不再集中修改一个很长的 `albums.js`：

```text
albums/
├── index.js                 # 命令自动生成，不要手改
└── summer-2026/
    ├── album.js             # 这一册的标题、说明和照片信息
    ├── beach-01.webp
    └── beach-02.webp
```

## 第一次使用

需要 Node.js 20 或更高版本。先在项目目录运行：

```bash
npm install
```

这一步没有需要安装的前端依赖，同时会启用项目的提交前检查。照片转换使用 `cwebp`，macOS 可通过 Homebrew 安装：

```bash
brew install webp
```

## 新建一册相册

原始照片无需提前转成 WebP。假设照片在 `~/Pictures/summer-2026`：

```bash
npm run album:create -- summer-2026 ~/Pictures/summer-2026
```

命令会自动完成：

1. 在 `albums/summer-2026/` 创建独立目录。
2. 将 JPG、JPEG、PNG、TIFF 转为质量 84 的 WebP；已有 WebP 直接复制。
3. 根据图片尺寸填写 `landscape`、`portrait` 或 `square`。
4. 创建 `album.js`，并把照片加入 `photos`。
5. 更新 `albums/index.js`，让首页出现这册相册。

原始照片不会被删除或修改。文件按名称排序，排序不合适时可以在生成的 `photos` 数组里手动调整顺序。

也可以不提供照片目录，只创建空相册：

```bash
npm run album:create -- summer-2026
```

## 补全相册说明

新生成的 `album.js` 会故意保留空字段。至少需要填写：

- 相册的 `number`、`title`、`subtitle`、`date`、`tone`、`intro`
- 每张照片的 `alt`、`caption`、`meta`

`cover` 默认使用第一张照片，可以改成同目录中的其他照片。`tone` 当前已有 `moss`、`ocean`、`clay` 三种样式。

配置示例：

```js
const photo = (name) => new URL(name, import.meta.url).href;

export default {
  id: "summer-2026",
  number: "04",
  title: "海边的一天",
  subtitle: "风很轻，浪花刚好漫过脚背",
  date: "2026 · SUMMER",
  tone: "ocean",
  cover: photo("beach-01.webp"),
  intro: "这个夏天，我们在海边慢慢走了一天。",
  photos: [
    {
      src: photo("beach-01.webp"),
      orientation: "landscape",
      alt: "一家人在海边散步",
      caption: "沿着浪花往前走。",
      meta: "七月 · 海边"
    }
  ]
};
```

`alt` 用来描述照片画面，方便无障碍阅读；`caption` 是页面上的照片文字；`meta` 适合填写时间和地点。

## 使用图床 URL

`cover` 和任意照片的 `src` 都可以直接使用图床地址，本地照片和图床照片也可以混用：

```js
export default {
  // ...其他字段
  cover: "https://images.example.com/family/cover.jpg",
  photos: [
    {
      src: "https://images.example.com/family/beach-01.jpg",
      orientation: "landscape",
      alt: "一家人在海边散步",
      caption: "沿着浪花往前走。",
      meta: "七月 · 海边"
    },
    {
      src: photo("beach-02.webp"),
      orientation: "portrait",
      alt: "孩子在晚霞中看海",
      caption: "太阳落下去了。",
      meta: "七月 · 傍晚"
    }
  ]
};
```

图床图片不要求是 WebP，但建议使用 HTTPS、开启长期缓存，并确认图床允许外链。命令只校验 URL 写法，不会在提交时访问图床，因此图床临时不可用不会阻塞提交。

## 检查、预览和提交

填写完成后运行：

```bash
npm run albums:check
python3 -m http.server 4173
```

访问 `http://127.0.0.1:4173/` 预览。检查会拒绝以下情况：

- 相册或照片的说明字段为空
- `id` 与目录名不同，或册号重复
- 本地图片不存在、不是 WebP，或者有图片忘记写入配置
- 图片方向不是 `landscape`、`portrait`、`square` 之一
- 自动索引没有同步

如果手动新增、删除或重命名了相册目录，先运行：

```bash
npm run albums:sync
```

正常提交时 `.githooks/pre-commit` 会针对**待提交的文件版本**再次执行完整检查；有空说明时提交会被中止。GitHub Pages 发布流程也有同样的检查，未通过就不会上线。

如果换了电脑或重新克隆仓库，只需再运行一次 `npm install`，即可重新启用提交前检查。
