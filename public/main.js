// ===== 内容数据（日后替换真实内容只改这里） =====
const SITE = {
  profile: {
    initial: 'Z',
    name: 'Zest',
    role: 'Vibe Coder · Builder',
    bio: '喜欢用 AI 构建有趣的东西，分享工具、作品和思考。',
    tags: ['🔧 工具', '✨ 作品', '📝 文章'],
  },
  tools: [
    { icon: '🔳', name: '二维码生成器', cls: 'c-tool1', href: 'tools/qr.html' },
    { icon: '📋', name: 'Prompt 模板库', cls: 'c-tool2', href: 'tools/prompts.html' },
  ],
  // 每次进入主页随机显示一句（英文 + 中文翻译）
  englishQuotes: [
    { en: "Build something you'd want to use yourself.", zh: '做一个你自己也想用的东西。' },
    { en: 'Ship small, ship often.', zh: '小步快跑，频繁交付。' },
    { en: 'Make it work, make it right, make it fast.', zh: '先让它能跑，再让它正确，最后让它快。' },
    { en: 'The best way to predict the future is to invent it.', zh: '预测未来最好的方式，就是亲手创造它。' },
    { en: 'Simplicity is the ultimate sophistication.', zh: '至简，即是至臻。' },
    { en: 'Done is better than perfect.', zh: '完成，胜过完美。' },
    { en: 'Great things are built one commit at a time.', zh: '伟大，是一次次提交累积而成。' },
    { en: 'Stay hungry, stay foolish.', zh: '求知若饥，虚心若愚。' },
    { en: 'Curiosity is the engine of achievement.', zh: '好奇心是成就的引擎。' },
    { en: 'Talk is cheap. Show me the code.', zh: '别空谈，把代码给我看。' },
  ],
  // AIHOT 每日 AI 日报
  aihot: { href: 'https://aihot.virxact.com/daily' },
  // 页脚社交链接（把 href 换成你自己的真实地址）
  footerTagline: '想聊聊？在这里找我',
  social: [
    { name: 'GitHub', icon: 'github', href: 'https://github.com/Ryan160822' },
    { name: 'Telegram', icon: 'telegram', href: 'https://t.me/ZestWit' },
    // 想加回邮箱：取消下一行注释并填上地址（mail 图标已保留）
    // { name: '邮箱', icon: 'mail', href: 'mailto:你的邮箱' },
  ],
};

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

// ===== 图标（SVG，可在此扩展更多平台） =====
const ICONS = {
  github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
};

// ===== 工具函数 =====
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

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

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Date.now() + '-' + Math.floor(Math.random() * 1e9);
}

