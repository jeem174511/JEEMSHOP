/* app.js — initializes the app, registers pages, and starts the router */
(function (B) {
  document.addEventListener('DOMContentLoaded', function () {
    B.router.register('home', B.views.home);
    B.router.register('news', B.views.news);
    B.router.register('events', B.views.events);
    B.router.register('admin', B.views.admin);
    B.router.register('board', B.views.board);
    B.router.register('directory', B.views.directory);
    B.router.register('about', B.views.about);

    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    B.ui.initNav();
    B.ui.initBackToTop();
    B.ui.initAccountBar();
    B.auth.init();
    B.router.start();
  });
})(window.Barobo = window.Barobo || {});
