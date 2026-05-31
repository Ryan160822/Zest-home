// Prompt 模板库 —— 数据存在 localStorage，支持增删改查、搜索、{{变量}} 填充
const STORAGE_KEY = 'zest_prompts';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const SEED = [
  { id: uid(), title: '通用润色', tags: ['写作'], content: '请帮我润色下面这段文字，让它更{{风格}}，同时保持原意：\n\n{{内容}}' },
  { id: uid(), title: '代码解释', tags: ['开发'], content: '用通俗易懂的语言解释下面这段代码的作用和思路：\n\n```\n{{代码}}\n```' },
  { id: uid(), title: '周报生成', tags: ['效率'], content: '根据以下要点，帮我写一份语气专业、简洁的本周工作周报：\n\n{{要点}}' },
];

let prompts = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* 忽略损坏数据，回退到种子 */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
  return SEED.slice();
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

// ===== 元素 =====
const grid = document.getElementById('prompt-grid');
const emptyState = document.getElementById('empty-state');
const search = document.getElementById('search');
const addBtn = document.getElementById('add-btn');
const toast = document.getElementById('toast');

const editorDialog = document.getElementById('editor-dialog');
const editorTitle = document.getElementById('editor-title');
const edForm = editorDialog.querySelector('form');
const edTitle = document.getElementById('ed-title');
const edTags = document.getElementById('ed-tags');
const edContent = document.getElementById('ed-content');
const edCancel = document.getElementById('ed-cancel');

const fillDialog = document.getElementById('fill-dialog');
const fillFields = document.getElementById('fill-fields');
const fillOutput = document.getElementById('fill-output');
const fillCopy = document.getElementById('fill-copy');
const fillClose = document.getElementById('fill-close');

let editingId = null;
let fillTemplate = '';

// ===== 工具函数 =====
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2000);
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function extractVars(text) {
  const re = /\{\{\s*([^}]+?)\s*\}\}/g;
  const seen = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    if (!seen.includes(m[1])) seen.push(m[1]);
  }
  return seen;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('已复制到剪贴板');
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('已复制到剪贴板');
    } catch (e2) {
      showToast('复制失败，请手动复制');
    }
    ta.remove();
  }
}

// ===== 渲染 =====
function render() {
  const q = search.value.trim().toLowerCase();
  const list = prompts.filter((p) =>
    !q ||
    p.title.toLowerCase().includes(q) ||
    p.content.toLowerCase().includes(q) ||
    (p.tags || []).some((t) => t.toLowerCase().includes(q))
  );

  grid.innerHTML = '';
  if (list.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent = prompts.length === 0
      ? '还没有模板，点「新建」添加一个吧。'
      : '没有匹配的模板。';
  } else {
    emptyState.hidden = true;
    list.forEach((p) => grid.appendChild(card(p)));
  }
}

function card(p) {
  const vars = extractVars(p.content);
  const el = document.createElement('div');
  el.className = 'prompt-item';
  const tags = (p.tags || []).map((t) => `<span class="chip">${escapeHtml(t)}</span>`).join('');
  const varChip = vars.length ? `<span class="chip var-badge">${vars.length} 个变量</span>` : '';
  el.innerHTML = `
    <h3>${escapeHtml(p.title)}</h3>
    <div class="prompt-tags">${tags}${varChip}</div>
    <div class="prompt-preview">${escapeHtml(p.content)}</div>
    <div class="prompt-actions">
      <button class="btn btn-primary" data-act="use">${vars.length ? '填写并复制' : '复制'}</button>
      <button class="btn" data-act="edit">编辑</button>
      <button class="btn btn-danger" data-act="del">删除</button>
    </div>
  `;
  el.querySelector('[data-act="use"]').addEventListener('click', () => use(p));
  el.querySelector('[data-act="edit"]').addEventListener('click', () => openEditor(p));
  el.querySelector('[data-act="del"]').addEventListener('click', () => del(p));
  return el;
}

// ===== 使用（复制 / 变量填充） =====
function use(p) {
  const vars = extractVars(p.content);
  if (vars.length === 0) {
    copyText(p.content);
    return;
  }
  fillTemplate = p.content;
  fillFields.innerHTML = '';
  vars.forEach((v) => {
    const wrap = document.createElement('div');
    wrap.className = 'field';
    const label = document.createElement('label');
    label.textContent = v;
    const ta = document.createElement('textarea');
    ta.rows = 2;
    ta.dataset.var = v;
    ta.placeholder = `填写「${v}」…`;
    ta.addEventListener('input', updateFillOutput);
    wrap.appendChild(label);
    wrap.appendChild(ta);
    fillFields.appendChild(wrap);
  });
  updateFillOutput();
  fillDialog.showModal();
}

function updateFillOutput() {
  const values = {};
  fillFields.querySelectorAll('textarea').forEach((t) => { values[t.dataset.var] = t.value; });
  fillOutput.textContent = fillTemplate.replace(
    /\{\{\s*([^}]+?)\s*\}\}/g,
    (m, name) => (values[name] ? values[name] : `{{${name}}}`)
  );
}

// ===== 新建 / 编辑 =====
function openEditor(p) {
  editingId = p ? p.id : null;
  editorTitle.textContent = p ? '编辑模板' : '新建模板';
  edTitle.value = p ? p.title : '';
  edTags.value = p ? (p.tags || []).join(', ') : '';
  edContent.value = p ? p.content : '';
  editorDialog.showModal();
}

function del(p) {
  if (!confirm(`确定删除「${p.title}」？`)) return;
  prompts = prompts.filter((x) => x.id !== p.id);
  persist();
  render();
  showToast('已删除');
}

// ===== 事件 =====
addBtn.addEventListener('click', () => openEditor(null));
search.addEventListener('input', render);
edCancel.addEventListener('click', () => editorDialog.close());

edForm.addEventListener('submit', () => {
  // method="dialog"：表单通过 required 校验后提交，对话框会自动关闭
  const title = edTitle.value.trim();
  const content = edContent.value.trim();
  const tags = edTags.value.split(',').map((s) => s.trim()).filter(Boolean);
  if (editingId) {
    const p = prompts.find((x) => x.id === editingId);
    if (p) { p.title = title; p.content = content; p.tags = tags; }
  } else {
    prompts.unshift({ id: uid(), title, content, tags });
  }
  persist();
  render();
  showToast('已保存');
});

fillClose.addEventListener('click', () => fillDialog.close());
fillCopy.addEventListener('click', () => copyText(fillOutput.textContent));

render();
