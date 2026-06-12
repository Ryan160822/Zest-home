# 主页动效（入场/光晕/轻氛围）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给主页加三种"安静优雅"动效：卡片依次入场、鼠标跟手光晕、背景随真实时间/温州天气变化（含雨丝）。

**Architecture:** 沿用「`public/main.js` 客户端渲染 + `public/styles.css` token」模式。入场为纯 CSS 动画；光晕为一个委托 mousemove 写 CSS 变量；氛围为 `<body>` 时段类 + `.bg` 内雨丝层，复用现有 `/api/weather` 数据。worker 零改动。

**Tech Stack:** Vanilla JS、CSS（仅 transform/opacity 动画）、Intl Asia/Shanghai。

**Spec:** `docs/superpowers/specs/2026-06-06-motion-effects-design.md`

---

## 共用约定

- 无测试框架。每个任务验证 = `node --check public/main.js`（若改 JS）+ grep 确认接线；浏览器验证由控制者在 Task 5 统一做。
- 不改 `worker.js` / `wrangler.toml` / `index.html`。
- `prefers-reduced-motion` 块在 `public/styles.css:268`，新增禁用项加进该块。
- 当前 `#bento` 直接子元素固定 9 张卡（topbar、hero、dashboard、工具×2、inspire、english、history、aihot）。

---

## Task 1: 优雅入场（纯 CSS）

**Files:**
- Modify: `public/styles.css`

- [ ] **Step 1: 新增入场动画**

在 `/* ===== Hover 动效 ===== */` 区块之前插入：

```css
/* ===== 优雅入场 ===== */
@keyframes card-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}
.bento > .card { animation: card-in 0.65s var(--ease) backwards; }
.bento > .card:nth-child(2) { animation-delay: 0.08s; }
.bento > .card:nth-child(3) { animation-delay: 0.16s; }
.bento > .card:nth-child(4) { animation-delay: 0.24s; }
.bento > .card:nth-child(5) { animation-delay: 0.32s; }
.bento > .card:nth-child(6) { animation-delay: 0.4s; }
.bento > .card:nth-child(7) { animation-delay: 0.48s; }
.bento > .card:nth-child(8) { animation-delay: 0.56s; }
.bento > .card:nth-child(9) { animation-delay: 0.64s; }
```

- [ ] **Step 2: reduced-motion 禁用**

在 `@media (prefers-reduced-motion: reduce)` 块（约 268 行）内追加一行：

```css
  .bento > .card { animation: none; }
```

- [ ] **Step 3: 验证**

Run: `grep -c "card-in\|animation-delay" public/styles.css`
Expected: ≥ 10（keyframes + 8 条 delay）。确认 `.card` 原有 hover `transition` 未被改动。

- [ ] **Step 4: Commit**

```bash
git add public/styles.css
git commit -m "feat: staggered card entrance animation"
```

---

## Task 2: 跟手光晕

**Files:**
- Modify: `public/main.js`（新增 `initGlow`，`init()` 接线）
- Modify: `public/styles.css`（`.card::after` 光晕层）

- [ ] **Step 1: 新增 initGlow（main.js）**

在 `initInspire()` 函数之后插入：

```js
// ===== 跟手光晕：把光标位置写入卡片 CSS 变量 =====
function initGlow() {
  const bento = document.getElementById('bento');
  if (!bento) return;
  bento.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
}
```

- [ ] **Step 2: init() 接线**

在 `init()` 中 `initInspire();` 之后、`loadInspire();` 之前插入一行：

```js
  initGlow();
```

- [ ] **Step 3: 光晕样式（styles.css）**

在 Task 1 加的 `/* ===== 优雅入场 ===== */` 区块之后插入：

```css
/* ===== 跟手光晕 ===== */
.card::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s var(--ease);
  background:
    radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(120, 160, 255, 0.16), transparent 65%),
    radial-gradient(120px circle at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.35), transparent 70%);
  pointer-events: none;
}
.card:hover::after { opacity: 1; }
```

说明：`.card` 已有 `position: relative; overflow: hidden;`，光晕自动被卡片圆角裁切；`pointer-events: none` 保证不挡卡内交互。`.featured::after` 是无人使用的遗留样式，不冲突。

- [ ] **Step 4: 验证**

Run: `node --check public/main.js && grep -n "initGlow" public/main.js | head -3`
Expected: 语法通过；`initGlow` 定义一次 + `init()` 调用一次。

- [ ] **Step 5: Commit**

```bash
git add public/main.js public/styles.css
git commit -m "feat: cursor glow on glass cards"
```

---

## Task 3: 时段调色（含 ?sky= 调试覆盖）

**Files:**
- Modify: `public/main.js`（`AMBIENCE`、`skyBucket`、`applySky`、`initAmbience`；`init()` 接线）
- Modify: `public/styles.css`（三档 body 类的背景/光斑覆盖）

