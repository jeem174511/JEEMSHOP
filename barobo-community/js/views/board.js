/* views/board.js — Community Board (create, like, and delete your own posts) */
(function (B) {
  const { $, esc } = B.utils;
  const C = B.components;
  const L = B.config.limits;
  const MAX_IMAGE_SIZE = 1024 * 1024;

  function options(list) {
    return list.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join('');
  }

  function formHtml() {
    return '<form id="post-form" class="card card--pad" novalidate>' +
      '<div class="board-composer__heading"><h2>Share with the community</h2>' +
        '<p class="muted small">Ask a question, request help, or share an update.</p></div>' +
      '<div class="board-composer__identity">' +
      '<div class="field" id="f-name"><label for="p-name">Your name</label>' +
        '<input id="p-name" name="name" type="text" maxlength="' + L.nameMax + '" autocomplete="name" required placeholder="e.g. Juan Dela Cruz">' +
        '<span class="field__error" role="alert"></span></div>' +
      '<div class="field"><label for="p-brgy">Your barangay</label><select id="p-brgy" name="barangay">' + options(B.config.barangays) + '</select></div>' +
      '</div>' +
      '<div class="field"><label for="p-cat">What is your post about?</label><select id="p-cat" name="category">' + options(B.config.boardCategories) + '</select></div>' +
      '<div class="field" id="f-msg"><label for="p-msg">Your message</label>' +
        '<textarea id="p-msg" name="message" maxlength="' + L.postMax + '" required placeholder="Write your question or update here…"></textarea>' +
        '<span class="field__error" role="alert"></span>' +
        '<span class="field__hint"><span id="p-count">0</span> of ' + L.postMax + ' characters</span></div>' +
      '<div class="field board-composer__photo" id="f-photo"><label for="p-photo">Add a photo <span class="muted small">(optional)</span></label>' +
        '<div class="board-photo-picker">' +
          '<input class="board-photo-picker__input" id="p-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="p-photo-hint">' +
          '<label class="board-photo-picker__button" for="p-photo">Choose photo</label>' +
          '<span class="board-photo-picker__name" id="p-photo-name" aria-live="polite">No photo selected</span>' +
        '</div>' +
        '<span class="field__hint" id="p-photo-hint">JPEG, PNG, or WebP · up to 1 MB</span>' +
        '<span class="field__error" role="alert"></span>' +
        '<div class="post-photo-preview" id="p-photo-preview" hidden>' +
          '<img id="p-photo-preview-image" alt="Preview of the photo to upload">' +
          '<button type="button" class="btn btn--ghost btn--sm" id="p-photo-remove">Remove photo</button>' +
        '</div></div>' +
      '<button type="submit" class="btn btn--primary btn--block">Share post</button>' +
      '<p class="board-composer__note muted small">Your post is visible to the community. Please don’t share sensitive personal information.</p>' +
    '</form>';
  }

  function setError(wrapper, message) {
    wrapper.classList.toggle('has-error', Boolean(message));
    $('.field__error', wrapper).textContent = message || '';
  }

  function render(root) {
    const state = { category: 'All' };
    let imageData = '';
    let uploadFile = null;
    let imageReadPending = false;
    let imageError = '';
    let imageReadId = 0;

    root.innerHTML =
      C.pageHead('Community Board', 'Ask a question, get help, or share with your fellow Barobo residents.') +
      '<div class="container"><section class="section"><div class="grid grid--board">' +
        '<div class="sticky-col">' + formHtml() + '</div>' +
        '<div>' +
          '<div class="chips" id="board-chips" role="group" aria-label="Choose a category" style="margin-bottom:1rem">' +
            ['All'].concat(B.config.boardCategories).map(function (c) {
              return '<button type="button" class="chip' + (c === 'All' ? ' is-active' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
            }).join('') +
          '</div>' +
          '<div id="board-list" class="stack" aria-live="polite"></div>' +
        '</div>' +
      '</div></section></div>';

    async function drawList() {
      const posts = (await B.store.getPosts()).filter(function (p) {
        return state.category === 'All' || p.category === state.category;
      });
      const list = $('#board-list', root);
      list.innerHTML = posts.length
        ? posts.map(C.postCard).join('')
        : C.empty(B.icons.svg('messages'), 'There are no posts in this category yet. Be the first!');
      C.bindPosts(list, drawList);
    }

    const form = $('#post-form', root);
    const msg = $('#p-msg', root);
    const count = $('#p-count', root);
    const photo = $('#p-photo', root);
    const photoName = $('#p-photo-name', root);
    const photoPreview = $('#p-photo-preview', root);
    const photoPreviewImage = $('#p-photo-preview-image', root);

    msg.addEventListener('input', function () { count.textContent = String(msg.value.length); });

    photo.addEventListener('change', function () {
      const file = photo.files && photo.files[0];
      uploadFile = file || null;
      photoName.textContent = file ? file.name : 'No photo selected';
      imageReadId += 1;
      const readId = imageReadId;
      imageData = '';
      imageError = '';
      imageReadPending = false;
      setError($('#f-photo', root), '');
      photoPreview.hidden = true;
      photoPreviewImage.removeAttribute('src');
      if (!file) return;

      if (['image/jpeg', 'image/png', 'image/webp'].indexOf(file.type) === -1) {
        imageError = 'Only JPEG, PNG, or WebP images can be uploaded.';
        setError($('#f-photo', root), imageError);
        photo.value = '';
        uploadFile = null;
        photoName.textContent = 'No photo selected';
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        imageError = 'The image must be no larger than 1 MB.';
        setError($('#f-photo', root), imageError);
        photo.value = '';
        uploadFile = null;
        photoName.textContent = 'No photo selected';
        return;
      }

      imageReadPending = true;
      const reader = new FileReader();
      reader.onload = function () {
        if (readId !== imageReadId) return;
        if (typeof reader.result !== 'string') {
          imageError = 'Could not read the image. Please try again.';
          setError($('#f-photo', root), imageError);
          imageReadPending = false;
          return;
        }
        imageData = reader.result;
        photoPreviewImage.src = imageData;
        photoPreview.hidden = false;
        imageReadPending = false;
        setError($('#f-photo', root), '');
      };
      reader.onerror = function () {
        if (readId !== imageReadId) return;
        imageError = 'Could not read the image. Please try again.';
        setError($('#f-photo', root), imageError);
        imageReadPending = false;
      };
      reader.readAsDataURL(file);
    });

    $('#p-photo-remove', root).addEventListener('click', function () {
      imageReadId += 1;
      photo.value = '';
      imageData = '';
      uploadFile = null;
      photoName.textContent = 'No photo selected';
      imageError = '';
      imageReadPending = false;
      photoPreview.hidden = true;
      photoPreviewImage.removeAttribute('src');
      setError($('#f-photo', root), '');
    });

    $('#board-chips', root).addEventListener('click', function (e) {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      state.category = btn.getAttribute('data-cat');
      B.utils.$$('.chip', root).forEach(function (c) { c.classList.toggle('is-active', c === btn); });
      drawList().catch(function (error) {
        B.ui.toast('Could not load community posts: ' + error.message, 'error');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!B.auth.requireSignIn()) return;
      const name = form.elements.name.value.trim();
      const message = form.elements.message.value.trim();
      let ok = true;

      if (name.length < L.nameMin) {
        setError($('#f-name', root), 'Please enter your name (at least ' + L.nameMin + ' characters).');
        ok = false;
      } else { setError($('#f-name', root), ''); }

      if (message.length < L.postMin) {
        setError($('#f-msg', root), 'Your message is too short (at least ' + L.postMin + ' characters).');
        ok = false;
      } else { setError($('#f-msg', root), ''); }

      if (imageReadPending) {
        setError($('#f-photo', root), 'Please wait for the image to finish processing.');
        ok = false;
      } else if (imageError) {
        setError($('#f-photo', root), imageError);
        ok = false;
      }

      if (!ok) return;

      const submit = $('button[type="submit"]', form);
      submit.disabled = true;
      submit.textContent = uploadFile ? 'Uploading and posting…' : 'Posting…';
      B.store.addPost({
        name: name,
        barangay: form.elements.barangay.value,
        category: form.elements.category.value,
        message: message,
        image: uploadFile
      }).then(function () {
        form.elements.message.value = '';
        count.textContent = '0';
        photo.value = '';
        imageData = '';
        uploadFile = null;
        photoName.textContent = 'No photo selected';
        imageError = '';
        imageReadPending = false;
        imageReadId += 1;
        photoPreview.hidden = true;
        photoPreviewImage.removeAttribute('src');
        setError($('#f-photo', root), '');
        B.ui.toast('Posted! Thank you for sharing.', 'success');
        return drawList();
      }).catch(function (error) {
        B.ui.toast('Could not publish your post: ' + error.message, 'error');
      }).finally(function () {
        submit.disabled = false;
        submit.textContent = 'Post';
      });
    });

    drawList().catch(function (error) {
      B.ui.toast('Could not load community posts: ' + error.message, 'error');
    });
  }

  B.views = B.views || {};
  B.views.board = { title: 'Community Board', render: render };
})(window.Barobo = window.Barobo || {});
