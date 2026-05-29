(function () {
  'use strict';

  const FORMATS = {
    square: { src: 'assets/share-card-square.png?v=20260529b', name: 'square' },
    story:  { src: 'assets/share-card-story.png?v=20260529b',  name: 'story' },
    tiktok: { src: 'assets/share-card-story.png?v=20260529b',  name: 'tiktok' },
  };

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

  function download(src, filename) {
    const a = document.createElement('a');
    a.href = src;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  document.addEventListener('click', (e) => {
    const fmtBtn = e.target.closest('.share-format-btn');
    if (fmtBtn) { e.preventDefault(); selectFormat(fmtBtn); return; }
  });

  document.addEventListener('click', (e) => {
    const dl = e.target.closest('[data-share-download]');
    if (!dl) return;
    e.preventDefault();
    const targetId = dl.dataset.shareTarget || 'card';
    const fmt = getSelectedFormat(targetId);
    const filename = `ekotoloka-${targetId}-${fmt.name}.png`;
    download(fmt.src, filename);
    if (window.showToast) window.showToast('Файл завантажено');
  });

  document.querySelectorAll('.share-format-btn.is-selected').forEach(selectFormat);
})();
