/* views/news.js — News page with search and category filters */
(function (B) {
  const { $, esc, debounce } = B.utils;
  const C = B.components;

  function render(root) {
    const state = { category: 'All', query: '' };
    let newsItems = B.data.news;

    root.innerHTML =
      C.pageHead('News', 'Announcements and information for the community.') +
      '<div class="container"><section class="section">' +
        '<div class="toolbar">' +
          '<div class="field"><label class="sr-only" for="news-search">Search news</label>' +
          '<input id="news-search" type="search" placeholder="Search news…" autocomplete="off"></div>' +
        '</div>' +
        '<div class="chips" id="news-chips" role="group" aria-label="Choose a category" style="margin-bottom:1.25rem">' +
          B.config.newsCategories.map(function (c) {
            return '<button type="button" class="chip' + (c === state.category ? ' is-active' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
          }).join('') +
        '</div>' +
        '<div id="news-list" class="grid grid--cards" aria-live="polite"></div>' +
      '</section></div>';

    function drawList() {
      const q = state.query.trim().toLowerCase();
      const items = newsItems.filter(function (n) {
        const catOk = state.category === 'All' || n.category === state.category;
        const textOk = !q || (n.title + ' ' + n.summary).toLowerCase().indexOf(q) !== -1;
        return catOk && textOk;
      });
      const list = $('#news-list', root);
      list.innerHTML = items.length
        ? items.map(C.newsCard).join('')
        : C.empty(B.icons.svg('search'), 'No news found. Try another search term or category.');
      C.bindNews(list);
    }

    $('#news-search', root).addEventListener('input', debounce(function (e) {
      state.query = e.target.value;
      drawList();
    }, 200));

    $('#news-chips', root).addEventListener('click', function (e) {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      state.category = btn.getAttribute('data-cat');
      B.utils.$$('.chip', root).forEach(function (c) {
        c.classList.toggle('is-active', c === btn);
      });
      drawList();
    });

    drawList();
    B.store.getNews().then(function (items) {
      newsItems = items;
      drawList();
    }).catch(function (error) {
      B.ui.toast('Could not load latest news: ' + error.message, 'error');
    });
  }

  B.views = B.views || {};
  B.views.news = { title: 'News', render: render };
})(window.Barobo = window.Barobo || {});
