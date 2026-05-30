# 个人主页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个玻璃质感暖调 Bento 风格的单页个人主页，展示个人介绍、工具（占位）、VIBE 作品和文章（硬编码示例）。

**Architecture:** 纯静态站点，三个文件各司其职：`index.html`（页面骨架）、`styles.css`（全部样式与设计 token）、`main.js`（集中的内容数据 + 渲染逻辑）。所有卡片由 `main.js` 从一个 `SITE` 数据对象渲染，便于日后替换真实内容。无构建步骤，可直接部署到任意静态托管。

**Tech Stack:** HTML5、CSS3（CSS Grid、`backdrop-filter`、CSS 变量）、原生 JavaScript（无框架）、Google Fonts（DM Serif Display + Nunito）。

---

## File Structure

- `index.html` — 页面骨架：`<head>`（meta、字体、样式引用）、`<header>` 导航、背景层容器、`<main id="bento">`（空，由 JS 填充）、`<script>` 引用
- `styles.css` — 全部样式：CSS 变量（颜色/间距/圆角 token）、reset、背景与光斑、Bento 网格、玻璃卡片基类、各卡片样式、响应式断点、动效
- `main.js` — `SITE` 数据常量 + 各卡片渲染函数 + `init()` 入口
- `docs/superpowers/specs/2026-05-30-personal-homepage-design.md` — 已有设计文档（参考）

**验证方式说明：** 本项目是静态页面，无单元测试框架。每个任务的"验证"= 在浏览器中打开 `index.html` 观察结果（可用 `open index.html` 或 Claude Preview）。每完成一个可见的增量就提交一次。

---

### Task 1: 项目脚手架与设计 token

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `main.js`

- [ ] **Step 1: 创建 `index.html` 骨架**

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>James · 个人主页</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Nunito:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="bg" aria-hidden="true">
    <!-- 光斑在 Task 2 加入 -->
  </div>

  <header class="nav">
    <!-- 导航在 Task 4 加入 -->
  </header>

  <main id="bento" class="bento">
    <!-- 卡片由 main.js 渲染 -->
  </main>

  <script src="main.js"></script>
