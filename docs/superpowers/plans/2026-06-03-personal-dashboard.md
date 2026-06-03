# 个人主页仪表盘改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把首页改造成带交互的个人控制台：删除状态/GitHub 卡、顶部「时间+天气」条、待办+日程合并清单与番茄钟的仪表盘卡、AI 灵感生成器卡。

**Architecture:** 沿用现有「`public/main.js` 渲染 bento 卡片 + `public/styles.css` 玻璃拟态 + `worker.js` 服务端代理」模式。新增交互数据存浏览器 localStorage；天气走 `/api/weather` 代理 Open-Meteo；灵感走 `/api/inspire` 调用 Cloudflare Workers AI。无构建步骤、无测试框架（YAGNI），验证用 `npx wrangler dev` + curl + 浏览器。

**Tech Stack:** Vanilla JS、CSS、Cloudflare Workers（静态资源 + 路由）、Workers AI、Open-Meteo、localStorage、Notification API。

---

## 关键约定（所有任务共用）

- **Asia/Shanghai** 时区贯穿（时间、天气、每日重置、任务排序）。
- localStorage 统一一个 key：`zest.dashboard`，结构 `{ tasks: [], pomoCount: 0, lastResetDate: 'YYYY-MM-DD' }`。
- 所有 localStorage 读写包 try/catch，隐私模式下降级为「当次会话有效」不报错。
- 锚点保留：Hero 仍带 `id="about"`，第一个工具卡仍带 `id="tools"`（导航依赖）。

## 启动 / 验证方式

- 本地起服务：`cd "/Users/JAMES/Documents/个人主页" && npx wrangler dev`（默认 http://localhost:8787）。
- 静态 UI 改动：浏览器打开预览，看布局/交互。
- API 改动：`curl -s http://localhost:8787/api/<route>` 看返回。
- Workers AI 在 `wrangler dev` 下走远端，需要已登录的 Cloudflare 账号；若本地报错，用 `npx wrangler deploy` 后在线验证。

---

## 文件结构

| 文件 | 职责 | 本次改动 |
| --- | --- | --- |
| `public/main.js` | 渲染所有卡片 + 交互逻辑 | 删 status/stats；改时钟为顶栏+天气；新增 dashboard（清单+番茄钟+存储）、inspire；调 `init()` |
| `public/styles.css` | 全站样式 | 删 status/stats 样式；新增顶栏、仪表盘、灵感卡样式 + token + `@supports` + 响应式 |
| `worker.js` | 服务端路由 | 新增 `/api/weather`、`/api/inspire` |
| `wrangler.toml` | Worker 配置 | 新增 `[ai]` 绑定 |

---

## Task 1: 删除状态卡和 GitHub 卡

**Files:**
- Modify: `public/main.js`（删 `renderStatus`、`renderStats`、`SITE.status`、`SITE.github`、`init` 中两处 append）
- Modify: `public/styles.css`（删相关样式与 token）

- [ ] **Step 1: 删除 main.js 中的数据与渲染函数**

删除 `SITE` 对象里的这两行：
```js
  status: { text: '在做项目', detail: 'AI 写作工具' },
  github: { repos: 42, stars: 128 },
```

删除整个 `renderStatus()` 函数（约 71-80 行）和整个 `renderStats()` 函数（约 82-91 行）。

- [ ] **Step 2: 从 init() 移除两处 append**

在 `init()` 中删除这两行：
```js
  bento.append(renderStatus());
  bento.append(renderStats());
```

- [ ] **Step 3: 删除 styles.css 中相关样式**

删除这些块：`/* ===== 状态卡 ===== */` 下的 `.c-status`、`.c-status .label`、`.status-text`、`.dot`、`.status-detail`；`/* ===== 数据卡 ===== */` 下的 `.c-stats`、`.c-stats .label`、`.big-num`、`.stats-sub`。
删除 `:root` 里的 `--c-status` 和 `--c-stats` 两行。
删除 `@supports not (...)` 降级块里的 `.c-status { ... }` 和 `.c-stats { ... }` 两行。

- [ ] **Step 4: 验证**

Run: `cd "/Users/JAMES/Documents/个人主页" && npx wrangler dev`，浏览器打开 http://localhost:8787 。
Expected: 页面正常渲染，不再有「状态」「GitHub」两张卡，无 JS 报错（控制台干净），其余卡片布局正常。

- [ ] **Step 5: Commit**

```bash
git add public/main.js public/styles.css
git commit -m "feat: remove status and github cards"
```

---

## Task 2: 顶栏后端 /api/weather

**Files:**
- Modify: `worker.js`（在 `/api/daily` 分支后新增 `/api/weather` 分支）

- [ ] **Step 1: 新增 /api/weather 路由**

在 `worker.js` 的 `if (url.pathname === '/api/daily') { ... }` 块**之后**、`// 其余请求` 之前插入：

