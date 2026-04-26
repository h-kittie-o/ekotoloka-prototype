(function () {
  'use strict';

  const HTML_TO_IMAGE_SRC = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.13/dist/html-to-image.min.js';

  const FORMATS = {
    square: { w: 1080, h: 1080, name: 'square' },
    story:  { w: 1080, h: 1920, name: 'story' },
    tiktok: { w: 1080, h: 1920, name: 'tiktok' },
  };

  let libPromise = null;
  function loadLib() {
    if (window.htmlToImage) return Promise.resolve(window.htmlToImage);
    if (libPromise) return libPromise;
    libPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = HTML_TO_IMAGE_SRC;
      s.onload = () => resolve(window.htmlToImage);
      s.onerror = () => reject(new Error('html-to-image not loaded'));
      document.head.appendChild(s);
    });
    return libPromise;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function captureCardPng(card) {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const lib = await loadLib();
    return lib.toPng(card, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#FAFAF7',
    });
  }

  async function generatePng(card, fmt) {
    const cardDataUrl = await captureCardPng(card);
    const img = await loadImage(cardDataUrl);

    const canvas = document.createElement('canvas');
    canvas.width = fmt.w;
    canvas.height = fmt.h;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, fmt.w, fmt.h);
    grad.addColorStop(0, '#FAFAF7');
    grad.addColorStop(1, '#EDF7F0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, fmt.w, fmt.h);

    const isTall = fmt.h > fmt.w;
    const sidePadding = isTall ? 60 : 80;
    const maxW = fmt.w - sidePadding * 2;
    const scale = maxW / img.width;
    const drawW = maxW;
    const drawH = img.height * scale;
    const taglineH = isTall ? 220 : 0;
    const drawX = sidePadding;
    const drawY = Math.max(sidePadding, (fmt.h - drawH - taglineH) / 2);

    ctx.shadowColor = 'rgba(26, 46, 31, 0.18)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    if (isTall) {
      const cy = drawY + drawH + 100;
      ctx.fillStyle = '#245A34';
      ctx.font = '700 56px Unbounded, "Inter", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Долучайся до толоки', fmt.w / 2, cy);
      ctx.fillStyle = '#4A5750';
      ctx.font = '500 36px Inter, system-ui, sans-serif';
      ctx.fillText('ekotoloka.org', fmt.w / 2, cy + 60);
    }

    return canvas.toDataURL('image/png');
  }

  function download(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function selectFormat(btn) {
    const group = btn.parentElement;
    group.querySelectorAll('.share-format-btn').forEach(b => {
      b.classList.remove('is-selected');
      b.setAttribute('aria-checked', 'false');
      b.style.borderColor = 'transparent';
    });
    btn.classList.add('is-selected');
    btn.setAttribute('aria-checked', 'true');
    btn.style.borderColor = '#2E7D47';
  }

  function getSelectedFormat(targetId) {
    const btn = document.querySelector(`.share-format-btn.is-selected[data-share-target="${targetId}"]`)
      || document.querySelector(`.share-format-btn[data-share-target="${targetId}"]`);
    const key = btn && btn.dataset.shareFormat;
    return FORMATS[key] || FORMATS.square;
  }

  document.addEventListener('click', (e) => {
    const fmtBtn = e.target.closest('.share-format-btn');
    if (fmtBtn) { e.preventDefault(); selectFormat(fmtBtn); return; }
  });

  document.addEventListener('click', async (e) => {
    const dl = e.target.closest('[data-share-download]');
    if (!dl) return;
    e.preventDefault();
    const targetId = dl.dataset.shareTarget;
    const card = document.getElementById(targetId);
    if (!card) return;

    const label = dl.querySelector('[data-share-label]') || dl;
    const original = label.textContent;
    dl.disabled = true;
    label.textContent = 'Генеруємо…';

    try {
      const fmt = getSelectedFormat(targetId);
      const dataUrl = await generatePng(card, fmt);
      const filename = `ekotoloka-${targetId}-${fmt.name}.png`;
      download(dataUrl, filename);
      if (window.showToast) window.showToast('Файл завантажено');
    } catch (err) {
      console.error('[share-card]', err);
      if (window.showToast) window.showToast('Не вдалось згенерувати');
      else alert('Не вдалось згенерувати PNG');
    } finally {
      dl.disabled = false;
      label.textContent = original;
    }
  });

  document.querySelectorAll('.share-format-btn.is-selected').forEach(selectFormat);
})();