</body>
</html>
```

- [ ] **Step 2: 创建 `styles.css`，写入 reset 与设计 token**

```css
/* ===== 设计 Token ===== */
:root {
  /* 背景 */
  --bg-gradient: linear-gradient(135deg, #f6f7fb 0%, #faf6f8 50%, #f5f9f7 100%);

  /* 玻璃 */
  --glass-bg: rgba(255, 255, 255, 0.22);
  --glass-bg-hero: rgba(255, 255, 255, 0.26);
  --glass-border: rgba(255, 255, 255, 0.45);
  --glass-blur: blur(18px) saturate(140%);
  --glass-shadow: 0 4px 22px rgba(40, 40, 80, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.4);

  /* 分类色（有色玻璃） */
  --c-status: rgba(200, 232, 212, 0.22);
  --c-stats: rgba(224, 210, 242, 0.22);
  --c-tool1: rgba(252, 212, 222, 0.22);
  --c-tool2: rgba(252, 232, 200, 0.26);
  --c-featured: rgba(200, 216, 245, 0.26);
  --c-articles: rgba(210, 224, 248, 0.22);

  /* 文字 */
  --text-strong: #2a2a38;
  --text-body: #54545f;
  --text-muted: #76768a;
  --accent: #6b8fd4;

  /* 尺寸 */
  --radius: 18px;
  --gap: 12px;
  --maxw: 980px;

  /* 动效 */
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}

/* ===== Reset ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 16px; }

body {
  font-family: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text-body);
  background: var(--bg-gradient);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

a { color: inherit; text-decoration: none; }

.serif { font-family: 'DM Serif Display', serif; }
```

- [ ] **Step 3: 创建 `main.js`，写入占位入口**

```js
// 内容数据与渲染逻辑将在后续任务填充
function init() {
  // 渲染函数在后续任务中依次调用
}

document.addEventListener('DOMContentLoaded', init);
```

- [ ] **Step 4: 初始化 git 并提交**

```bash
cd /Users/JAMES/Documents/个人主页
git init
printf "node_modules/\n.DS_Store\n.superpowers/\n" > .gitignore
git add index.html styles.css main.js .gitignore
git commit -m "chore: scaffold personal homepage (html/css/js + design tokens)"
```

- [ ] **Step 5: 验证**

在浏览器打开 `index.html`。
预期：空白页面，背景显示柔白渐变（左上偏蓝、中间偏粉、右下偏绿的微妙过渡），无报错（打开 DevTools Console 确认）。

---

### Task 2: 背景层与淡雅光斑

**Files:**
- Modify: `index.html`（背景层容器内加入光斑元素）
- Modify: `styles.css`（光斑样式）

- [ ] **Step 1: 在 `index.html` 的 `.bg` 容器内加入 4 个光斑**

将 `<div class="bg" aria-hidden="true">` 内容替换为：

```html
  <div class="bg" aria-hidden="true">
    <span class="blob blob-1"></span>
    <span class="blob blob-2"></span>
    <span class="blob blob-3"></span>
    <span class="blob blob-4"></span>
  </div>
```

- [ ] **Step 2: 在 `styles.css` 末尾加入背景层样式**

```css
/* ===== 背景层 ===== */
.bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(56px);
  opacity: 0.30;
}
.blob-1 { width: 240px; height: 240px; background: #cdd8f2; top: -60px; left: -50px; }
.blob-2 { width: 220px; height: 220px; background: #f2d8e2; top: 40%; right: -60px; }
.blob-3 { width: 200px; height: 200px; background: #d6eede; bottom: -50px; left: 28%; }
.blob-4 { width: 180px; height: 180px; background: #f4ecd6; top: 16%; left: 44%; }
```

- [ ] **Step 3: 验证**

刷新浏览器。
预期：背景上浮现 4 团非常柔和、低饱和的彩色光斑（蓝、粉、绿、黄），边缘极度模糊、互不抢眼。

- [ ] **Step 4: 提交**

```bash
git add index.html styles.css
git commit -m "feat: add soft gradient background with subtle color blobs"
```

---

### Task 3: Bento 网格与玻璃卡片基类

**Files:**
- Modify: `styles.css`（网格容器、卡片基类、响应式）

- [ ] **Step 1: 在 `styles.css` 末尾加入网格与卡片基类**

```css
/* ===== Bento 网格 ===== */
.bento {
  position: relative;
  z-index: 1;
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 24px 20px 48px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(120px, auto);
  gap: var(--gap);
}

/* ===== 玻璃卡片基类 ===== */
.card {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius);
  padding: 18px;
  background: var(--glass-bg);
  -webkit-backdrop-filter: var(--glass-blur);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

/* 卡片跨度 */
.span-2 { grid-column: span 2; }
.row-2 { grid-row: span 2; }

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .bento { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .bento { grid-template-columns: 1fr; }
  .span-2, .row-2 { grid-column: auto; grid-row: auto; }
}
```

- [ ] **Step 2: 临时验证占位卡片渲染**

在 `main.js` 的 `init()` 内临时加入一段测试渲染（验证后下个任务会移除）：

```js
function init() {
  const bento = document.getElementById('bento');
  bento.innerHTML = `
    <section class="card row-2 span-2">Hero 占位</section>
    <section class="card">状态</section>
    <section class="card">数据</section>
    <section class="card">工具1</section>
    <section class="card">工具2</section>
    <section class="card span-2">作品</section>
    <section class="card span-2">文章</section>
  `;
}
```

- [ ] **Step 3: 验证**

刷新浏览器。
预期：桌面下 4 列网格，Hero 占左上 2×2，其余卡片按布局排列；每张卡片是半透明磨砂玻璃，能透出背景光斑。把窗口缩到 768px 以下变 2 列，480px 以下变单列堆叠。

- [ ] **Step 4: 提交**

```bash
git add styles.css main.js
git commit -m "feat: add responsive bento grid and glass card base"
```

---

### Task 4: 导航栏

**Files:**
- Modify: `index.html`（`<header>` 内容）
- Modify: `styles.css`（导航样式）

- [ ] **Step 1: 填充 `index.html` 的 `<header class="nav">`**

```html
  <header class="nav">
    <a class="nav-logo serif" href="#">James ✦</a>
    <nav class="nav-links" aria-label="主导航">
      <a href="#tools">工具</a>
      <a href="#works">作品</a>
      <a href="#articles">文章</a>
      <a href="#about">关于</a>
    </nav>
  </header>
```

- [ ] **Step 2: 在 `styles.css` 末尾加入导航样式**

```css
/* ===== 导航 ===== */
.nav {
  position: relative;
  z-index: 1;
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 20px 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-logo { font-size: 1.2rem; color: var(--text-strong); }
.nav-links { display: flex; gap: 1.25rem; }
.nav-links a {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-body);
  transition: color 0.2s var(--ease);
}
.nav-links a:hover { color: var(--accent); }

@media (max-width: 480px) {
  .nav { flex-direction: column; gap: 10px; align-items: flex-start; }
  .nav-links { gap: 1rem; }
}
```

- [ ] **Step 3: 验证**

刷新浏览器。
预期：顶部出现导航，左侧衬线 Logo `James ✦`，右侧四个链接，hover 时变蓝。手机宽度下纵向堆叠。

- [ ] **Step 4: 提交**

```bash
git add index.html styles.css
git commit -m "feat: add top navigation bar"
```

---

### Task 5: SITE 数据对象与渲染骨架

**Files:**
- Modify: `main.js`（加入 `SITE` 常量与渲染骨架，移除 Task 3 的临时占位）

- [ ] **Step 1: 用以下内容替换整个 `main.js`**

```js
// ===== 内容数据（日后替换真实内容只改这里） =====
const SITE = {
  profile: {
    initial: 'J',
    name: 'James',
    role: 'Vibe Coder · Builder',
    bio: '喜欢用 AI 构建有趣的东西，分享工具、作品和思考。',
    tags: ['🔧 工具', '✨ 作品', '📝 文章'],
  },
  status: { text: '在做项目', detail: 'AI 写作工具' },
  github: { repos: 42, stars: 128 },
  tools: [
    { icon: '🔍', name: 'Prompt 优化器', cls: 'c-tool1' },
    { icon: '🎨', name: '配色生成器', cls: 'c-tool2' },
  ],
  featured: {
    badge: '✦ VIBE 作品',
    title: 'AI 周报助手',
    desc: '用 Claude 自动生成每周工作回顾',
  },
  articles: [
    { date: '5月', title: '用 Vibe Coding 在一天内做出可用的产品' },
    { date: '4月', title: '我用 AI 重建了自己的效率系统' },
    { date: '3月', title: '关于 Prompt 工程的一些真实经验' },
  ],
};

// ===== 工具函数 =====
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// ===== 渲染入口 =====
function init() {
  const bento = document.getElementById('bento');
  bento.innerHTML = '';
  // 各卡片渲染函数在后续任务中依次实现并在此调用：
  // bento.append(renderHero());
  // bento.append(renderStatus());
  // bento.append(renderStats());
  // renderTools().forEach(c => bento.append(c));
  // bento.append(renderFeatured());
  // bento.append(renderArticles());
}

document.addEventListener('DOMContentLoaded', init);
```

- [ ] **Step 2: 验证**

刷新浏览器。
预期：网格为空（占位卡片已移除），Console 无报错。`SITE` 数据已就位，后续任务逐个渲染。

- [ ] **Step 3: 提交**

```bash
git add main.js
git commit -m "feat: add SITE data model and render scaffolding"
```

---

### Task 6: Hero 自我介绍卡

**Files:**
- Modify: `main.js`（`renderHero` 函数 + 在 `init` 调用）
- Modify: `styles.css`（Hero 样式）

- [ ] **Step 1: 在 `main.js` 的 `SITE` 与 `el()` 之后、`init()` 之前加入 `renderHero`**

```js
function renderHero() {
  const p = SITE.profile;
  const tags = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
  return el(`
    <section class="card hero row-2 span-2" id="about">
      <div>
        <div class="avatar serif">${p.initial}</div>
        <h1 class="hero-name serif">${p.name}</h1>
        <p class="hero-role">${p.role}</p>
        <p class="hero-bio">${p.bio}</p>
      </div>
      <div class="hero-tags">${tags}</div>
    </section>
  `);
}
```

- [ ] **Step 2: 在 `init()` 中取消注释 / 加入 Hero 渲染调用**

`init()` 内 `bento.innerHTML = '';` 之后加：

```js
  bento.append(renderHero());
```

- [ ] **Step 3: 在 `styles.css` 末尾加入 Hero 样式**

```css
/* ===== Hero 卡 ===== */
.hero {
  background: var(--glass-bg-hero);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;
}
.avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b8fd4, #9fb8e8);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 1.5rem;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(107, 143, 212, 0.3);
}
.hero-name { font-size: 1.7rem; line-height: 1.1; color: var(--text-strong); }
.hero-role {
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.5px;
  text-transform: uppercase; color: var(--accent);
  margin: 4px 0 10px;
}
.hero-bio { font-size: 0.82rem; line-height: 1.6; color: var(--text-body); }
.hero-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
.tag {
  border-radius: 14px; padding: 4px 10px;
  font-size: 0.68rem; font-weight: 700;
  background: rgba(255, 255, 255, 0.4);
  color: #5a72b0;
  border: 1px solid rgba(255, 255, 255, 0.55);
}
```

- [ ] **Step 4: 验证**

刷新浏览器。
预期：左上出现 2×2 Hero 卡：圆形渐变头像（J）、衬线大标题 James、蓝色小标身份、简介、三个玻璃质感标签。

- [ ] **Step 5: 提交**

```bash
git add main.js styles.css
git commit -m "feat: add hero intro card"
```

---

### Task 7: 状态卡与 GitHub 数据卡

**Files:**
- Modify: `main.js`（`renderStatus`、`renderStats` + 调用）
- Modify: `styles.css`（两卡样式）

- [ ] **Step 1: 在 `renderHero` 之后加入两个渲染函数**

```js
function renderStatus() {
  const s = SITE.status;
  return el(`
    <section class="card c-status">
      <p class="label">状态</p>
      <p class="status-text"><span class="dot"></span>${s.text}</p>
      <p class="status-detail">${s.detail}</p>
    </section>
  `);
}

function renderStats() {
  const g = SITE.github;
  return el(`
    <section class="card c-stats">
      <p class="label">GitHub</p>
      <p class="big-num serif">${g.repos}</p>
      <p class="stats-sub">repos · ⭐${g.stars}</p>
    </section>
  `);
}
```

- [ ] **Step 2: 在 `init()` 的 `renderHero` 调用之后加入**

```js
  bento.append(renderStatus());
  bento.append(renderStats());
```

- [ ] **Step 3: 在 `styles.css` 末尾加入样式**

```css
/* ===== 通用小标签 ===== */
.label {
  font-size: 0.62rem; font-weight: 800; letter-spacing: 1px;
  text-transform: uppercase; color: var(--text-muted);
  margin-bottom: 6px;
}

/* ===== 状态卡 ===== */
.c-status { background: var(--c-status); }
.c-status .label { color: #2f7a4e; }
.status-text { font-size: 0.82rem; font-weight: 700; color: #1f5e3a; }
.dot {
  display: inline-block; width: 8px; height: 8px;
  border-radius: 50%; background: #4caf7d; margin-right: 6px;
  box-shadow: 0 0 0 3px rgba(76, 175, 125, 0.2);
}
.status-detail { font-size: 0.7rem; color: #2f7a4e; margin-top: 6px; }

/* ===== 数据卡 ===== */
.c-stats { background: var(--c-stats); }
.c-stats .label { color: #6a4fa0; }
.big-num { font-size: 2rem; line-height: 1; color: #42286e; margin: 4px 0; }
.stats-sub { font-size: 0.7rem; color: #8570b0; }
```

- [ ] **Step 4: 验证**

刷新浏览器。
预期：Hero 右侧出现两张 1×1 卡——绿色玻璃「状态」（含脉冲绿点）、紫色玻璃「GitHub」（大号衬线数字 42 + repos·⭐128）。

- [ ] **Step 5: 提交**

```bash
git add main.js styles.css
git commit -m "feat: add status and github stats cards"
```

---

### Task 8: 工具占位卡

**Files:**
- Modify: `main.js`（`renderTools` + 调用）
- Modify: `styles.css`（工具卡样式）

- [ ] **Step 1: 在 `renderStats` 之后加入 `renderTools`**

```js
function renderTools() {
  return SITE.tools.map(t => el(`
    <section class="card ${t.cls} tool" id="tools">
      <div class="tool-icon">${t.icon}</div>
      <p class="label">工具</p>
      <p class="tool-name">${t.name}</p>
    </section>
  `));
}
```

- [ ] **Step 2: 在 `init()` 的 `renderStats` 调用之后加入**

```js
  renderTools().forEach(c => bento.append(c));
```

- [ ] **Step 3: 在 `styles.css` 末尾加入工具卡样式**

```css
/* ===== 工具卡 ===== */
.tool { cursor: pointer; }
.tool-icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.95rem; margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.tool-name { font-size: 0.82rem; font-weight: 700; }
.c-tool1 { background: var(--c-tool1); }
.c-tool1 .label { color: #b05a72; }
.c-tool1 .tool-name { color: #902848; }
.c-tool2 { background: var(--c-tool2); }
.c-tool2 .label { color: #b07a2c; }
.c-tool2 .tool-name { color: #8a5808; }
```

- [ ] **Step 4: 验证**

刷新浏览器。
预期：出现两张 1×1 工具卡——粉色玻璃「Prompt 优化器」、暖黄玻璃「配色生成器」，各带图标，hover 显示手型指针。

- [ ] **Step 5: 提交**

```bash
git add main.js styles.css
git commit -m "feat: add tool placeholder cards"
```

---

### Task 9: VIBE 作品精选卡

**Files:**
- Modify: `main.js`（`renderFeatured` + 调用）
- Modify: `styles.css`（作品卡样式）

- [ ] **Step 1: 在 `renderTools` 之后加入 `renderFeatured`**

```js
function renderFeatured() {
  const f = SITE.featured;
  return el(`
    <section class="card c-featured featured span-2" id="works">
      <span class="featured-badge">${f.badge}</span>
      <h2 class="featured-title serif">${f.title}</h2>
      <p class="featured-desc">${f.desc}</p>
    </section>
  `);
}
```

- [ ] **Step 2: 在 `init()` 的 `renderTools` 调用之后加入**

```js
  bento.append(renderFeatured());
```

- [ ] **Step 3: 在 `styles.css` 末尾加入作品卡样式**

```css
/* ===== 作品精选卡 ===== */
.c-featured { background: var(--c-featured); }
.featured::after {
  content: '';
  position: absolute; bottom: -20px; right: -20px;
  width: 80px; height: 80px;
  background: radial-gradient(circle, rgba(107, 143, 212, 0.25), transparent 70%);
  border-radius: 50%;
}
.featured-badge {
  display: inline-block;
  font-size: 0.6rem; font-weight: 800; letter-spacing: 1px;
  text-transform: uppercase;
  padding: 2px 8px; border-radius: 12px;
  background: rgba(107, 143, 212, 0.85); color: #fff;
  margin-bottom: 8px;
}
.featured-title { font-size: 1.1rem; color: #2a3a5e; margin-bottom: 4px; }
.featured-desc { font-size: 0.78rem; line-height: 1.5; color: #48587e; }
```

- [ ] **Step 4: 验证**

刷新浏览器。
预期：出现一张 2×1 浅蓝玻璃作品卡，含「✦ VIBE 作品」徽章、衬线标题「AI 周报助手」、简介，右下角有柔和蓝色光晕。

- [ ] **Step 5: 提交**

```bash
git add main.js styles.css
git commit -m "feat: add featured vibe work card"
```

---

### Task 10: 文章列表卡

**Files:**
- Modify: `main.js`（`renderArticles` + 调用）
- Modify: `styles.css`（文章卡样式）

- [ ] **Step 1: 在 `renderFeatured` 之后加入 `renderArticles`**

```js
function renderArticles() {
  const items = SITE.articles.map(a => `
    <li class="article-item">
      <span class="article-date">${a.date}</span>
      <span class="article-title">${a.title}</span>
    </li>
  `).join('');
  return el(`
    <section class="card c-articles span-2" id="articles">
      <p class="label">最新文章</p>
      <ul class="article-list">${items}</ul>
    </section>
  `);
}
```

- [ ] **Step 2: 在 `init()` 的 `renderFeatured` 调用之后加入**

```js
  bento.append(renderArticles());
```

- [ ] **Step 3: 在 `styles.css` 末尾加入文章卡样式**

```css
/* ===== 文章卡 ===== */
.c-articles { background: var(--c-articles); }
.c-articles .label { color: #5a72b0; }
.article-list { list-style: none; }
.article-item {
  display: flex; gap: 10px;
  padding: 7px 0;
  font-size: 0.78rem;
  border-bottom: 1px solid rgba(120, 120, 150, 0.12);
}
.article-item:last-child { border-bottom: none; }
.article-date {
  font-weight: 800; white-space: nowrap;
  color: #6a7cc0; min-width: 2.2em;
}
.article-title { font-weight: 600; color: var(--text-strong); line-height: 1.4; }
```

- [ ] **Step 4: 验证**

刷新浏览器。
预期：出现一张 2×1 淡蓝玻璃文章卡，「最新文章」标题下列出 3 篇示例，每条左侧月份、右侧标题，条目间有细分隔线。整页 Bento 布局完整呈现。

- [ ] **Step 5: 提交**

```bash
git add main.js styles.css
git commit -m "feat: add latest articles card"
```

---

### Task 11: 玻璃降级、hover 动效与减弱动画支持

**Files:**
- Modify: `styles.css`（`@supports` 降级、hover 过渡、blob 浮动动画、`prefers-reduced-motion`）

- [ ] **Step 1: 在 `styles.css` 末尾加入 `backdrop-filter` 降级**

```css
/* ===== 玻璃降级（不支持 backdrop-filter 时提高不透明度保证可读） ===== */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .card { background: rgba(255, 255, 255, 0.85); }
  .hero { background: rgba(255, 255, 255, 0.88); }
  .c-status { background: rgba(216, 237, 224, 0.9); }
  .c-stats { background: rgba(232, 226, 242, 0.9); }
  .c-tool1 { background: rgba(252, 228, 232, 0.9); }
  .c-tool2 { background: rgba(254, 240, 219, 0.9); }
  .c-featured { background: rgba(227, 236, 251, 0.9); }
  .c-articles { background: rgba(240, 244, 251, 0.9); }
}
```

- [ ] **Step 2: 在 `styles.css` 末尾加入卡片 hover 过渡**

在 `.card` 已有规则之外，追加：

```css
/* ===== Hover 动效 ===== */
.card {
  transition: transform 0.25s var(--ease), box-shadow 0.25s var(--ease);
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(40, 40, 80, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.4);
}
```

- [ ] **Step 3: 在 `styles.css` 末尾加入光斑缓慢浮动**

```css
/* ===== 光斑浮动 ===== */
@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(14px, -18px); }
}
.blob-1 { animation: float 18s ease-in-out infinite; }
.blob-2 { animation: float 22s ease-in-out infinite reverse; }
.blob-3 { animation: float 20s ease-in-out infinite; }
.blob-4 { animation: float 26s ease-in-out infinite reverse; }
```

- [ ] **Step 4: 在 `styles.css` 末尾加入 `prefers-reduced-motion`**

```css
/* ===== 尊重减弱动画偏好 ===== */
@media (prefers-reduced-motion: reduce) {
  .blob { animation: none; }
  .card { transition: none; }
  .card:hover { transform: none; }
}
```

- [ ] **Step 5: 验证**

刷新浏览器。
预期：鼠标悬停卡片时轻微上浮、阴影加深；背景光斑极缓慢地漂移。在系统开启「减弱动态效果」后，动画停止、hover 不再位移。

- [ ] **Step 6: 提交**

```bash
git add styles.css
git commit -m "feat: add glass fallback, hover motion, and reduced-motion support"
```

---

### Task 12: 可访问性与响应式终检

**Files:**
- Modify: `styles.css`（focus 态；如对比度不足则微调文字色）

- [ ] **Step 1: 在 `styles.css` 末尾加入可见 focus 态**

```css
/* ===== 键盘可访问性 ===== */
a:focus-visible,
.tool:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}
```

- [ ] **Step 2: 对比度检查**

用浏览器 DevTools 的 Accessibility/Contrast 工具，逐一检查各卡片上的正文与标签文字：
- 正文文字（`--text-body` / 各分类深色）对其玻璃背景需 ≥ 4.5:1
- 标签（`.label`）作为小号加粗文字需 ≥ 4.5:1

预期：现有深色文字（如 `#1f5e3a`、`#42286e`、`#902848`、`#8a5808`、`#2a3a5e`）在浅色玻璃上均达标。若某项不足，将该文字色调暗一档（降低明度）直至达标，并记录改动。

- [ ] **Step 3: 响应式终检**

依次在 375px、768px、1024px、1440px 宽度下查看：
预期：
- 1024px+：4 列布局完整
- 768px：2 列，卡片重排不溢出
- 375px：单列堆叠，Hero 在最上，无横向滚动
- 导航在 480px 以下纵向堆叠

- [ ] **Step 4: 提交**

```bash
git add styles.css
git commit -m "feat: add focus states and finalize a11y/responsive pass"
```

- [ ] **Step 5: 最终验证**

在浏览器完整浏览整页一遍，确认：所有卡片正确渲染、玻璃效果通透、光斑淡雅、hover 顺滑、移动端可用、Console 无报错。

---

## 备注

- 所有内容数据集中在 `main.js` 的 `SITE` 对象，日后替换真实内容（工具、文章、GitHub 数据）只需改这一处。
- 工具卡当前为占位（`cursor: pointer` 但无跳转）；后续迭代时为其加 `href` 或站内交互。
- 后续迭代（不在本计划内）：工具实装、Markdown 文章系统、深色模式、动态拉取 GitHub 数据。
