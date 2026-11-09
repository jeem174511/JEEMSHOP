/* ui.js — toast, modal, and mobile navigation */
(function (B) {
  const { esc, $ } = B.utils;
  let lastFocus = null;
  let revealObserver = null;
  let revealMutationObserver = null;

  function initScrollReveal(root) {
    if (revealObserver) revealObserver.disconnect();
    if (revealMutationObserver) revealMutationObserver.disconnect();
    document.querySelectorAll('.scroll-reveal').forEach(function (element) {
      element.classList.remove('scroll-reveal', 'is-revealed');
    });

    if (!('IntersectionObserver' in window)) return;

    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });

    function observeTargets(scope) {
      const selector = '.page-head, .section, .card, .event, .notice, .empty, .faq';
      const targets = [];
      if (scope.nodeType === 1 && scope.matches(selector)) targets.push(scope);
      if (scope.querySelectorAll) {
        Array.prototype.push.apply(targets, scope.querySelectorAll(selector));
      }
      targets.push.apply(targets, document.querySelectorAll('.site-footer__grid > *, .site-footer__bottom'));

      targets.forEach(function (element) {
        if (element.matches('.home-news-grid > .card, .home-events-grid > .event') ||
            element.classList.contains('scroll-reveal')) return;
        element.classList.add('scroll-reveal');
        revealObserver.observe(element);
      });
    }

    observeTargets(root);
    if (root) {
      revealMutationObserver = new MutationObserver(function () {
        observeTargets(root);
      });
      revealMutationObserver.observe(root, { childList: true, subtree: true });
    }
  }

  /* ---------- Toast ---------- */
  function toast(message, type) {
    const root = $('#toast-root');
    if (!root) return;
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' toast--' + type : '');
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.textContent = message;
    root.appendChild(el);
    setTimeout(function () {
      el.classList.add('toast--leaving');
      setTimeout(function () { el.remove(); }, 180);
    }, 3600);
  }

  /* ---------- Modal ---------- */
  function closeModal() {
    const root = $('#modal-root');
    if (!root || root.hidden) return;
    root.hidden = true;
    root.innerHTML = '';
    document.body.classList.remove('no-scroll');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    lastFocus = null;
  }

  function openModal(options) {
    const root = $('#modal-root');
    if (!root) return;
    if (!root.hidden) closeModal();
    lastFocus = document.activeElement;
    root.innerHTML =
      '<div class="modal-backdrop" data-close></div>' +
      '<div class="modal' + (options.className ? ' ' + esc(options.className) : '') + '" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
        '<header class="modal__head">' +
          '<h2 id="modal-title">' + esc(options.title) + '</h2>' +
          '<button type="button" class="icon-btn" data-close aria-label="Close">' + B.icons.svg('x') + '</button>' +
        '</header>' +
        '<div class="modal__body">' + options.html + '</div>' +
      '</div>';
    root.hidden = false;
    document.body.classList.add('no-scroll');
    B.utils.$$('[data-close]', root).forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    const closeBtn = $('.icon-btn', root);
    if (closeBtn) closeBtn.focus();
    if (typeof options.onMount === 'function') options.onMount(root);
  }

  /* ---------- Mobile nav ---------- */
  function closeNav() {
    const nav = $('#site-nav');
    const btn = $('#nav-toggle');
    if (nav) nav.classList.remove('is-open');
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      btn.innerHTML = B.icons.svg('menu');
    }
  }

  function initNav() {
    const nav = $('#site-nav');
    const btn = $('#nav-toggle');
    if (!nav || !btn) return;
    btn.addEventListener('click', function () {
      const open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      btn.innerHTML = B.icons.svg(open ? 'x' : 'menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeModal();
        closeNav();
      }
    });
  }

  function initBackToTop() {
    const btn = $('#back-to-top');
    if (!btn) return;

    function updateVisibility() {
      btn.classList.toggle('is-visible', window.scrollY > 320);
    }

    window.addEventListener('scroll', updateVisibility, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    updateVisibility();
  }

  function initAccountBar() {
    const bar = $('#account-bar');
    if (!bar) return;

    function updateVisibility() {
      const visible = window.scrollY > 0;
      bar.classList.toggle('is-visible', visible);
      bar.setAttribute('aria-hidden', String(!visible));
    }

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
  }

  B.ui = { toast, openModal, closeModal, closeNav, initNav, initBackToTop, initAccountBar, initScrollReveal };
})(window.Barobo = window.Barobo || {});