```js
    if (url.pathname === '/api/weather') {
      try {
        const api = 'https://api.open-meteo.com/v1/forecast?latitude=28.02&longitude=120.66&current=temperature_2m,weather_code,apparent_temperature&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FShanghai&forecast_days=1';
        const upstream = await fetch(api, { headers: { Accept: 'application/json' } });
        if (!upstream.ok) {
          return Response.json({ error: 'upstream ' + upstream.status }, { status: 502 });
        }
        const body = await upstream.text();
        return new Response(body, {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'public, max-age=1800',
          },
        });
      } catch (e) {
        return Response.json({ error: String(e) }, { status: 502 });
      }
    }
```

- [ ] **Step 2: 验证接口**

Run: `cd "/Users/JAMES/Documents/个人主页" && npx wrangler dev`（另开终端）然后 `curl -s http://localhost:8787/api/weather | head -c 400`
Expected: 返回 JSON，含 `"current":{..."temperature_2m":...,"weather_code":...}` 和 `"daily":{...}`。

- [ ] **Step 3: Commit**

```bash
git add worker.js
git commit -m "feat: add /api/weather proxy (open-meteo, wenzhou)"
```

---

## Task 3: 顶栏前端（时间+天气，占满整行）

**Files:**
- Modify: `public/main.js`（`renderClock` 改名为 `renderTopbar` 并扩展；新增 `WEATHER` 映射表与 `loadWeather`；`init` 调整）
- Modify: `public/styles.css`（新增 `.c-topbar` 等样式）

- [ ] **Step 1: 替换 renderClock 为 renderTopbar**

把现有 `renderClock()` 函数整体替换为：

```js
function renderTopbar() {
  return el(`
    <section class="card c-topbar span-4" id="clock">
      <div class="topbar-time">
        <p class="label">北京时间</p>
        <p class="clock-time serif" id="clock-time">--:--:--</p>
        <p class="clock-meta" id="clock-meta">加载中…</p>
      </div>
      <div class="topbar-weather">
        <p class="label">温州 · 鹿城</p>
        <p class="weather-now">
          <span class="weather-icon" id="weather-icon">⏳</span>
          <span class="weather-temp serif" id="weather-temp">--°</span>
        </p>
        <p class="weather-meta" id="weather-meta">加载中…</p>
      </div>
    </section>
  `);
}
```

- [ ] **Step 2: 新增 WEATHER 映射表与 loadWeather**

在 `startClock()` 函数之后新增：

```js
// WMO weather_code → 中文 + emoji
const WEATHER = {
  0:{l:'晴',i:'☀️'},1:{l:'晴间多云',i:'🌤️'},2:{l:'多云',i:'⛅'},3:{l:'阴',i:'☁️'},
  45:{l:'雾',i:'🌫️'},48:{l:'雾凇',i:'🌫️'},
  51:{l:'毛毛雨',i:'🌦️'},53:{l:'小雨',i:'🌦️'},55:{l:'中雨',i:'🌧️'},
  56:{l:'冻雨',i:'🌧️'},57:{l:'冻雨',i:'🌧️'},
  61:{l:'小雨',i:'🌦️'},63:{l:'中雨',i:'🌧️'},65:{l:'大雨',i:'🌧️'},
  66:{l:'冻雨',i:'🌧️'},67:{l:'冻雨',i:'🌧️'},
  71:{l:'小雪',i:'🌨️'},73:{l:'中雪',i:'❄️'},75:{l:'大雪',i:'❄️'},77:{l:'雪粒',i:'🌨️'},
  80:{l:'阵雨',i:'🌦️'},81:{l:'阵雨',i:'🌧️'},82:{l:'强阵雨',i:'⛈️'},
  85:{l:'阵雪',i:'🌨️'},86:{l:'强阵雪',i:'❄️'},
  95:{l:'雷阵雨',i:'⛈️'},96:{l:'雷阵雨伴冰雹',i:'⛈️'},99:{l:'强雷阵雨',i:'⛈️'},
};

async function loadWeather() {
  const iconEl = document.getElementById('weather-icon');
  const tempEl = document.getElementById('weather-temp');
  const metaEl = document.getElementById('weather-meta');
  if (!iconEl) return;
  try {
    const res = await fetch('/api/weather', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('status ' + res.status);
    const data = await res.json();
    const cur = data.current || {};
    const daily = data.daily || {};
    const w = WEATHER[cur.weather_code] || { l: '—', i: '🌡️' };
    iconEl.textContent = w.i;
    tempEl.textContent = (cur.temperature_2m != null ? Math.round(cur.temperature_2m) : '--') + '°';
    const hi = daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : null;
    const lo = daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : null;
    const feels = cur.apparent_temperature != null ? `体感 ${Math.round(cur.apparent_temperature)}°` : '';
    const range = (hi != null && lo != null) ? `${lo}° / ${hi}°` : '';
    metaEl.textContent = [w.l, range, feels].filter(Boolean).join(' · ');
  } catch (e) {
    iconEl.textContent = '🌡️';
    tempEl.textContent = '--°';
    metaEl.textContent = '天气加载失败';
  }
}
```

- [ ] **Step 3: 调整 init()**

