// Екотолока — Prototype interactions

(() => {
  'use strict';

  // ===== Mobile drawer =====
  const burger = document.querySelector('[data-burger]');
  const drawer = document.querySelector('[data-drawer]');
  const drawerClose = document.querySelector('[data-drawer-close]');
  if (burger && drawer) {
    burger.addEventListener('click', () => drawer.classList.add('is-open'));
    if (drawerClose) drawerClose.addEventListener('click', () => drawer.classList.remove('is-open'));
    drawer.addEventListener('click', (e) => { if (e.target === drawer) drawer.classList.remove('is-open'); });
  }

  // ===== Tabs =====
  document.querySelectorAll('[data-tabs]').forEach((group) => {
    const buttons = group.querySelectorAll('[data-tab]');
    const panels = document.querySelectorAll(`[data-tab-panel][data-group="${group.dataset.tabs}"]`);
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('is-active'));
        panels.forEach(p => p.classList.remove('is-active'));
        btn.classList.add('is-active');
        const target = document.querySelector(`[data-tab-panel="${btn.dataset.tab}"][data-group="${group.dataset.tabs}"]`);
        if (target) target.classList.add('is-active');
      });
    });
  });

  // ===== Modals =====
  document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(`[data-modal="${trigger.dataset.modalOpen}"]`);
      if (target) {
        target.classList.add('is-open');
        const focusable = target.querySelector('input, button, select, textarea, a');
        if (focusable) setTimeout(() => focusable.focus(), 50);
      }
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach((closer) => {
    closer.addEventListener('click', () => {
      const modal = closer.closest('[data-modal]');
      if (modal) modal.classList.remove('is-open');
    });
  });
  document.querySelectorAll('[data-modal]').forEach((modal) => {
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('is-open'); });
  });
  // Esc to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('[data-modal].is-open').forEach(m => m.classList.remove('is-open'));
      if (drawer) drawer.classList.remove('is-open');
    }
  });

  // ===== Toast =====
  window.showToast = (msg, ms = 3000) => {
    let toast = document.querySelector('[data-toast]');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast'; toast.setAttribute('data-toast', ''); toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('is-open');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('is-open'), ms);
  };

  // Form demo submit
  document.querySelectorAll('[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const successTarget = form.dataset.demoForm;
      if (successTarget && successTarget.startsWith('#')) {
        const block = document.querySelector(successTarget);
        if (block) {
          form.style.display = 'none';
          block.style.display = 'block';
          block.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (successTarget) {
        window.location.href = successTarget;
      } else {
        window.showToast && window.showToast('Готово!');
      }
    });
  });

  // Copy link buttons
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => window.showToast && window.showToast('Скопійовано!'));
      } else {
        window.showToast && window.showToast('Скопійовано!');
      }
    });
  });

  // Cookie banner
  const cb = document.querySelector('[data-cookie-banner]');
  if (cb) {
    const accepted = localStorage.getItem('ekotoloka_cookies');
    if (!accepted) setTimeout(() => cb.classList.add('is-visible'), 800);
    cb.querySelectorAll('[data-cookie-choice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        localStorage.setItem('ekotoloka_cookies', btn.dataset.cookieChoice);
        cb.classList.remove('is-visible');
      });
    });
  }

  // Animate stats counters
  const observeCounters = () => {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.counter, 10);
        let current = 0; const steps = 40; const inc = Math.max(1, Math.floor(target / steps));
        const tick = () => {
          current += inc;
          if (current >= target) { el.textContent = target.toLocaleString('uk-UA'); return; }
          el.textContent = current.toLocaleString('uk-UA');
          requestAnimationFrame(tick);
        };
        tick();
        io.unobserve(el);
      });
    }, { threshold: 0.3 });
    counters.forEach(el => io.observe(el));
  };
  if ('IntersectionObserver' in window) observeCounters();

  // Active nav link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.getAttribute('href') === path) link.classList.add('is-active');
  });
})();
