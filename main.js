// ===== 内容数据（日后替换真实内容只改这里） =====
const SITE = {
  profile: {
    initial: 'Z',
    name: 'Zest',
    role: 'Vibe Coder · Builder',
    bio: '喜欢用 AI 构建有趣的东西，分享工具、作品和思考。',
    tags: ['🔧 工具', '✨ 作品', '📝 文章'],
  },
  status: { text: '在做项目', detail: 'AI 写作工具' },
  github: { repos: 42, stars: 128 },
  tools: [
    { icon: '🔳', name: '二维码生成器', cls: 'c-tool1', href: 'tools/qr.html' },
    { icon: '📋', name: 'Prompt 模板库', cls: 'c-tool2', href: 'tools/prompts.html' },
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
  // 页脚社交链接（把 href 换成你自己的真实地址）
  footerTagline: '想聊聊？在这里找我',
  social: [
    { name: 'GitHub', icon: 'github', href: 'https://github.com/Ryan160822' },
    { name: 'Telegram', icon: 'telegram', href: 'https://t.me/ZestWit' },
    { name: '邮箱', icon: 'mail', href: 'mailto:qrbaba0214@gmail.com' },
  ],
};

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

function renderTools() {
  return SITE.tools.map((t, i) => el(`
    <a class="card ${t.cls} tool" href="${t.href}"${i === 0 ? ' id="tools"' : ''}>
      <div class="tool-icon">${t.icon}</div>
      <p class="label">工具</p>
      <p class="tool-name">${t.name}</p>
    </a>
  `));
}

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

// ===== 渲染入口 =====
function init() {
  const bento = document.getElementById('bento');
  bento.innerHTML = '';
  bento.append(renderHero());
  bento.append(renderStatus());
  bento.append(renderStats());
  renderTools().forEach(c => bento.append(c));
  bento.append(renderFeatured());
  bento.append(renderArticles());
  renderFooter();
}

document.addEventListener('DOMContentLoaded', init);