在 `init()` 中把 `bento.append(renderClock());` 改成放在最前面的 `bento.append(renderTopbar());`，并在 `startClock();` 之后加 `loadWeather();`。`init()` 此刻应为（暂以本任务为准，后续任务会继续加）：

```js
function init() {
  const bento = document.getElementById('bento');
  bento.innerHTML = '';
  bento.append(renderTopbar());
  bento.append(renderHero());
  renderTools().forEach(c => bento.append(c));
  bento.append(renderEnglish());
  bento.append(renderAihot());
  startClock();
  loadWeather();
  renderFooter();
}
```

- [ ] **Step 4: 新增顶栏样式**

在 `styles.css` 的 `/* ===== 北京时间卡 ===== */` 区块**替换/补充**为：

```css
/* ===== 顶栏：时间 + 天气 ===== */
.c-topbar {
  background: var(--c-clock);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  min-height: auto;
}
.c-topbar .label { color: #1a6363; }
.topbar-weather { text-align: right; }
.clock-time {
  font-size: 1.9rem; line-height: 1.1; color: var(--text-strong);
  margin: 4px 0 6px; font-variant-numeric: tabular-nums;
}
.clock-meta { font-size: 0.78rem; font-weight: 600; color: #1a6363; }
.weather-now { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin: 4px 0 6px; }
.weather-icon { font-size: 1.5rem; }
.weather-temp { font-size: 1.9rem; line-height: 1.1; color: var(--text-strong); }
.weather-meta { font-size: 0.78rem; font-weight: 600; color: #1a6363; }
@media (max-width: 480px) {
  .c-topbar { flex-direction: column; align-items: flex-start; gap: 10px; }
  .topbar-weather { text-align: left; }
  .weather-now { justify-content: flex-start; }
}
```

注意：保留原有 `.c-clock` 在 `@supports` 降级块和 `--c-clock` token 不动（`.c-topbar` 复用 `--c-clock`）。若 `@supports` 降级块里是 `.c-clock`，新增一行 `.c-topbar { background: rgba(222, 240, 241, 0.9); }`。

- [ ] **Step 5: 验证**

Run: `npx wrangler dev`，打开 http://localhost:8787 。
Expected: 顶部一条整行卡，左边北京时间走秒，右边温州天气图标+温度+「描述 · 低/高 · 体感」。窗口缩到手机宽度时上下堆叠。控制台无报错。

- [ ] **Step 6: Commit**

```bash
git add public/main.js public/styles.css
git commit -m "feat: top bar with beijing time + wenzhou weather"
```

---

## Task 4: 仪表盘卡骨架 + Tab 切换 + 存储基础

**Files:**
- Modify: `public/main.js`（新增 `renderDashboard`、存储工具、`applyDailyReset`、`initDashboardTabs`；`init` 调整）
- Modify: `public/styles.css`（新增 `.c-dash`、tabs、panel 样式 + token）

- [ ] **Step 1: 新增存储工具与每日重置**

在 `main.js` 顶部 `SITE` 定义**之后**新增：

```js
// ===== 仪表盘存储 =====
const STORE_KEY = 'zest.dashboard';
function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch (e) { return {}; }
}
function saveStore() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {}
}
function todayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
}
let store = loadStore();
if (!Array.isArray(store.tasks)) store.tasks = [];
if (typeof store.pomoCount !== 'number') store.pomoCount = 0;
function applyDailyReset() {
  const today = todayKey();
  if (store.lastResetDate !== today) {
    store.tasks = store.tasks.filter(t => !t.time); // 清掉带时间的，留纯待办
    store.pomoCount = 0;
    store.lastResetDate = today;
    saveStore();
  }
}
```

- [ ] **Step 2: 新增 renderDashboard**

在 `renderHero()` 之后新增：

```js
function renderDashboard() {
  return el(`
    <section class="card c-dash row-2 span-2" id="dashboard">
      <p class="label">🗂 我的仪表盘</p>
      <div class="dash-tabs">
        <button class="dash-tab on" data-tab="today">📋 今日</button>
        <button class="dash-tab" data-tab="pomo">🍅 番茄钟</button>
      </div>
      <div class="dash-panel on" data-panel="today">
        <div class="task-add">
          <input class="task-time" type="time" id="task-time" aria-label="时间（选填）">
          <input class="task-text" id="task-text" placeholder="加一件今天要做的事…" aria-label="事项">
          <button class="task-add-btn" id="task-add-btn" aria-label="添加">+</button>
        </div>
        <div class="task-list" id="task-list"></div>
      </div>
      <div class="dash-panel" data-panel="pomo">
        <div class="pomo">
          <p class="pomo-time serif" id="pomo-time">25:00</p>
          <div class="pomo-modes">
            <button class="pomo-mode on" data-min="25">专注 25</button>
            <button class="pomo-mode" data-min="5">短休 5</button>
            <button class="pomo-mode" data-min="15">长休 15</button>
          </div>
          <div class="pomo-btns">
            <button class="pomo-start" id="pomo-start">开始</button>
            <button class="pomo-reset" id="pomo-reset">重置</button>
          </div>
          <p class="pomo-count" id="pomo-count"></p>
        </div>
      </div>
    </section>
  `);
}

function initDashboardTabs() {
  document.querySelectorAll('.dash-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const name = tab.dataset.tab;
      document.querySelectorAll('.dash-tab').forEach(t => t.classList.toggle('on', t === tab));
      document.querySelectorAll('.dash-panel').forEach(p => p.classList.toggle('on', p.dataset.panel === name));
    });
  });
}
```

