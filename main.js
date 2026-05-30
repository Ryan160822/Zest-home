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

// ===== 渲染入口 =====
function init() {
  const bento = document.getElementById('bento');
  bento.innerHTML = '';
  bento.append(renderHero());
  bento.append(renderStatus());
  bento.append(renderStats());
  // 各卡片渲染函数在后续任务中依次实现并在此调用：
  // bento.append(renderHero());
  // bento.append(renderStatus());
  // bento.append(renderStats());
  // renderTools().forEach(c => bento.append(c));
  // bento.append(renderFeatured());
  // bento.append(renderArticles());
}

document.addEventListener('DOMContentLoaded', init);
