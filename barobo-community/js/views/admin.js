/* views/admin.js — administrator tools for publishing news and events */
(function (B) {
  const { $, esc } = B.utils;
  const C = B.components;
  const MAX_IMAGES = 5;
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
  const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  function localDate() {
    const now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
  }

  function categoryOptions(categories) {
    return categories.map(function (category) {
      return '<option value="' + esc(category) + '">' + esc(category) + '</option>';
    }).join('');
  }

  function imageField(id) {
    return '<div class="field admin-upload" id="' + id + '-field">' +
      '<label for="' + id + '">Images <span class="muted small">(optional, up to 5)</span></label>' +
      '<div class="admin-upload__picker">' +
        '<input class="admin-upload__input" id="' + id + '" name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple aria-describedby="' + id + '-hint ' + id + '-error">' +
        '<label class="admin-upload__button" for="' + id + '">Choose images</label>' +
        '<span class="admin-upload__name" id="' + id + '-name" aria-live="polite">No images selected</span>' +
      '</div>' +
      '<span class="field__hint" id="' + id + '-hint">JPEG, PNG, or WebP · up to 10 MB per image</span>' +
      '<span class="field__error" id="' + id + '-error" role="alert"></span>' +
      '<div class="admin-upload__preview" id="' + id + '-preview" hidden></div>' +
      '<button class="btn btn--ghost btn--sm admin-upload__clear" type="button" data-clear-images hidden>Remove all images</button>' +
      '</div>';
  }

  function newsForm() {
    return '<form class="card card--pad admin-form" data-admin-publish="news">' +
      '<div class="admin-form__heading"><span class="badge">News</span><h2>Publish news</h2>' +
        '<p class="muted small">Share an announcement or story with the Barobo community.</p></div>' +
      '<div class="field"><label for="admin-news-title">Headline</label><input id="admin-news-title" name="title" maxlength="200" required></div>' +
      '<div class="admin-form__row">' +
        '<div class="field"><label for="admin-news-category">Category</label><select id="admin-news-category" name="category" required>' +
          categoryOptions(B.config.newsCategories.filter(function (category) { return category !== 'All'; })) + '</select></div>' +
        '<div class="field"><label for="admin-news-date">Publication date</label><input id="admin-news-date" name="date" type="date" value="' + localDate() + '" required></div>' +
      '</div>' +
      '<div class="field"><label for="admin-news-summary">Short summary</label><textarea id="admin-news-summary" name="summary" maxlength="2000" required></textarea></div>' +
      '<div class="field"><label for="admin-news-body">Full story <span class="muted small">(optional; start each paragraph on a new line)</span></label>' +
        '<textarea id="admin-news-body" name="body" rows="5"></textarea></div>' +
      imageField('admin-news-images') +
      '<button class="btn btn--primary" type="submit">Publish news</button>' +
    '</form>';
  }

  function eventForm() {
    return '<form class="card card--pad admin-form" data-admin-publish="event">' +
      '<div class="admin-form__heading"><span class="badge">Events</span><h2>Add an event</h2>' +
        '<p class="muted small">Post the date, time, and details so residents can plan ahead.</p></div>' +
      '<div class="field"><label for="admin-event-title">Event name</label><input id="admin-event-title" name="title" maxlength="200" required></div>' +
      '<div class="admin-form__row">' +
        '<div class="field"><label for="admin-event-date">Start date</label><input id="admin-event-date" name="date" type="date" required></div>' +
        '<div class="field"><label for="admin-event-end-date">End date <span class="muted small">(optional)</span></label><input id="admin-event-end-date" name="endDate" type="date"></div>' +
      '</div>' +
      '<div class="admin-form__row">' +
        '<div class="field"><label for="admin-event-time">Time</label><input id="admin-event-time" name="time" maxlength="100" placeholder="e.g. 8:00 AM–5:00 PM" required></div>' +
        '<div class="field"><label for="admin-event-category">Category</label><input id="admin-event-category" name="category" maxlength="60" placeholder="e.g. Festival" required></div>' +
      '</div>' +
      '<div class="field"><label for="admin-event-place">Location</label><input id="admin-event-place" name="place" maxlength="200" required></div>' +
      '<div class="field"><label for="admin-event-description">Event details</label><textarea id="admin-event-description" name="description" rows="5" maxlength="4000" required></textarea></div>' +
      imageField('admin-event-images') +
      '<button class="btn btn--primary" type="submit">Publish event</button>' +
    '</form>';
  }

  function validateImages(files) {
    if (files.length > MAX_IMAGES) return 'Choose no more than ' + MAX_IMAGES + ' images.';
    for (let i = 0; i < files.length; i += 1) {
      if (IMAGE_TYPES.indexOf(files[i].type) === -1) return 'Only JPEG, PNG, or WebP images can be uploaded.';
      if (files[i].size > MAX_IMAGE_SIZE) return 'Each image must be no larger than 10 MB.';
    }
    return '';
  }

  function bindImagePicker(form) {
    const input = form.elements.images;
    const id = input.id;
    const field = $('#' + id + '-field', form);
    const name = $('#' + id + '-name', form);
    const preview = $('#' + id + '-preview', form);
    const clear = $('[data-clear-images]', field);
    const error = $('#' + id + '-error', form);
    let objectUrls = [];

    function revokePreviews() {
      objectUrls.forEach(function (url) { URL.revokeObjectURL(url); });
      objectUrls = [];
    }

    function showError(message) {
      field.classList.toggle('has-error', Boolean(message));
      input.setAttribute('aria-invalid', String(Boolean(message)));
      error.textContent = message;
    }

    function resetPicker() {
      revokePreviews();
      input.value = '';
      name.textContent = 'No images selected';
      preview.innerHTML = '';
      preview.hidden = true;
      clear.hidden = true;
      showError('');
    }

    input.addEventListener('change', function () {
      revokePreviews();
      preview.innerHTML = '';
      preview.hidden = true;
      const files = Array.prototype.slice.call(input.files || []);
      name.textContent = files.length
        ? files.length + (files.length === 1 ? ' image selected' : ' images selected')
        : 'No images selected';
      clear.hidden = !files.length;

      const validationError = validateImages(files);
      showError(validationError);
      if (validationError || !files.length) return;

      preview.innerHTML = files.map(function (file) {
        const url = URL.createObjectURL(file);
        objectUrls.push(url);
        return '<figure class="admin-upload__item"><img src="' + esc(url) + '" alt="Preview: ' + esc(file.name) + '">' +
          '<figcaption><strong>' + esc(file.name) + '</strong><span>' +
          (file.size / (1024 * 1024)).toFixed(1) + ' MB</span></figcaption></figure>';
      }).join('');
      preview.hidden = false;
    });

    clear.addEventListener('click', resetPicker);
    return resetPicker;
  }

  function bindForm(form, kind) {
    const resetImagePicker = bindImagePicker(form);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const files = Array.prototype.slice.call(form.elements.images.files || []);
      const imageError = validateImages(files);
      if (imageError) {
        B.ui.toast(imageError, 'error');
        return;
      }

      const submit = $('button[type="submit"]', form);
      submit.disabled = true;
      submit.textContent = kind === 'news' ? 'Publishing news…' : 'Publishing event…';
      const input = {
        title: form.elements.title.value.trim(),
        images: files
      };
      let save;
      if (kind === 'news') {
        input.category = form.elements.category.value;
        input.date = form.elements.date.value;
        input.summary = form.elements.summary.value.trim();
        input.body = form.elements.body.value.split(/\r?\n/).map(function (paragraph) {
          return paragraph.trim();
        }).filter(Boolean);
        if (!input.body.length) input.body = [input.summary];
        save = B.store.createEditorialNews(input);
      } else {
        input.date = form.elements.date.value;
        input.endDate = form.elements.endDate.value;
        if (input.endDate && input.endDate < input.date) {
          B.ui.toast('The event end date must be on or after the start date.', 'error');
          submit.disabled = false;
          submit.textContent = 'Publish event';
          return;
        }
        input.time = form.elements.time.value.trim();
        input.place = form.elements.place.value.trim();
        input.category = form.elements.category.value.trim();
        input.description = form.elements.description.value.trim();
        save = B.store.createEditorialEvent(input);
      }

      save.then(function () {
        form.reset();
        resetImagePicker();
        if (kind === 'news') form.elements.date.value = localDate();
        B.ui.toast(kind === 'news' ? 'News published successfully.' : 'Event published successfully.', 'success');
      }).catch(function (error) {
        B.ui.toast('Could not publish ' + (kind === 'news' ? 'news: ' : 'event: ') + error.message, 'error');
      }).finally(function () {
        submit.disabled = false;
        submit.textContent = kind === 'news' ? 'Publish news' : 'Publish event';
      });
    });
  }

  function render(root) {
    root.innerHTML = C.pageHead('Admin', 'Publish news and events for the Barobo community.') +
      '<div class="container"><section class="section"><div id="admin-content" aria-live="polite">' +
      C.empty(B.icons.svg('lock'), 'Checking administrator access…') +
      '</div></section></div>';

    B.store.isSiteAdmin().then(function (isAdmin) {
      const content = $('#admin-content', root);
      if (!content) return;
      if (!isAdmin) {
        content.innerHTML = '<div class="notice notice--info"><strong>Admin access only.</strong> Sign in with an account approved by the site administrator.</div>' +
          (!B.auth.isSignedIn() ? '<button class="btn btn--primary" type="button" data-admin-sign-in>Sign in</button>' : '');
        const signIn = $('[data-admin-sign-in]', content);
        if (signIn) signIn.addEventListener('click', function () { B.auth.openForm('sign-in'); });
        return;
      }

      content.innerHTML = '<div class="notice notice--info admin-notice">Only approved admins can publish. New posts are shared with everyone.</div>' +
        '<div class="grid grid--2 admin-forms">' + newsForm() + eventForm() + '</div>';
      B.utils.$$('[data-admin-publish]', content).forEach(function (form) {
        bindForm(form, form.getAttribute('data-admin-publish'));
      });
    }).catch(function (error) {
      B.ui.toast('Could not verify administrator access: ' + error.message, 'error');
      const content = $('#admin-content', root);
      if (content) {
        content.innerHTML = '<div class="notice notice--info">Admin tools are unavailable. Confirm the editorial schema has been installed in Supabase.</div>';
      }
    });
  }

  B.views = B.views || {};
  B.views.admin = { title: 'Admin', render: render };
})(window.Barobo = window.Barobo || {});