- [ ] **Step 3: 调整 init()**

```js
function init() {
  const bento = document.getElementById('bento');
  bento.innerHTML = '';
  applyDailyReset();
  bento.append(renderTopbar());
  bento.append(renderDashboard());
  bento.append(renderHero());
  renderTools().forEach(c => bento.append(c));
  bento.append(renderEnglish());
  bento.append(renderAihot());
  startClock();
  loadWeather();
  initDashboardTabs();
  renderFooter();
}
```

- [ ] **Step 4: 新增仪表盘卡样式与 token**

在 `:root` 的分类色区块加一行：
```css
  --c-dash: rgba(216, 224, 248, 0.30);
```
在 `@supports not (...)` 降级块加一行：
```css
  .c-dash { background: rgba(224, 230, 250, 0.9); }
```
在 styles.css 末尾新增：
```css
/* ===== 仪表盘卡 ===== */
.c-dash { background: var(--c-dash); display: flex; flex-direction: column; }
.c-dash .label { color: #3f5bb0; }
.dash-tabs {
  display: flex; gap: 4px; background: rgba(255, 255, 255, 0.4);
  padding: 4px; border-radius: 12px; margin: 4px 0 14px;
}
.dash-tab {
  flex: 1; text-align: center; font-size: 0.76rem; font-weight: 700;
  padding: 7px 4px; border-radius: 9px; color: var(--text-muted);
  cursor: pointer; border: none; background: none; font-family: inherit;
  transition: background 0.2s var(--ease), color 0.2s var(--ease);
}
.dash-tab.on { background: #fff; color: var(--accent); box-shadow: 0 1px 4px rgba(40, 40, 80, 0.08); }
.dash-panel { display: none; flex: 1; }
.dash-panel.on { display: block; }
```

- [ ] **Step 5: 验证**

Run: `npx wrangler dev`，打开页面。
Expected: 仪表盘卡出现在时间条下方、Hero 左侧，和 Hero 一样高（2 行）。点「📋 今日 / 🍅 番茄钟」Tab 能切换面板（今日面板有输入框，番茄面板显示 25:00 + 模式 + 按钮）。今日列表暂时空白。无报错。

- [ ] **Step 6: Commit**

```bash
git add public/main.js public/styles.css
git commit -m "feat: dashboard card scaffold with tabs and storage"
```

---

## Task 5: 今日清单（待办+日程合并）

**Files:**
- Modify: `public/main.js`（新增 `renderTaskList`、`taskRow`、`addTask`、`toggleTask`、`deleteTask`、`initTaskInput`；`init` 调用）
- Modify: `public/styles.css`（新增 `.task-*` 样式）

- [ ] **Step 1: 新增清单逻辑**

在 `initDashboardTabs()` 之后新增：

```js
function renderTaskList() {
  const list = document.getElementById('task-list');
  if (!list) return;
  list.innerHTML = '';
  if (store.tasks.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'task-empty';
    empty.textContent = '今天还没有安排，加一件事吧 ✦';
    list.appendChild(empty);
    return;
  }
  const timed = store.tasks.filter(t => t.time).sort((a, b) => a.time.localeCompare(b.time));
  const untimed = store.tasks.filter(t => !t.time);
  const nowHM = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date());
  let nowIdx = -1;
  timed.forEach((t, i) => { if (t.time <= nowHM && !t.done) nowIdx = i; });
  timed.forEach((t, i) => list.appendChild(taskRow(t, i === nowIdx)));
  if (untimed.length) {
    const hd = document.createElement('p');
    hd.className = 'task-group';
    hd.textContent = '随时做';
    list.appendChild(hd);
    untimed.forEach(t => list.appendChild(taskRow(t, false)));
  }
}

function taskRow(t, isNow) {
  const row = el(`
    <div class="task-item${t.done ? ' done' : ''}${isNow ? ' now' : ''}" data-id="${t.id}">
      ${t.time ? `<time>${t.time}</time>` : '<span class="task-anytime">—</span>'}
      <span class="task-box"></span>
      <span class="task-label"></span>
      <button class="task-del" aria-label="删除">×</button>
    </div>
  `);
  row.querySelector('.task-label').textContent = t.text;
  row.querySelector('.task-box').addEventListener('click', () => toggleTask(t.id));
  row.querySelector('.task-label').addEventListener('click', () => toggleTask(t.id));
  row.querySelector('.task-del').addEventListener('click', () => deleteTask(t.id));
  return row;
}

function addTask(text, time) {
  text = (text || '').trim();
  if (!text) return;
  store.tasks.push({
    id: Date.now() + '-' + Math.floor(Math.random() * 1000),
    text, time: time || null, done: false, createdAt: Date.now(),
  });
  saveStore();
  renderTaskList();
}

function toggleTask(id) {
  const t = store.tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  saveStore();
  renderTaskList();
}

function deleteTask(id) {
  store.tasks = store.tasks.filter(x => x.id !== id);
  saveStore();
  renderTaskList();
}

function initTaskInput() {
  const btn = document.getElementById('task-add-btn');
  const text = document.getElementById('task-text');
  const time = document.getElementById('task-time');
  if (!btn) return;
  const submit = () => { addTask(text.value, time.value); text.value = ''; time.value = ''; text.focus(); };
  btn.addEventListener('click', submit);
  text.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
}
```