function addTask(text, time) {
  text = (text || '').trim();
  if (!text) return;
  store.tasks.push({
    id: newId(),
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

function renderTools() {
  return SITE.tools.map((t, i) => el(`
    <a class="card ${t.cls} tool" href="${t.href}"${i === 0 ? ' id="tools"' : ''}>
      <div class="tool-icon">${t.icon}</div>
      <p class="label">工具</p>
      <p class="tool-name">${t.name}</p>
    </a>
  `));
}

function renderFooter() {
  const footer = document.getElementById('footer');
  const links = SITE.social.map(s => {
    const external = s.href.startsWith('http');
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `
      <a class="social-link" href="${s.href}"${attrs} aria-label="${s.name}">
        <span class="social-icon">${ICONS[s.icon]}</span>
        <span class="social-name">${s.name}</span>
      </a>
    `;
  }).join('');
  footer.innerHTML = `
    <p class="footer-tagline serif">${SITE.footerTagline}</p>
    <nav class="social-links" aria-label="社交链接">${links}</nav>
    <p class="footer-copy">© ${new Date().getFullYear()} ${SITE.profile.name} · Built with Vibe Coding</p>
  `;
}

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

function startClock() {
  const timeEl = document.getElementById('clock-time');
  const metaEl = document.getElementById('clock-meta');
  if (!timeEl || !metaEl) return;
  const tz = 'Asia/Shanghai';
  const timeFmt = new Intl.DateTimeFormat('zh-CN', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  const weekdayFmt = new Intl.DateTimeFormat('zh-CN', { timeZone: tz, weekday: 'long' });
  const dateFmt = new Intl.DateTimeFormat('zh-CN', { timeZone: tz, month: 'long', day: 'numeric' });
  function tick() {
    const now = new Date();
    timeEl.textContent = timeFmt.format(now);
    metaEl.textContent = `${weekdayFmt.format(now)} · ${dateFmt.format(now)}`;
  }
  tick();
  setInterval(tick, 1000);
}

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
    const hi = daily.temperature_2m_max?.length ? Math.round(daily.temperature_2m_max[0]) : null;
    const lo = daily.temperature_2m_min?.length ? Math.round(daily.temperature_2m_min[0]) : null;
    const feels = cur.apparent_temperature != null ? `体感 ${Math.round(cur.apparent_temperature)}°` : '';
    const range = (hi != null && lo != null) ? `${lo}° / ${hi}°` : '';
    metaEl.textContent = [w.l, range, feels].filter(Boolean).join(' · ');
  } catch (e) {
    iconEl.textContent = '🌡️';
    tempEl.textContent = '--°';
    metaEl.textContent = '天气加载失败';
  }
}

function renderEnglish() {
  const list = SITE.englishQuotes;
  const q = list[Math.floor(Math.random() * list.length)];
  return el(`
    <section class="card c-english span-3" id="english">
      <p class="english-quote serif">${q.en}</p>
      <p class="english-zh">${q.zh}</p>
    </section>
  `);
}

function renderAihot() {
  const card = el(`
    <section class="card c-aihot aihot-daily span-4" id="aihot">
      <div class="aihot-head">
        <p class="label">🔥 今日 AI 日报</p>
        <a class="aihot-all" href="${SITE.aihot.href}" target="_blank" rel="noopener noreferrer">查看全部 →</a>
      </div>
      <div class="aihot-list" id="aihot-list"><p class="aihot-loading">加载中…</p></div>
    </section>
  `);
  loadAihot(card);
  return card;
}

async function loadAihot(card) {
  const list = card.querySelector('#aihot-list');
  const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : SITE.aihot.href);
  try {
    const res = await fetch('/api/daily', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('status ' + res.status);
    const data = await res.json();
    const items = [];
    (data.sections || []).forEach((sec) =>
      (sec.items || []).forEach((it) => items.push({ title: it.title, url: it.sourceUrl, source: it.sourceName, section: sec.label }))
    );
    if (items.length === 0) throw new Error('empty');
    if (data.date) card.querySelector('.label').textContent = `🔥 今日 AI 日报 · ${data.date}`;
    list.innerHTML = '';
    items.slice(0, 6).forEach((it) => {
      const a = document.createElement('a');
      a.className = 'aihot-item';
      a.href = safeUrl(it.url);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      const sec = document.createElement('span');
      sec.className = 'aihot-sec';
      sec.textContent = it.section || '';
      const t = document.createElement('span');
      t.className = 'aihot-item-title';
      t.textContent = it.title || '';
      const src = document.createElement('span');
      src.className = 'aihot-src';
      src.textContent = it.source || '';
      a.append(sec, t, src);
      list.appendChild(a);
    });
  } catch (e) {
    list.innerHTML = '';
    const a = document.createElement('a');
    a.className = 'aihot-fallback';
    a.href = SITE.aihot.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = '暂时无法加载，点此前往 AI 日报 →';
    list.appendChild(a);
  }
}

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

// ===== 渲染入口 =====
function init() {
  const bento = document.getElementById('bento');
  bento.innerHTML = '';
  applyDailyReset();
  bento.append(renderTopbar());
  bento.append(renderDashboard());
  bento.append(renderHero());
  renderTools().forEach(c => bento.append(c));
  bento.append(renderInspire());
  bento.append(renderEnglish());
  bento.append(renderAihot());
  startClock();
  loadWeather();
  initDashboardTabs();
  initTaskInput();
  renderTaskList();
  initPomo();
  initInspire();
  renderFooter();
}

document.addEventListener('DOMContentLoaded', init);
