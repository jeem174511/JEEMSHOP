/* views/events.js — Events page with RSVP */
(function (B) {
  const { $, toDate } = B.utils;
  const C = B.components;

  function render(root) {
    let events = B.data.events;
    root.innerHTML =
      C.pageHead('Events', 'Upcoming events in Barobo. Select "I will attend" to RSVP.') +
      '<div class="container">' +
        '<section class="section"><div id="events-upcoming-list" class="stack" aria-live="polite"></div></section>' +
        '<section id="past-events-section" class="section" hidden><h2>Past Events</h2>' +
          '<div id="events-past-list" class="stack" aria-live="polite"></div></section>' +
      '</div>';

    function draw() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcoming = events
        .filter(function (e) { return e.showInUpcoming || toDate(e.endDate || e.date) >= today; })
        .sort(function (a, b) { return toDate(a.date) - toDate(b.date); });
      const past = events
        .filter(function (e) { return !e.showInUpcoming && toDate(e.endDate || e.date) < today; })
        .sort(function (a, b) { return toDate(b.date) - toDate(a.date); });

      const upcomingList = $('#events-upcoming-list', root);
      upcomingList.innerHTML = upcoming.length
        ? upcoming.map(C.eventCard).join('')
        : C.empty(B.icons.svg('calendar'), 'There are no upcoming events yet.');
      const pastSection = $('#past-events-section', root);
      const pastList = $('#events-past-list', root);
      pastSection.hidden = !past.length;
      pastList.innerHTML = past.map(C.eventCard).join('');
      C.bindRsvp(upcomingList, draw);
      C.bindEvents(root);
    }
    draw();
    B.store.getEvents().then(function (items) {
      events = items;
      draw();
    }).catch(function (error) {
      B.ui.toast('Could not load events: ' + error.message, 'error');
      draw();
    });
  }

  B.views = B.views || {};
  B.views.events = { title: 'Events', render: render };
})(window.Barobo = window.Barobo || {});