- [ ] **Step 2: 在 init() 中调用**

在 `initDashboardTabs();` 之后加：
```js
  initTaskInput();
  renderTaskList();
```

- [ ] **Step 3: 新增清单样式**

styles.css 末尾新增：
```css
/* ===== 今日清单 ===== */
.task-add { display: flex; gap: 6px; margin-bottom: 12px; }
.task-time {
  width: 88px; flex-shrink: 0; border: 1px solid rgba(120, 120, 150, 0.2);
  background: rgba(255, 255, 255, 0.6); border-radius: 9px; padding: 7px 8px;
  font-size: 0.74rem; font-family: inherit; color: var(--text-strong);
}
.task-text {
  flex: 1; min-width: 0; border: 1px solid rgba(120, 120, 150, 0.2);
  background: rgba(255, 255, 255, 0.6); border-radius: 9px; padding: 7px 10px;
  font-size: 0.78rem; font-family: inherit; color: var(--text-strong);
}
.task-add-btn {
  border: none; background: var(--accent); color: #fff; border-radius: 9px;
  padding: 0 14px; font-weight: 800; font-size: 1rem; cursor: pointer; flex-shrink: 0;
}
.task-list { overflow-y: auto; }
.task-empty { font-size: 0.78rem; color: var(--text-muted); padding: 12px 0; }
.task-group {
  font-size: 0.64rem; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;
  color: var(--text-muted); margin: 12px 0 2px;
}
.task-item {
  display: flex; align-items: center; gap: 9px; padding: 8px 0;
  border-bottom: 1px solid rgba(120, 120, 150, 0.1); font-size: 0.82rem; color: var(--text-strong);
}
.task-item:last-child { border-bottom: none; }
.task-item time {
  font-weight: 800; color: var(--accent); font-variant-numeric: tabular-nums;
  min-width: 3.1em; font-size: 0.8rem;
}
.task-anytime { min-width: 3.1em; font-size: 0.72rem; color: var(--text-muted); font-weight: 700; }
.task-box {
  width: 16px; height: 16px; border-radius: 5px; border: 2px solid var(--accent);
  flex-shrink: 0; cursor: pointer;
}
.task-label { flex: 1; cursor: pointer; line-height: 1.4; }
.task-item.done .task-label { text-decoration: line-through; color: var(--text-muted); }
.task-item.done .task-box { background: var(--accent); opacity: 0.5; }
.task-item.now { background: rgba(71, 115, 201, 0.09); border-radius: 8px; padding: 8px; margin: 0 -8px; }
.task-del {
  border: none; background: none; color: var(--text-muted); cursor: pointer;
  font-size: 1rem; line-height: 1; padding: 2px 4px; opacity: 0; transition: opacity 0.2s var(--ease);
}
.task-item:hover .task-del { opacity: 0.6; }
.task-del:hover { opacity: 1 !important; color: #b05a72; }
```

- [ ] **Step 4: 验证（含每日重置）**

Run: `npx wrangler dev`，打开页面，在「📋 今日」面板：
- 不填时间加一条 → 出现在「随时做」分组。
- 填时间（如 14:00）加一条 → 出现在上方，带时间、按时间排序，命中当前时段高亮。
- 点勾选框/文字 → 划线灰显；再点取消。
- hover 显示 × → 点击删除。
- 刷新页面 → 数据仍在（localStorage 生效）。
- **每日重置**：浏览器控制台执行 `let s=JSON.parse(localStorage['zest.dashboard']); s.lastResetDate='2000-01-01'; localStorage['zest.dashboard']=JSON.stringify(s); location.reload();`
  Expected: 带时间的任务被清空，纯待办仍保留。

- [ ] **Step 5: Commit**

```bash
git add public/main.js public/styles.css
git commit -m "feat: unified today list (todo + schedule) with localStorage"
```

---

## Task 6: 番茄钟

**Files:**
- Modify: `public/main.js`（新增番茄钟逻辑 + `initPomo`；`init` 调用）
- Modify: `public/styles.css`（新增 `.pomo*` 样式）

- [ ] **Step 1: 新增番茄钟逻辑**

在 `initTaskInput()` 之后新增：