- [ ] **Step 1: 氛围逻辑（main.js）**

在 Task 2 的 `initGlow()` 之后插入：

```js
// ===== 轻氛围：时段调色 + 天气雨丝（URL 可覆盖：?sky=dawn|dusk|night|day&rain=1|0） =====
const AMBIENCE = { skyOverride: null, rainOverride: null };

function skyBucket(hour) {
  if (hour >= 5 && hour < 10) return 'dawn';
  if (hour >= 17 && hour < 20) return 'dusk';
  if (hour >= 20 || hour < 5) return 'night';
  return 'day';
}

function applySky() {
  const hour = Number(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai', hour: 'numeric', hourCycle: 'h23',
  }).format(new Date()));
  const bucket = AMBIENCE.skyOverride || skyBucket(hour);
  document.body.classList.remove('sky-dawn', 'sky-dusk', 'sky-night');
  if (bucket !== 'day') document.body.classList.add('sky-' + bucket);
}

function initAmbience() {
  const p = new URLSearchParams(location.search);
  const sky = p.get('sky');
  if (['dawn', 'dusk', 'night', 'day'].includes(sky)) AMBIENCE.skyOverride = sky;
  const rain = p.get('rain');
  if (rain === '1' || rain === '0') AMBIENCE.rainOverride = rain === '1';
  applySky();
  setInterval(applySky, 60000);
  if (AMBIENCE.rainOverride !== null) ensureRain(AMBIENCE.rainOverride);
}
```

注意：`ensureRain` 在 Task 4 定义。本任务先插入上面代码后，**临时**把 `initAmbience` 最后一行注释掉以保证可运行，Task 4 再取消注释——或者两任务连续执行时直接保留（Task 4 紧随其后）。执行顺序固定为 Task 3 → Task 4，保留即可，但 Task 3 验证只跑 `node --check`（引用未定义函数在未调用时不报错，`?rain=` 不传则不会调用）。

- [ ] **Step 2: init() 接线**

在 `init()` 中 `startClock();` 之后、`loadWeather();` 之前插入一行（顺序重要：氛围覆盖参数要先于天气回调生效）：

```js
  initAmbience();
```

- [ ] **Step 3: 三档调色（styles.css）**

在 `/* ===== 背景层 ===== */` 区块的 `.blob-4 { ... }` 行之后插入：

```css
/* ===== 时刻氛围：时段调色（只动背景与光斑，卡片不动） ===== */
body.sky-dawn { --bg-gradient: linear-gradient(135deg, #fbf5ea 0%, #fdf1e8 50%, #f4f7ee 100%); }
body.sky-dawn .blob-1 { background: #f0ddc2; }
body.sky-dawn .blob-2 { background: #f4d6cd; }
body.sky-dawn .blob-3 { background: #d9ecd4; }
body.sky-dawn .blob-4 { background: #f6e9c9; }
body.sky-dusk { --bg-gradient: linear-gradient(135deg, #f9ede2 0%, #f5e2e9 50%, #ebe4f6 100%); }
body.sky-dusk .blob-1 { background: #f2cfae; }
body.sky-dusk .blob-2 { background: #eac3d8; }
body.sky-dusk .blob-3 { background: #cfc2ea; }
body.sky-dusk .blob-4 { background: #f0d6bb; }
body.sky-night { --bg-gradient: linear-gradient(135deg, #e2e6f1 0%, #e5e2ef 50%, #dde5ec 100%); }
body.sky-night .blob-1 { background: #b7c5e7; }
body.sky-night .blob-2 { background: #cbc1e0; }
body.sky-night .blob-3 { background: #b5d2d4; }
body.sky-night .blob-4 { background: #c6cde9; }
```

（`body { background: var(--bg-gradient); }` 已存在，覆盖变量即生效。）

- [ ] **Step 4: 验证**

Run: `node --check public/main.js && grep -c "sky-dawn\|sky-dusk\|sky-night" public/main.js public/styles.css`
Expected: 语法通过；main.js 中 ≥3 处、styles.css 中 15 处。

- [ ] **Step 5: Commit**

```bash
git add public/main.js public/styles.css
git commit -m "feat: time-of-day ambient background palette"
```

---

## Task 4: 雨丝（天气联动）

**Files:**
- Modify: `public/main.js`（`isRainyCode`、`ensureRain`；`loadWeather` 挂钩）
- Modify: `public/styles.css`（`.rain` 样式 + reduced-motion 隐藏）

- [ ] **Step 1: 雨丝逻辑（main.js）**

在 Task 3 的 `initAmbience()` 之后插入：

