(function () {
  'use strict';

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function setPosition(slider, percent) {
    const p = clamp(percent, 0, 100);
    const before = slider.querySelector('.ba-slider__before');
    const divider = slider.querySelector('.ba-slider__divider');
    if (before) before.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
    if (divider) divider.style.left = `${p}%`;
    slider.setAttribute('aria-valuenow', String(Math.round(p)));
    slider.dataset.position = String(p);
  }

  function pctFromEvent(slider, clientX) {
    const rect = slider.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  function init(slider) {
    if (slider.dataset.baInit === '1') return;
    slider.dataset.baInit = '1';

    if (!slider.hasAttribute('role')) slider.setAttribute('role', 'slider');
    if (!slider.hasAttribute('tabindex')) slider.setAttribute('tabindex', '0');
    slider.setAttribute('aria-valuemin', '0');
    slider.setAttribute('aria-valuemax', '100');

    const start = parseFloat(slider.dataset.start);
    setPosition(slider, Number.isFinite(start) ? start : 50);

    let dragging = false;

    const onMove = (e) => {
      if (!dragging) return;
      e.preventDefault();
      setPosition(slider, pctFromEvent(slider, e.clientX));
    };

    const stopDrag = () => {
      if (!dragging) return;
      dragging = false;
      slider.classList.remove('is-dragging');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', stopDrag);
      window.removeEventListener('pointercancel', stopDrag);
    };

    const startDrag = (e) => {
      dragging = true;
      slider.classList.add('is-dragging');
      slider.focus({ preventScroll: true });
      setPosition(slider, pctFromEvent(slider, e.clientX));
      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', stopDrag);
      window.addEventListener('pointercancel', stopDrag);
    };

    slider.addEventListener('pointerdown', startDrag);

    slider.addEventListener('keydown', (e) => {
      const cur = parseFloat(slider.dataset.position) || 50;
      const step = e.shiftKey ? 10 : 2;
      let next = cur;
      switch (e.key) {
        case 'ArrowLeft':  next = cur - step; break;
        case 'ArrowRight': next = cur + step; break;
        case 'Home':       next = 0; break;
        case 'End':        next = 100; break;
        default: return;
      }
      e.preventDefault();
      setPosition(slider, next);
    });
  }

  function initAll(root) {
    (root || document).querySelectorAll('.ba-slider').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAll());
  } else {
    initAll();
  }

  window.EkoBeforeAfter = { init, initAll, setPosition };
})();