```js
// ===== 番茄钟 =====
const POMO = { running: false, mode: 25, remaining: 25 * 60, endAt: 0, timer: null };

function fmtPomo(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}
function renderPomo() {
  const t = document.getElementById('pomo-time');
  const c = document.getElementById('pomo-count');
  if (t) t.textContent = fmtPomo(POMO.remaining);
  if (c) c.textContent = store.pomoCount > 0
    ? `今天完成 ${'🍅'.repeat(Math.min(store.pomoCount, 8))} · ${store.pomoCount} 个番茄`
    : '专注开始你的第一个番茄 🍅';
}
function tickPomo() {
  POMO.remaining = Math.max(0, Math.round((POMO.endAt - Date.now()) / 1000));
  renderPomo();
  if (POMO.remaining <= 0) finishPomo();
}
function startPomo() {
  if (POMO.running) { pausePomo(); return; }
  POMO.running = true;
  POMO.endAt = Date.now() + POMO.remaining * 1000;
  POMO.timer = setInterval(tickPomo, 250);
  const btn = document.getElementById('pomo-start');
  if (btn) btn.textContent = '暂停';
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
function pausePomo() {
  POMO.running = false;
  clearInterval(POMO.timer);
  const btn = document.getElementById('pomo-start');
  if (btn) btn.textContent = '开始';
}
function resetPomo() {
  pausePomo();
  POMO.remaining = POMO.mode * 60;
  renderPomo();
}
function setPomoMode(min) {
  POMO.mode = min;
  pausePomo();
  POMO.remaining = min * 60;
  document.querySelectorAll('.pomo-mode').forEach(b => b.classList.toggle('on', Number(b.dataset.min) === min));
  renderPomo();
}
function finishPomo() {
  pausePomo();
  if (POMO.mode === 25) { store.pomoCount += 1; saveStore(); }
  POMO.remaining = POMO.mode * 60;
  renderPomo();
  notifyPomo();
}
function notifyPomo() {
  const msg = POMO.mode === 25 ? '专注完成，休息一下 🍵' : '休息结束，继续加油 💪';
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('🍅 番茄钟', { body: msg });
  } else {
    flashTitle('⏰ 时间到！');
  }
}
let titleFlashTimer = null;
function flashTitle(text) {
  const original = '⌜ Zest 个人主页 ⌟';
  const realTitle = document.title;
  let on = false, n = 0;
  clearInterval(titleFlashTimer);
  titleFlashTimer = setInterval(() => {
    document.title = on ? realTitle : text;
    on = !on;
    if (++n > 10) { clearInterval(titleFlashTimer); document.title = realTitle; }
  }, 600);
}
function initPomo() {
  const start = document.getElementById('pomo-start');
  const reset = document.getElementById('pomo-reset');
  if (!start) return;
  start.addEventListener('click', startPomo);
  reset.addEventListener('click', resetPomo);
  document.querySelectorAll('.pomo-mode').forEach(b =>
    b.addEventListener('click', () => setPomoMode(Number(b.dataset.min)))
  );
  renderPomo();
}
```

> 注：`flashTitle` 内的 `original` 变量未使用可删；保留 `realTitle = document.title` 即可。实现时直接用下面精简版替换上面 `flashTitle`：
```js
function flashTitle(text) {
  const realTitle = document.title;
  let on = false, n = 0;
  clearInterval(titleFlashTimer);
  titleFlashTimer = setInterval(() => {
    document.title = on ? realTitle : text;
    on = !on;
    if (++n > 10) { clearInterval(titleFlashTimer); document.title = realTitle; }
  }, 600);
}
```

- [ ] **Step 2: 在 init() 中调用**

在 `renderTaskList();` 之后加：
```js
  initPomo();
```

- [ ] **Step 3: 新增番茄钟样式**

styles.css 末尾新增：
```css
/* ===== 番茄钟 ===== */
.pomo { text-align: center; padding: 10px 0 2px; }
.pomo-time {
  font-size: 3rem; line-height: 1; color: var(--text-strong);
  font-variant-numeric: tabular-nums; margin-bottom: 14px;
}
.pomo-modes { display: flex; gap: 6px; justify-content: center; margin-bottom: 16px; }
.pomo-mode {
  font-size: 0.66rem; font-weight: 800; padding: 4px 11px; border-radius: 10px;
  color: var(--text-muted); background: rgba(255, 255, 255, 0.5); border: none;
  cursor: pointer; font-family: inherit; transition: background 0.2s var(--ease), color 0.2s var(--ease);
}
.pomo-mode.on { background: var(--accent); color: #fff; }
.pomo-btns { display: flex; gap: 8px; justify-content: center; }
.pomo-btns button {
  border: none; border-radius: 10px; padding: 9px 20px; font-weight: 800;
  font-size: 0.82rem; cursor: pointer; font-family: inherit;
}
.pomo-start { background: var(--accent); color: #fff; }
.pomo-reset { background: rgba(255, 255, 255, 0.6); color: var(--text-body); }
.pomo-count { font-size: 0.68rem; color: var(--text-muted); margin-top: 14px; }
```

- [ ] **Step 4: 验证**

