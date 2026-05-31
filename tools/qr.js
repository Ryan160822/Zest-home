// 二维码生成器 —— 依赖 CDN 的 qrcode 库（window.QRCode）
const input = document.getElementById('qr-input');
const sizeSel = document.getElementById('qr-size');
const eclSel = document.getElementById('qr-ecl');
const canvas = document.getElementById('qr-canvas');
const output = document.getElementById('qr-output');
const downloadBtn = document.getElementById('qr-download');
const toast = document.getElementById('toast');

let hasCode = false;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

function showEmpty(message) {
  hasCode = false;
  canvas.style.display = 'none';
  downloadBtn.disabled = true;
  let empty = output.querySelector('.qr-empty');
  if (!empty) {
    empty = document.createElement('p');
    empty.className = 'qr-empty';
    output.appendChild(empty);
  }
  empty.textContent = message;
}

function render() {
  const text = input.value.trim();
  const size = parseInt(sizeSel.value, 10);

  if (!text) {
    showEmpty('输入内容后这里会显示二维码');
    return;
  }
  if (typeof QRCode === 'undefined') {
    showEmpty('二维码库加载失败，请检查网络后刷新');
    return;
  }

  const empty = output.querySelector('.qr-empty');
  if (empty) empty.remove();
  canvas.style.display = 'block';

  QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 2,
    errorCorrectionLevel: eclSel.value,
    color: { dark: '#2a2a38', light: '#ffffff' },
  }, (err) => {
    if (err) {
      showEmpty('内容过长，无法生成二维码');
      return;
    }
    hasCode = true;
    downloadBtn.disabled = false;
  });
}

function download() {
  if (!hasCode) return;
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = 'qrcode.png';
  a.click();
  showToast('已下载 PNG');
}

input.addEventListener('input', render);
sizeSel.addEventListener('change', render);
eclSel.addEventListener('change', render);
downloadBtn.addEventListener('click', download);

render();
