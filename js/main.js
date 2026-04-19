// Екотолока — Prototype interactions v3

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== Header shadow on scroll =====
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 8) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ===== Mobile drawer =====
  const burger = document.querySelector('[data-burger]');
  const drawer = document.querySelector('[data-drawer]');
  const drawerClose = document.querySelector('[data-drawer-close]');
  if (burger && drawer) {
    burger.addEventListener('click', () => {
      drawer.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
    const close = () => {
      drawer.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    if (drawerClose) drawerClose.addEventListener('click', close);
    drawer.addEventListener('click', (e) => { if (e.target === drawer) close(); });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
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
        document.body.style.overflow = 'hidden';
        const focusable = target.querySelector('input, button, select, textarea, a');
        if (focusable) setTimeout(() => focusable.focus(), 50);
      }
    });
  });
  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  };
  document.querySelectorAll('[data-modal-close]').forEach((closer) => {
    closer.addEventListener('click', () => closeModal(closer.closest('[data-modal]')));
  });
  document.querySelectorAll('[data-modal]').forEach((modal) => {
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
  });

  // ===== Esc to close =====
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('[data-modal].is-open').forEach(closeModal);
      if (drawer && drawer.classList.contains('is-open')) {
        drawer.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    }
  });

  // ===== Toast =====
  window.showToast = (msg, ms = 2600) => {
    let toast = document.querySelector('[data-toast]');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('data-toast', '');
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span></span>';
    toast.querySelector('span').textContent = msg;
    toast.classList.add('is-open');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('is-open'), ms);
  };

  // ===== Demo form submit =====
  document.querySelectorAll('[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const successTarget = form.dataset.demoForm;
      if (successTarget && successTarget.startsWith('#')) {
        const block = document.querySelector(successTarget);
        if (block) {
          form.style.display = 'none';
          block.style.display = 'block';
          block.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
        }
      } else if (successTarget) {
        window.location.href = successTarget;
      } else {
        window.showToast('Готово!');
      }
    });
  });

  // ===== Copy to clipboard =====
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => window.showToast('Скопійовано'));
      } else {
        window.showToast('Скопійовано');
      }
    });
  });

  // ===== Cookie banner =====
  const cb = document.querySelector('[data-cookie-banner]');
  if (cb) {
    const accepted = localStorage.getItem('ekotoloka_cookies');
    if (!accepted) setTimeout(() => cb.classList.add('is-visible'), 1000);
    cb.querySelectorAll('[data-cookie-choice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        localStorage.setItem('ekotoloka_cookies', btn.dataset.cookieChoice);
        cb.classList.remove('is-visible');
      });
    });
  }

  // ===== Animated counters =====
  const observeCounters = () => {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.counter, 10);
        if (prefersReducedMotion) { el.textContent = target.toLocaleString('uk-UA'); io.unobserve(el); return; }
        let current = 0; const steps = 48; const inc = Math.max(1, Math.floor(target / steps));
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

  // ===== Reveal on scroll =====
  const observeReveals = () => {
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in'));
      return;
    }
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.revealDelay || '0', 10);
          setTimeout(() => entry.target.classList.add('is-in'), delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  };

  if ('IntersectionObserver' in window) {
    observeCounters();
    observeReveals();
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in'));
  }

  // ===== Active nav =====
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.getAttribute('href') === path) link.classList.add('is-active');
  });
})();