Run: `npx wrangler dev`，「🍅 番茄钟」面板：
- 切换专注25/短休5/长休15 → 时间显示对应分钟、高亮切换。
- 点开始 → 倒计时，按钮变「暂停」；首次会弹通知授权请求。
- 暂停/重置正常。
- 快速验证跑完：把 `<input type="time">` 不用；在控制台执行 `POMO.remaining=2; if(POMO.running){POMO.endAt=Date.now()+2000}` 后等 2 秒（或直接 `finishPomo()`）→ 专注模式番茄数 +1，已授权则弹桌面通知，否则标题闪烁。
- 刷新后番茄数仍在；用 Task 5 的跨日重置法验证番茄数归零。

- [ ] **Step 5: Commit**

```bash
git add public/main.js public/styles.css
git commit -m "feat: pomodoro timer with desktop notification"
```

---

## Task 7: 灵感生成器后端 /api/inspire

**Files:**
- Modify: `wrangler.toml`（新增 `[ai]` 绑定）
- Modify: `worker.js`（新增 `/api/inspire` 路由）

- [ ] **Step 1: 加 AI 绑定**

在 `wrangler.toml` 末尾追加：
```toml

[ai]
binding = "AI"
```

- [ ] **Step 2: 新增 /api/inspire 路由**

在 `worker.js` 的 `/api/weather` 分支之后插入：
```js
    if (url.pathname === '/api/inspire') {
      const category = url.searchParams.get('category') || 'project';
      const prompts = {
        project: '给我一个独立开发者可以用业余时间做出来的有趣小项目点子，一句话描述，要具体、新颖、可落地。',
        writing: '给我一个适合写一篇博客或短文的写作选题，一句话，角度新鲜、能引发思考。',
        random: '给我一个有意思的灵感，可以是项目、写作、生活实验或学习方向，任意类型，一句话，出人意料一点。',
      };
      const userPrompt = prompts[category] || prompts.project;
      try {
        const r = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [
            { role: 'system', content: '你是一个富有创意的中文灵感助手。只输出一句简洁的中文灵感，不要加引号、编号或多余解释，控制在 60 字以内。' },
            { role: 'user', content: userPrompt },
          ],
        });
        const text = ((r && r.response) || '').trim();
        return Response.json({ text }, { headers: { 'cache-control': 'no-store' } });
      } catch (e) {
        return Response.json({ error: String(e) }, { status: 502 });
      }
    }
```

- [ ] **Step 3: 验证接口**

Run: `npx wrangler dev`（需 Cloudflare 登录，AI 走远端）然后 `curl -s "http://localhost:8787/api/inspire?category=project"`
Expected: 返回 `{"text":"...一句中文灵感..."}`。换 `category=writing`、`category=random` 各试一次内容不同。
若本地 AI 报错，执行 `npx wrangler deploy` 后用线上域名 curl 验证。

- [ ] **Step 4: Commit**

```bash
git add wrangler.toml worker.js
git commit -m "feat: add /api/inspire using cloudflare workers ai"
```

---

## Task 8: 灵感生成器前端卡

**Files:**
- Modify: `public/main.js`（新增 `renderInspire`、`loadInspire`、`initInspire`；`init` 调整）
- Modify: `public/styles.css`（新增 `.c-insp` 样式 + token）

- [ ] **Step 1: 新增灵感卡逻辑**

在 `renderAihot()`/`loadAihot()` 之后新增：
```js
// ===== 灵感生成器 =====
const INSPIRE_CATS = [
  { key: 'project', name: '项目点子' },
  { key: 'writing', name: '写作选题' },
  { key: 'random', name: '随便来点' },
];
let inspCat = 'project';

function renderInspire() {
  const cats = INSPIRE_CATS.map((c, i) =>
    `<button class="insp-cat${i === 0 ? ' on' : ''}" data-cat="${c.key}">${c.name}</button>`
  ).join('');
  return el(`
    <section class="card c-insp span-2" id="inspire">
      <p class="label">💡 灵感生成器</p>
      <div class="insp-cats">${cats}</div>
      <div class="insp-out" id="insp-out">点下面按钮，给你来点灵感 ✦</div>
      <button class="insp-btn" id="insp-btn">✨ 换一个灵感</button>
    </section>
  `);
}

async function loadInspire() {
  const out = document.getElementById('insp-out');
  const btn = document.getElementById('insp-btn');
  if (!out) return;
  out.classList.add('loading');
  out.textContent = '生成中…';
  btn.disabled = true;
  try {
    const res = await fetch('/api/inspire?category=' + encodeURIComponent(inspCat));
    if (!res.ok) throw new Error('status ' + res.status);
    const data = await res.json();
    out.textContent = (data.text && data.text.trim()) || '灵感暂时枯竭了，再点一次试试';
  } catch (e) {
    out.textContent = '灵感暂时枯竭了，再点一次试试';
  } finally {
    out.classList.remove('loading');
    btn.disabled = false;
  }
}

function initInspire() {
  const btn = document.getElementById('insp-btn');
  if (!btn) return;
  btn.addEventListener('click', loadInspire);
  document.querySelectorAll('.insp-cat').forEach(b =>
    b.addEventListener('click', () => {
      inspCat = b.dataset.cat;
      document.querySelectorAll('.insp-cat').forEach(x => x.classList.toggle('on', x === b));
    })
  );
}
```

