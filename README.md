# 世界观 Wiki / World Codex

一个轻量的原创世界观 wiki 框架。纯静态（HTML + CSS + JS），无需后端、无需构建工具，可直接发布到 GitHub Pages。

**添加内容 = 编辑 JSON 文件**，不用碰代码。

---

## 文件结构

```
wiki/
├── index.html          ← 入口（一般不用改）
├── assets/
│   ├── style.css       ← 视觉风格（改颜色/字体在这里）
│   └── app.js          ← 引擎（一般不用改）
└── data/
    ├── config.js       ← 网站名称、标语、分类（先改这个）
    ├── characters.json ← 角色
    ├── places.json     ← 地点/世界
    ├── lore.json       ← 设定/势力/魔法
    └── timeline.json   ← 时间线
```

---

## 第一步：改基本信息

打开 `data/config.js`，改 `name`（世界名）、`tagline`（标语）、`footer`。
分类也在这里增删——`id` 要和条目里的 `category` 对应。

## 第二步：添加条目

打开对应的 `data/*.json` 文件，复制一个已有条目，改成你的内容。
每个条目的字段：

```json
{
  "id": "唯一英文id-用连字符",
  "category": "characters",
  "title": "显示标题",
  "subtitle": "副标题（可空）",
  "image": "图片路径或网址（可空，空则显示首字母）",
  "tags": ["标签1", "标签2"],
  "info": { "种族": "人类", "状态": "存活" },
  "body": [
    { "type": "h2", "text": "小标题" },
    { "type": "p", "text": "段落文字" },
    { "type": "quote", "text": "引言" },
    { "type": "ul", "items": ["列表项1", "列表项2"] }
  ]
}
```

`body` 支持的块类型：`h2` `h3` `p`（段落）`quote`（引言）`ul`/`ol`（列表，用 `items`）`img`（图片，用 `src`/`alt`）。

## 第三步：条目互链

在任意文字里写 `[[条目id]]` 或 `[[条目id|显示文字]]` 就会自动生成跳转链接。
例：`她守护着 [[old-sereth|旧塞瑞斯]] 的灯塔。`
链接的目标不存在时会显示成灰色虚线，方便你发现笔误。

## 第四步：放图片

把图放进 `assets/`（比如 `assets/lyra.jpg`），然后在条目里写 `"image": "assets/lyra.jpg"`。

---

## 改视觉风格

`assets/style.css` 最上面的 `:root` 里是所有颜色和字体变量，改 `--accent`（主题色）和 `--font-display`（标题字体）就能换整体气质。

---

## 发布到 GitHub Pages

1. 新建一个 GitHub 仓库（比如 `aethel-wiki`）。
2. 把这个文件夹里的所有文件传上去（网页拖拽上传，或用 git push）。
3. 仓库 → **Settings** → **Pages** → Source 选 **Deploy from a branch** → 分支选 `main`、文件夹选 `/ (root)` → Save。
4. 等一两分钟，网址会是 `https://你的用户名.github.io/aethel-wiki/`。

之后每次改完 JSON 文件 push 上去，网站会自动更新。

> 本地预览：在文件夹里运行 `python3 -m http.server` 然后打开 `http://localhost:8000`。
> （注意：直接双击 index.html 可能因浏览器安全策略读不到 JSON，所以要用本地服务器预览。）
