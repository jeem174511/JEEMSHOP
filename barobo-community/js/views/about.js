/* views/about.js — About page, FAQ, and contact form */
(function (B) {
  const { $, esc } = B.utils;
  const C = B.components;

  const faqs = [
    ['Who is this platform for?', 'Everyone in Barobo — residents, business owners, students, and community leaders.'],
    ['Where are my posts saved?', 'In this demo, posts are saved only in your browser. A backend or database is required to share them with everyone.'],
    ['How do I add news or an event?', 'Edit the js/data.js file. See the README for instructions.'],
    ['How do I report incorrect information?', 'Use the contact form below.']
  ];

  function render(root) {
    root.innerHTML =
      C.pageHead('About Us', 'Barobo Community is the digital home of our community.') +
      '<div class="container"><section class="section"><div class="grid grid--2">' +
        '<div class="stack">' +
          '<div class="card card--pad" id="about-purpose"><h2>Our Purpose</h2>' +
            '<p>Make it easier to share news, ask for help, and connect people in Barobo.</p>' +
            '<p class="muted small">Information on this site is sample content until replaced with official information.</p></div>' +
          '<div id="about-faq"><h2>Frequently Asked Questions</h2>' +
            faqs.map(function (f, index) {
              const faqId = 'about-faq-' + (index + 1);
              return '<details class="faq" id="' + faqId + '"><summary>' + esc(f[0]) + '</summary><p>' + esc(f[1]) + '</p></details>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<form id="about-contact" class="card card--pad" novalidate>' +
          '<h2>Contact Us</h2>' +
          '<div class="about-contact-details" aria-label="Contact details">' +
            '<a href="tel:+639857868303"><span>' + B.icons.svg('phone') + '<strong>0985 786 8303</strong></span><small>Mobile</small></a>' +
            '<a href="mailto:mgobarobosds@gmail.com"><span>' + B.icons.svg('mail') + '<strong>mgobarobosds@gmail.com</strong></span><small>Email</small></a>' +
          '</div>' +
          '<div class="field" id="c-name-f"><label for="c-name">Name</label><input id="c-name" name="name" type="text" autocomplete="name">' +
            '<span class="field__error" role="alert"></span></div>' +
          '<div class="field" id="c-email-f"><label for="c-email">Email (optional)</label><input id="c-email" name="email" type="email" autocomplete="email">' +
            '<span class="field__error" role="alert"></span></div>' +
          '<div class="field" id="c-msg-f"><label for="c-msg">Message</label><textarea id="c-msg" name="message"></textarea>' +
            '<span class="field__error" role="alert"></span></div>' +
          '<button type="submit" class="btn btn--primary btn--block">Send</button>' +
        '</form>' +
      '</div></section></div>';

    function setError(id, message) {
      const wrap = $(id, root);
      wrap.classList.toggle('has-error', Boolean(message));
      $('.field__error', wrap).textContent = message || '';
    }

    const form = $('#about-contact', root);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const message = form.elements.message.value.trim();
      let ok = true;

      if (name.length < 2) { setError('#c-name-f', 'Please enter your name.'); ok = false; } else { setError('#c-name-f', ''); }
      if (email && !/^\S+@\S+\.\S+$/.test(email)) { setError('#c-email-f', 'Please enter a valid email address.'); ok = false; } else { setError('#c-email-f', ''); }
      if (message.length < 5) { setError('#c-msg-f', 'Your message is too short.'); ok = false; } else { setError('#c-msg-f', ''); }
      if (!ok) return;

      B.store.addMessage({ name: name, email: email, message: message });
      form.reset();
      B.ui.toast('Your message has been sent. Thank you!', 'success');
    });
  }

  B.views = B.views || {};
  B.views.about = { title: 'About Us', render: render };
})(window.Barobo = window.Barobo || {});