- [ ] **Step 2: 调整 init()**

在 `renderTools().forEach(...)` 之后、`bento.append(renderEnglish());` 之前加：
```js
  bento.append(renderInspire());
```
在 `initPomo();` 之后加：
```js
  initInspire();
```

- [ ] **Step 3: 新增灵感卡样式与 token**

`:root` 分类色加：
```css
  --c-insp: rgba(250, 224, 232, 0.32);
```
`@supports not (...)` 降级块加：
```css
  .c-insp { background: rgba(251, 230, 238, 0.9); }
```
styles.css 末尾新增：
```css
/* ===== 灵感生成器卡 ===== */
.c-insp { background: var(--c-insp); display: flex; flex-direction: column; }
.c-insp .label { color: #b05a72; }
.insp-cats { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.insp-cat {
  font-size: 0.66rem; font-weight: 700; padding: 4px 11px; border-radius: 11px;
  background: rgba(255, 255, 255, 0.5); color: #b05a72; border: none;
  cursor: pointer; font-family: inherit; transition: background 0.2s var(--ease), color 0.2s var(--ease);
}
.insp-cat.on { background: #c06480; color: #fff; }
.insp-out {
  flex: 1; background: rgba(255, 255, 255, 0.55); border-radius: 12px; padding: 14px;
  min-height: 80px; font-size: 0.9rem; line-height: 1.55; color: var(--text-strong);
}
.insp-out.loading { color: var(--text-muted); }
.insp-btn {
  margin-top: 12px; width: 100%; border: none; border-radius: 11px; padding: 11px;
  font-weight: 800; font-size: 0.85rem; background: #c06480; color: #fff;
  cursor: pointer; font-family: inherit;
}
.insp-btn:disabled { opacity: 0.6; cursor: default; }
```

- [ ] **Step 4: 验证**

Run: `npx wrangler dev`，打开页面，找到灵感卡（在工具卡下方，占 2 列）：
- 点「✨ 换一个灵感」→ 显示「生成中…」→ 出现一句中文灵感。
- 切换「写作选题/随便来点」类别后再点 → 内容风格不同。
- 断网或后端报错时显示「灵感暂时枯竭了…」兜底。
- 控制台无报错。

- [ ] **Step 5: Commit**

```bash
git add public/main.js public/styles.css
git commit -m "feat: add AI inspiration generator card"
```

---

## Task 9: 整体回归与文档

**Files:**
- Modify: `项目说明.md`（若有相关章节，补充新卡片说明）

- [ ] **Step 1: 全量浏览器回归**

Run: `npx wrangler dev`，逐项确认：
- 顶部时间条（时间走秒 + 温州天气）。
- 仪表盘卡两 Tab：今日清单增删勾选/时间轴/随时做分组、番茄钟计时与通知。
- 灵感卡三类别生成。
- 工具卡两张可点进入。英语格言、AI 日报正常。
- 状态卡、GitHub 卡确实消失。
- 响应式三档（桌面 4 列 / `≤768px` 2 列 / `≤480px` 1 列）布局不错位。
- 控制台无报错、无 404。

- [ ] **Step 2: 更新项目说明（如适用）**

若 `项目说明.md` 列了卡片清单，更新为：顶栏（时间+天气）、仪表盘（待办/日程+番茄钟）、Hero、工具×2、灵感生成器、英语、AI 日报；并记录新接口 `/api/weather`、`/api/inspire` 与 `[ai]` 绑定。

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs: update project guide for dashboard redesign"
```

- [ ] **Step 4: 部署（用户确认后）**

Run: `npx wrangler deploy`
Expected: 部署成功，线上验证天气与灵感接口（Workers AI 在线上稳定可用）。

---

## Self-Review 记录

- **Spec 覆盖**：删除卡(T1)✓、顶栏时间+天气(T2/T3)✓、仪表盘合并清单(T4/T5)✓、番茄钟+通知(T6)✓、灵感后端(T7)+前端(T8)✓、每日重置(T4 逻辑、T5/T6 验证)✓、布局顺序(T4 init)✓、响应式与降级(各任务样式 + T9 回归)✓。
- **类型/命名一致性**：`store`/`saveStore()`/`STORE_KEY` 全程一致；`store.tasks` 元素结构 `{id,text,time,done,createdAt}` 在 add/toggle/delete/render 一致；`POMO` 字段一致；`inspCat` 与 `INSPIRE_CATS[].key`、worker `prompts` 的 key（project/writing/random）一致；DOM id（`task-list`/`pomo-time`/`insp-out` 等）渲染与读取一致。
- **占位符**：无 TODO/TBD；每个代码步骤含完整代码。`flashTitle` 给了精简替换版避免无用变量。
