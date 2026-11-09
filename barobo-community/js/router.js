/* router.js — simple hash router (#/news, #/events, ...) */
(function (B) {
  const routes = {};

  function register(name, view) {
    routes[name] = view;
  }

  function currentName() {
    const name = window.location.hash.replace(/^#\/?/, '').split('?')[0] || 'home';
    return routes[name] ? name : 'home';
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function render() {
    const name = currentName();
    const view = routes[name];
    const root = document.getElementById('app');
    if (!root || !view) return;

    B.ui.closeModal();
    B.ui.closeNav();
    root.innerHTML = '';
    view.render(root);
    B.ui.initScrollReveal(root);

    document.title = view.title + ' • ' + B.config.siteName;
    B.utils.$$('[data-route]').forEach(function (a) {
      const active = a.getAttribute('data-route') === name;
      a.classList.toggle('is-active', active);
      if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    scrollToTop();
    const section = new URLSearchParams(window.location.hash.split('?')[1] || '').get('section');
    const sectionTarget = section && document.getElementById(section);
    if (sectionTarget) {
      window.requestAnimationFrame(function () {
        sectionTarget.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    }
    root.focus({ preventScroll: true });
  }

  function start() {
    window.addEventListener('hashchange', render);
    document.querySelectorAll('a[href="#/home"]').forEach(function (link) {
      link.addEventListener('click', function () {
        if (currentName() !== 'home') return;
        scrollToTop();
      });
    });
    render();
  }

  B.router = { register, start, render };
})(window.Barobo = window.Barobo || {});
