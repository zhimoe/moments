# 部署与接入说明

本项目是纯静态站点，不需要 Node.js、数据库或服务器。推荐发布到 GitHub Pages，并使用 `moments.zhi.moe` 作为访问地址。

## 1. 仓库与自动发布

仓库地址规划为：

```text
https://github.com/zhimoe/moments
```

项目已经包含 `.github/workflows/pages.yml`。每次向 `main` 分支推送时，工作流会把仓库根目录作为完整站点发布。

首次创建仓库后，在 GitHub 完成一次设置：

1. 打开仓库的 **Settings → Pages**。
2. 在 **Build and deployment → Source** 中选择 **GitHub Actions**。
3. 打开仓库的 **Actions** 页面，确认 `Deploy family album to Pages` 成功。
4. 未配置子域名前，默认地址为：

   ```text
   https://zhimoe.github.io/moments/
   ```

项目中的图片、CSS 和 JavaScript 都使用相对地址，因此默认项目地址和自定义子域名都能正常工作。

## 2. 配置 `moments.zhi.moe`

建议先在 GitHub 设置自定义域名，再修改 DNS。

### 2.1 GitHub Pages 设置

1. 打开 `zhimoe/moments` 的 **Settings → Pages**。
2. 在 **Custom domain** 输入：

   ```text
   moments.zhi.moe
   ```

3. 点击 **Save**。

本项目使用 GitHub Actions 发布。该模式下，自定义域名以 GitHub Pages 设置为准，不依赖仓库中的 `CNAME` 文件。

### 2.2 DNS 设置

在 `zhi.moe` 当前使用的 DNS 服务商中增加：

| 类型 | 名称 | 目标 |
| --- | --- | --- |
| CNAME | `moments` | `zhimoe.github.io` |

注意：

- 目标中不要加入 `/album` 路径。
- 不要使用 `*.zhi.moe` 通配记录代替这一条记录。
- 如果使用 Cloudflare，建议先设为 **DNS only**，等 GitHub 的 HTTPS 证书签发成功后再决定是否开启代理。
- DNS 生效可能需要一段时间。

可以在终端检查：

```bash
dig moments.zhi.moe +short
```

结果应最终指向 `zhimoe.github.io`。

### 2.3 HTTPS

DNS 检查通过后回到 **Settings → Pages**：

1. 等待 GitHub 完成 DNS 检查并签发证书。
2. 勾选 **Enforce HTTPS**。
3. 访问 `https://moments.zhi.moe/` 验证。

建议在 GitHub 个人账号的 **Settings → Pages** 中验证 `zhi.moe` 域名，并保留 GitHub 给出的 TXT 记录，降低子域名被其他 Pages 项目占用的风险。

## 3. 在当前 Hugo 博客加入“相册”菜单

当前博客仓库的菜单配置位于：

```text
config/_default/menu.toml
```

在文件末尾增加：

```toml
[[main]]
name = "相册"
url = "https://moments.zhi.moe/"
weight = 5
```

然后在博客仓库中预览：

```bash
hugo server
```

确认顶部导航出现“相册”且链接正确后，提交并推送博客：

```bash
git add config/_default/menu.toml
git commit -m "feat: add family album to navigation"
git push
```

相册网站页脚已经包含“返回博客”链接，形成双向入口。

## 4. 日常更新相册

进入本仓库后：

```bash
cd moments
```

1. 将处理好的 WebP 图片放入 `assets/photos/`。
2. 在 `albums.js` 中新增照片或相册。
3. 本地预览：

   ```bash
   python3 -m http.server 4173
   ```

4. 浏览器访问 `http://127.0.0.1:4173/`。
5. 确认桌面和手机布局后提交：

   ```bash
   git add .
   git commit -m "content: add family photos"
   git push
   ```

推送后，GitHub Actions 会自动重新部署。

## 5. 照片处理建议

- 长边建议为 1600–2400px。
- WebP 质量建议为 80–86。
- 在发布前清除 GPS 等 EXIF 数据。
- 横图使用 `orientation: "landscape"`。
- 竖图使用 `orientation: "portrait"`。
- 方图使用 `orientation: "square"`。
- 不要将相机 RAW 文件或原始大图提交到仓库。

示例转换命令：

```bash
cwebp -q 84 input.jpg -o assets/photos/output.webp
```

## 6. 常见问题

### Actions 成功但页面是 404

检查 **Settings → Pages → Source** 是否为 **GitHub Actions**，然后重新运行最新的 Pages 工作流。

### 默认地址正常，子域名打不开

依次检查：

```bash
dig moments.zhi.moe +short
curl -I https://zhimoe.github.io/moments/
curl -I https://moments.zhi.moe/
```

确认 Pages 设置中的 Custom domain 是 `moments.zhi.moe`，DNS 的 CNAME 目标是 `zhimoe.github.io`。

### 浏览器仍显示旧样式

等待最新 Actions 工作流结束，再强制刷新浏览器。站点入口对 CSS 和 JavaScript 带有版本参数，可以降低旧缓存影响。

## 参考文档

- [GitHub Pages：配置发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub Pages：管理自定义域名](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages：验证自定义域名](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
