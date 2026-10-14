# 项目说明

这是 Virace 的 GitHub 个人主页仓库，入口是根目录 `README.md`，本地展示素材放在 `assets/`。

- README 使用 GitHub 支持的 Markdown 和少量 HTML；图片使用仓库相对路径，不依赖外部动态卡片服务。
- 卡片采用像素窗口样式，有浅色与深色两套 SVG，通过 `picture` 切换。`scripts/cards.mjs` 管理随手记和最新文章的样式，`profileStyle` 指定当前样式；贡献日历已取消。
- `scripts/update-profile.mjs` 从 `https://x-item.com/rss.xml` 按发布日期选取最新文章，同步标题、日期、链接和替代文字。先校验所有输入再写入，有变化才保存。
- 个人介绍只使用用户已确认的信息；项目说明以对应仓库的真实 README 为依据。
- 本地需要 Node.js 24+，执行 `npm ci --ignore-scripts`、`npm run update:profile` 更新卡片。也可通过 `--feed <RSS文件>` 复用真实数据样本；RSS 读取无需登录。
- 修改后运行 `node --check scripts/update-profile.mjs`、`node --check scripts/cards.mjs` 和 `git diff --check`，通过本地 Markdown 预览核对图片、排版和链接，并检查窄屏与浅色、深色显示。
- `.github/workflows/profile-cards.yml` 每月 1 日 09:17（Asia/Hong_Kong，cron 使用 UTC）自动更新一次，也支持手动运行和脚本变更触发；只保存两张卡片的浅色、深色素材与 README 的变化。旧的 `github-metrics.svg` 当前未引用。
- 一次性预览文件放在 `.temp/` 的任务专用目录；未经用户要求，不提交或推送。
