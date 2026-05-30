// 内容数据与渲染逻辑将在后续任务填充
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

document.addEventListener('DOMContentLoaded', init);
