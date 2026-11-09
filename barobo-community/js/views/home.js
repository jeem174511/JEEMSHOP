/* views/home.js — Home page */
(function (B) {
  const C = B.components;

  function render(root) {
    let activeSlide = 0;
    let slideTimer = null;

    function draw() {
      renderPage().catch(function (error) {
        B.ui.toast('Could not load community posts: ' + error.message, 'error');
      });
    }

    async function renderPage() {
      let news = B.data.news.slice(0, 3);
      let events = B.data.events;
      let posts = [];
      try {
        news = (await B.store.getNews()).slice(0, 3);
      } catch (error) {
        B.ui.toast('Could not load latest news: ' + error.message, 'error');
      }
      try {
        events = await B.store.getEvents();
      } catch (error) {
        B.ui.toast('Could not load events: ' + error.message, 'error');
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const pastEvents = events
        .filter(function (event) {
          return !event.showInUpcoming && B.utils.toDate(event.endDate || event.date) < today;
        })
        .sort(function (a, b) {
          return B.utils.toDate(b.date) - B.utils.toDate(a.date);
        })
        .slice(0, 2);
      try {
        posts = (await B.store.getPosts()).slice(0, 3);
      } catch (error) {
        B.ui.toast('Could not load community posts: ' + error.message, 'error');
      }

      root.innerHTML =
        '<section class="hero">' +
          '<div class="hero__slides" aria-hidden="true" style="--slide-index:' + activeSlide + '">' +
            '<div class="hero__slide hero__slide--meeting"><img src="assets/barobo-community-meeting.png" alt=""></div>' +
            '<div class="hero__slide hero__slide--police"><img src="assets/barobo-police-assistance.png" alt=""></div>' +
            '<div class="hero__slide hero__slide--fire"><img src="assets/barobo-fire-brigade.png" alt=""></div>' +
          '</div>' +
          '<button class="hero__arrow hero__arrow--prev" type="button" aria-label="Previous slide">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>' +
          '</button>' +
          '<button class="hero__arrow hero__arrow--next" type="button" aria-label="Next slide">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>' +
          '</button>' +
          '<div class="container hero__inner">' +
          '<div>' +
            '<p class="hero__eyebrow">Hello, Barobo!</p>' +
            '<h1>Closer to the community, wherever you are.</h1>' +
            '<p>Find important news, events, and information for everyone in Barobo.</p>' +
            '<div class="hero__actions">' +
              '<a class="btn btn--light" href="#/board">Join the conversation</a>' +
              '<a class="btn btn--outline" href="#/events">Explore events</a>' +
            '</div>' +
          '</div>' +
        '</div></section>' +

        '<div class="container">' +
          '<section class="section">' +
            '<div class="notice"><strong>Need immediate help?</strong> Contact a local response office in the ' +
            '<a href="#/directory">important contacts directory</a>.</div>' +
          '</section>' +

          '<section class="section"><div class="section__head"><h2>Breaking News</h2><a class="btn btn--ghost btn--sm" href="#/news">All news →</a></div>' +
            '<div class="grid grid--cards home-news-grid">' + news.map(C.newsCard).join('') + '</div></section>' +

          '<section class="section"><div class="section__head"><h2>Past Events</h2><a class="btn btn--ghost btn--sm" href="#/events">See all →</a></div>' +
            '<div class="grid grid--2 home-events-grid">' + (pastEvents.length
              ? pastEvents.map(C.eventCard).join('')
              : C.empty(B.icons.svg('calendar'), 'No past events to show yet.')) + '</div></section>' +

          '<section class="section"><div class="section__head"><h2>From the Community Board</h2><a class="btn btn--ghost btn--sm" href="#/board">See all →</a></div>' +
            '<div class="grid grid--cards">' + posts.map(C.postCard).join('') + '</div></section>' +
        '</div>';

      C.bindNews(root);
      C.bindRsvp(root, draw);
      C.bindEvents(root);
      C.bindPosts(root, draw);

      if (slideTimer) window.clearInterval(slideTimer);
      const track = root.querySelector('.hero__slides');
      const hero = root.querySelector('.hero');
      if (!track || !hero) return;

      function stopAutoPlay() {
        if (!slideTimer) return;
        window.clearInterval(slideTimer);
        slideTimer = null;
      }

      function setSlide(index) {
        activeSlide = (index + 3) % 3;
        track.style.setProperty('--slide-index', String(activeSlide));
      }

      function startAutoPlay() {
        stopAutoPlay();
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        slideTimer = window.setInterval(function () {
          if (!root.contains(track)) {
            stopAutoPlay();
            return;
          }
          setSlide(activeSlide + 1);
        }, 3000);
      }

      hero.querySelector('.hero__arrow--prev').addEventListener('click', function () {
        setSlide(activeSlide - 1);
        startAutoPlay();
      });
      hero.querySelector('.hero__arrow--next').addEventListener('click', function () {
        setSlide(activeSlide + 1);
        startAutoPlay();
      });

      if (!root.contains(track)) {
        stopAutoPlay();
        return;
      }
      if (slideTimer) {
        window.clearInterval(slideTimer);
        slideTimer = null;
      }
      startAutoPlay();
    }
    draw();
  }

  B.views = B.views || {};
  B.views.home = { title: 'Home', render: render };
})(window.Barobo = window.Barobo || {});
