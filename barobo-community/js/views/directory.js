/* views/directory.js — Directory of services and contacts */
(function (B) {
  const { $, esc, debounce } = B.utils;
  const C = B.components;

  function item(d) {
    const phone = d.phone
      ? '<a class="btn btn--primary btn--sm" href="tel:' + esc(d.phone) + '">' + B.icons.svg('phone') + ' Call ' + esc(d.phone) + '</a>'
      : '';
    return '<article class="card dir-item">' +
      (d.logo
        ? '<div class="dir-item__identity"><span class="dir-item__logo"><img src="' + esc(d.logo) + '" alt="' + esc(d.name + ' logo') + '" loading="lazy"></span><h3>' + esc(d.name) + '</h3></div>'
        : '<span class="badge' + (d.category === 'Emergency' ? ' badge--danger' : '') + '">' + esc(d.category) + '</span><h3>' + esc(d.name) + '</h3>') +
      (d.image ? '<img class="dir-item__image" src="' + esc(d.image) + '" alt="' + esc(d.name + ' hotline') + '" loading="lazy">' : '') +
      (d.barangay ? '<div class="dir-item__row">' + B.icons.svg('pin') + esc(d.barangay) + '</div>' : '') +
      (d.hours ? '<div class="dir-item__row">' + B.icons.svg('clock') + esc(d.hours) + '</div>' : '') +
      (d.note ? '<p class="muted small">' + esc(d.note) + '</p>' : '') +
      (d.contacts ? '<ul class="dir-item__contacts">' + d.contacts.map(function (contact) {
        return '<li><strong>' + esc(contact.label) + ':</strong> ' +
          (contact.href
            ? '<a href="' + esc(contact.href) + '">' + esc(contact.value) + '</a>'
            : esc(contact.value)) +
          '</li>';
      }).join('') + '</ul>' : '') +
      '<div>' + phone + '</div>' +
    '</article>';
  }

  function render(root) {
    const state = { category: 'All', query: '' };
    const cats = ['All'].concat(B.config.directoryCategories);

    root.innerHTML =
      C.pageHead('Directory', 'Services, offices, and contacts in Barobo.') +
      '<div class="container"><section class="section">' +
        '<div class="notice notice--info" style="margin-bottom:1.25rem">For emergencies, contact the local response offices listed below.</div>' +
        '<div class="toolbar"><div class="field"><label class="sr-only" for="dir-search">Search the directory</label>' +
          '<input id="dir-search" type="search" placeholder="Search for a service or location…" autocomplete="off"></div></div>' +
        '<div class="chips" id="dir-chips" role="group" aria-label="Choose a category" style="margin-bottom:1.25rem">' +
          cats.map(function (c) {
            return '<button type="button" class="chip' + (c === 'All' ? ' is-active' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
          }).join('') +
        '</div>' +
        '<div id="dir-list" class="grid grid--cards" aria-live="polite"></div>' +
      '</section></div>';

    function drawList() {
      const q = state.query.trim().toLowerCase();
      const items = B.data.directory.filter(function (d) {
        const catOk = state.category === 'All' || d.category === state.category;
        const textOk = !q || (d.name + ' ' + d.barangay + ' ' + d.category).toLowerCase().indexOf(q) !== -1;
        return catOk && textOk;
      });
      $('#dir-list', root).innerHTML = items.length
        ? items.map(item).join('')
        : C.empty(B.icons.svg('search'), 'No results found. Try another search term or category.');
    }

    $('#dir-search', root).addEventListener('input', debounce(function (e) {
      state.query = e.target.value;
      drawList();
    }, 200));

    $('#dir-chips', root).addEventListener('click', function (e) {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      state.category = btn.getAttribute('data-cat');
      B.utils.$$('.chip', root).forEach(function (c) { c.classList.toggle('is-active', c === btn); });
      drawList();
    });

    drawList();
  }

  B.views = B.views || {};
  B.views.directory = { title: 'Directory', render: render };
})(window.Barobo = window.Barobo || {});