```js
function isRainyCode(c) {
  return (c >= 51 && c <= 67) || (c >= 80 && c <= 82) || (c >= 95 && c <= 99);
}

function ensureRain(on) {
  const bg = document.querySelector('.bg');
  if (!bg) return;
  let rain = bg.querySelector('.rain');
  if (on && !rain) {
    rain = document.createElement('div');
    rain.className = 'rain';
    for (let i = 0; i < 24; i++) {
      const d = document.createElement('span');
      d.className = 'raindrop';
      d.style.left = Math.random() * 100 + '%';
      d.style.animationDuration = (0.9 + Math.random() * 0.8) + 's';
      d.style.animationDelay = Math.random() * 1.5 + 's';
      rain.appendChild(d);
    }
    bg.appendChild(rain);
  } else if (!on && rain) {
    rain.remove();
  }
}
```

- [ ] **Step 2: loadWeather 挂钩**

`loadWeather()` 的 try 块里有：

```js
    const cur = data.current || {};
    const daily = data.daily || {};
```

在 `const daily = ...` 行之后插入：

```js
    if (AMBIENCE.rainOverride === null) ensureRain(isRainyCode(cur.weather_code));
```

- [ ] **Step 3: 雨丝样式（styles.css）**

在 Task 3 的时段调色区块之后插入：

```css
/* ===== 时刻氛围：雨丝（在 .bg 背景层内、卡片后面） ===== */
.rain { position: absolute; inset: 0; }
.raindrop {
  position: absolute;
  top: -20px;
  width: 1.5px;
  height: 16px;
  border-radius: 2px;
  background: rgba(110, 130, 160, 0.35);
  animation: rain-fall linear infinite;
}
@keyframes rain-fall {
  to { transform: translateY(110vh); }
}
```

并在 `@media (prefers-reduced-motion: reduce)` 块内追加：

```css
  .rain { display: none; }
```

- [ ] **Step 4: 验证**

Run: `node --check public/main.js && grep -n "ensureRain\|isRainyCode\|rainOverride" public/main.js | head -8`
Expected: 语法通过；`ensureRain` 定义一次、`initAmbience` 与 `loadWeather` 各调用一次；`isRainyCode` 定义 + 调用。

- [ ] **Step 5: Commit**

```bash
git add public/main.js public/styles.css
git commit -m "feat: ambient rain streaks linked to wenzhou weather"
```

---

## Task 5: 浏览器回归（控制者执行）+ 文档

**Files:**
- Modify: `CLAUDE.md`（架构段补一句动效说明）

- [ ] **Step 1: 浏览器全量验证**

`npx wrangler dev --local`（端口 8799，见 `.claude/launch.json` 的 `zest-dev`），逐项确认：
- 刷新：9 张卡依次浮现，错峰自然；卡内异步内容（天气/日报/历史）正常加载。
- 鼠标滑过各卡：柔光跟手、移开淡出；待办勾选、Tab 切换、按钮点击不受影响。
- `/?sky=dawn`、`/?sky=dusk`、`/?sky=night`：背景与光斑变色、卡片文字可读性不变；`/?sky=day` 恢复现状。
- `/?rain=1`：雨丝出现且在卡片后面；`/?rain=0` 无雨；无参数时按真实天气（curl `/api/weather` 看 weather_code 对照）。
- 控制台无报错；缩窄到手机宽度布局正常。

- [ ] **Step 2: CLAUDE.md 补一句**

在「页面全靠 `public/main.js` 客户端渲染」小节末尾追加一行要点：

```markdown
- 动效：卡片入场（纯 CSS nth-child 错峰）、`initGlow()` 跟手光晕（CSS 变量 --mx/--my）、`initAmbience()` 时段调色 + 天气雨丝（URL 调试：`?sky=dawn|dusk|night|day&rain=1|0`），全部尊重 prefers-reduced-motion。
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: note motion effects in CLAUDE.md"
```

---

## Self-Review 记录

- **Spec 覆盖**：入场(T1)、光晕(T2)、时段调色+?sky(T3)、雨丝+weather_code+?rain(T4)、reduced-motion(T1/T4 步骤内)、浏览器验收(T5)。夜间深色/雪花/3D 倾斜均明确不做，与 spec 一致。
- **命名一致性**：`AMBIENCE.skyOverride/rainOverride`、`skyBucket`、`applySky`、`initAmbience`、`ensureRain`、`isRainyCode`、`initGlow`、`--mx/--my` 在 T2–T4 与 init()/loadWeather 挂钩处一致；`sky-dawn/dusk/night` 类名 JS 与 CSS 一致。
- **前向引用**：T3 的 `initAmbience` 引用 T4 的 `ensureRain`——仅当 URL 带 `?rain=` 时才会调用，且 T3→T4 顺序执行、间隔一次提交，未传参时不报错（已在 T3 注明）。
- **占位符**：无 TBD/TODO；所有代码块完整可粘贴。
