/* components.js — reusable HTML renderers used across pages */
(function (B) {
  const { esc, fmtDate, toDate, timeAgo, initial, $, $$ } = B.utils;

  function newsIcon(category) {
    const icons = {
      All: 'newspaper',
      News: 'megaphone',
      Health: 'stethoscope',
      Education: 'graduation-cap',
      Business: 'briefcase'
    };
    return B.icons.svg(icons[category] || 'newspaper', 'card__media-icon');
  }

  function pageHead(title, subtitle) {
    return '<section class="page-head"><div class="container">' +
      '<h1>' + esc(title) + '</h1><p>' + esc(subtitle) + '</p></div></section>';
  }

  function empty(icon, message) {
    return '<div class="empty"><div class="empty__icon" aria-hidden="true">' + icon + '</div><p>' + esc(message) + '</p></div>';
  }

  function newsDate(n) {
    if (!n.dateEnd) return fmtDate(n.date);
    const start = toDate(n.date);
    const end = toDate(n.dateEnd);
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return start.toLocaleDateString('en-PH', { month: 'long' }) + ' ' + start.getDate() + '–' +
        end.getDate() + ', ' + end.getFullYear();
    }
    return fmtDate(n.date) + '–' + fmtDate(n.dateEnd);
  }

  function newsCard(n) {
    const liked = false;
    return '<article class="card' + (n.image ? ' card--with-image' : '') + '">' +
      '<div class="card__media" style="--hue:' + Number(n.hue) + '" aria-hidden="true">' +
        (n.image
          ? '<img class="card__image" src="' + esc(n.image) + '" alt="" loading="lazy">'
          : newsIcon(n.category)) +
      '</div>' +
      '<div class="card__body">' +
        '<span class="badge">' + esc(n.category) + '</span>' +
        '<h3>' + esc(n.title) + '</h3>' +
        '<p class="muted small">' + esc(newsDate(n)) + '</p>' +
        '<p>' + esc(n.summary) + '</p>' +
        '<div class="news-card__actions">' +
          '<button type="button" class="btn btn--ghost btn--sm" data-read="' + esc(n.id) + '">Read more</button>' +
          '<div class="news-card__engagement">' +
          '<button type="button" class="btn btn--ghost btn--sm news-like-btn' + (liked ? ' is-liked' : '') + '" data-news-like="' + esc(n.id) + '" aria-pressed="' + liked + '" aria-label="' + (liked ? 'Unlike' : 'Like this news') + '">' +
            B.icons.svg('thumbs-up') + '<span data-news-likes>0</span></button>' +
          '<button type="button" class="btn btn--ghost btn--sm news-comment-btn" data-news-comment="' + esc(n.id) + '" aria-label="Comment on this news">' +
            B.icons.svg('messages') + '<span data-news-comment-count>0</span></button>' +
          '<span class="news-views muted small" aria-label="' + B.store.getNewsViews(n.id) + ' views">' +
            B.icons.svg('eye') + '<span data-news-view-count>' + B.store.getNewsViews(n.id) + '</span></span>' +
          '</div>' +
        '</div>' +
      '</div></article>';
  }

  function eventCard(e) {
    const date = toDate(e.date);
    const endDate = toDate(e.endDate || e.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ended = !e.showInUpcoming && endDate < today;
    const joined = B.store.hasJoined(e.id);
    const liked = false;
    const count = e.going + (joined ? 1 : 0);
    const month = date.toLocaleDateString('en-PH', { month: 'short' });
    return '<article class="card event">' +
      (e.hideDate ? '' : '<div class="date-badge' + (e.endDate ? ' date-badge--range' : '') + '" aria-hidden="true"><strong>' +
        date.getDate() + (e.endDate ? '–' + endDate.getDate() : '') + '</strong><span>' + esc(month) + '</span></div>') +
      '<div class="event__main">' +
        (e.images && e.images.length
          ? '<div class="event__gallery">' + e.images.map(function (image, index) {
            return '<img class="event__image" src="' + esc(image) + '" alt="Image ' + (index + 1) + ' for ' + esc(e.title) + '" loading="lazy">';
          }).join('') + '</div>'
          : e.image ? '<img class="event__image" src="' + esc(e.image) + '" alt="Poster for ' + esc(e.title) + '" loading="lazy">' : '') +
        '<span class="badge">' + esc(e.category) + '</span>' +
        '<h3>' + esc(e.title) + '</h3>' +
        '<div class="event__meta"><span>' + B.icons.svg('clock') + esc(e.time) + '</span><span>' + B.icons.svg('pin') + esc(e.place) + '</span></div>' +
        '<p class="event__description">' + esc(e.desc) + '</p>' +
        '<div class="event__engagement">' +
          '<button type="button" class="btn btn--ghost btn--sm event-like-btn' + (liked ? ' is-liked' : '') + '" data-event-like="' + esc(e.id) + '" aria-pressed="' + liked + '" aria-label="' + (liked ? 'Unlike this event' : 'Like this event') + '">' +
            B.icons.svg('thumbs-up') + '<span data-event-likes>0</span></button>' +
          '<button type="button" class="btn btn--ghost btn--sm event-comment-btn" data-event-comment="' + esc(e.id) + '" aria-label="Comment on this event">' +
            B.icons.svg('messages') + '<span data-event-comment-count>0</span></button>' +
        '</div>' +
        (ended ? '<p class="muted small event__ended">Ended on ' + esc(fmtDate(e.endDate || e.date)) + '.</p>' : '') +
        (ended ? '' : '<div class="event__actions">' +
          '<button type="button" class="btn btn--sm ' + (joined ? 'btn--success' : 'btn--primary') + '" data-rsvp="' + esc(e.id) + '" aria-pressed="' + joined + '">' +
            (joined ? B.icons.svg('check') + ' Attending' : 'I will attend') + '</button>' +
          '<span class="muted small">' + count + ' attending</span>' +
        '</div>') +
      '</div></article>';
  }

  function postCard(p) {
    const liked = false;
    return '<article class="card post">' +
      '<div class="post__head">' +
        '<div class="avatar" aria-hidden="true">' + esc(initial(p.name)) + '</div>' +
        '<div class="post__who"><strong>' + esc(p.name) + '</strong>' +
        '<span class="muted small">' + esc(p.barangay) + ' • ' + esc(timeAgo(p.createdAt)) + '</span></div>' +
      '</div>' +
      '<span class="badge">' + esc(p.category) + '</span>' +
      '<p class="post__text">' + esc(p.message) + '</p>' +
      (p.image ? '<img class="post__image" src="' + esc(p.image) + '" alt="Photo shared by ' + esc(p.name) + '" loading="lazy">' : '') +
      '<div class="post__foot">' +
        '<button type="button" class="btn btn--ghost btn--sm like-btn' + (liked ? ' is-liked' : '') + '" data-like="' + esc(p.id) + '" aria-pressed="' + liked + '" aria-label="' + (liked ? 'Unlike this post' : 'Like this post') + '">' +
          B.icons.svg('thumbs-up') + ' <span data-post-likes>0</span></button>' +
        '<button type="button" class="btn btn--ghost btn--sm news-comment-btn" data-post-comment="' + esc(p.id) + '" aria-label="Comment on this post">' +
          B.icons.svg('messages') + ' <span data-post-comment-count>0</span></button>' +
        (p.mine === true ? '<button type="button" class="btn btn--danger btn--sm" data-del="' + esc(p.id) + '">Delete</button>' : '') +
      '</div></article>';
  }

  function commentAvatar(email) {
    const value = String(email || 'community member').trim();
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) | 0;
    }
    const initials = (value.split('@')[0].replace(/[^a-z0-9]/gi, '').slice(0, 2) || '?').toUpperCase();
    return '<span class="news-comment__avatar" style="--avatar-hue:' + (Math.abs(hash) % 360) + '" aria-hidden="true">' +
      esc(initials) + '</span>';
  }

  function commentDateTime(value) {
    return new Date(value).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'Asia/Manila'
    });
  }

  function bindComments(root, selector, idAttribute, contentType, countSelector) {
    $$(selector, root).forEach(function (btn) {
      const itemId = btn.getAttribute(idAttribute);
      const card = btn.closest('.card');
      const count = card && $(countSelector, card);
      B.store.getCommentCount(contentType, itemId).then(function (value) {
        if (count) count.textContent = String(value);
      }).catch(function (error) {
        B.ui.toast('Could not load comment count: ' + error.message, 'error');
      });

      btn.addEventListener('click', function () {
        if (!B.auth.requireSignIn()) return;
        B.ui.openModal({
          title: 'Comments',
          className: 'modal--comments',
          html: '<div class="news-comments">' +
            '<p class="muted small">Comments are shared with the community.</p>' +
            '<div class="news-comments__list" data-comment-list aria-live="polite"></div>' +
            '<form class="news-comment-form" data-comment-form novalidate>' +
              '<div class="field" data-comment-field>' +
                '<label for="comment-input">Write a comment</label>' +
                '<textarea id="comment-input" name="comment" maxlength="500" required placeholder="Write your comment here…"></textarea>' +
                '<span class="field__error" data-comment-error role="alert"></span>' +
              '</div>' +
              '<button type="submit" class="btn btn--primary">Post comment</button>' +
            '</form>' +
          '</div>',
          onMount: function (modalRoot) {
            const list = $('[data-comment-list]', modalRoot);
            const form = $('[data-comment-form]', modalRoot);
            const textarea = $('#comment-input', modalRoot);

            function renderComment(comment, isReply) {
              return '<article class="news-comment' + (isReply ? ' news-comment--reply' : '') + '" data-comment-id="' + esc(comment.id) + '">' +
                '<div class="news-comment__head">' + commentAvatar(comment.authorEmail) +
                '<div class="news-comment__meta"><strong>' + esc(comment.authorEmail || 'Community member') + '</strong>' +
                '<time class="muted small" datetime="' + esc(comment.createdAt) + '">' +
                esc(commentDateTime(comment.createdAt)) + '</time></div></div>' +
                '<p>' + esc(comment.text) + '</p>' +
                '<div class="news-comment__actions">' +
                  '<div class="news-comment__votes" role="group" aria-label="Rate this comment">' +
                    '<button type="button" class="news-comment__vote' + (comment.userVote === 1 ? ' is-selected' : '') +
                      '" data-comment-vote="1" aria-pressed="' + (comment.userVote === 1) + '" aria-label="Like comment">' +
                      B.icons.svg('thumbs-up') + '<span>' + comment.likeCount + '</span></button>' +
                    '<button type="button" class="news-comment__vote' + (comment.userVote === -1 ? ' is-selected' : '') +
                      '" data-comment-vote="-1" aria-pressed="' + (comment.userVote === -1) + '" aria-label="Downlike comment">' +
                      B.icons.svg('thumbs-up', 'news-comment__thumb-down') + '<span>' + comment.downlikeCount + '</span></button>' +
                  '</div>' +
                  (isReply ? '' : '<button type="button" class="news-comment__reply-btn" data-reply-to="' + esc(comment.id) + '">' +
                    B.icons.svg('reply') + '<span>Reply</span></button>') +
                '</div>' +
                (isReply ? '' : '<form class="news-comment__reply-form" data-reply-form data-parent-comment="' + esc(comment.id) + '" hidden novalidate>' +
                  '<div class="field"><label class="sr-only" for="reply-' + esc(comment.id) + '">Write a reply</label>' +
                    '<textarea id="reply-' + esc(comment.id) + '" name="reply" maxlength="500" required placeholder="Write your reply here…"></textarea>' +
                    '<span class="field__error" data-reply-error role="alert"></span></div>' +
                  '<div class="news-comment__reply-actions"><button type="submit" class="btn btn--primary btn--sm">Reply</button>' +
                    '<button type="button" class="btn btn--ghost btn--sm" data-cancel-reply>Cancel</button></div>' +
                '</form>') +
              '</article>';
            }

            async function drawComments() {
              const comments = await B.store.getComments(contentType, itemId);
              const replies = new Map();
              comments.forEach(function (comment) {
                if (comment.parentCommentId == null) return;
                const parentId = String(comment.parentCommentId);
                if (!replies.has(parentId)) replies.set(parentId, []);
                replies.get(parentId).push(comment);
              });
              const topLevel = comments.filter(function (comment) { return comment.parentCommentId == null; });
              list.innerHTML = topLevel.length
                ? topLevel.map(function (comment) {
                  const children = replies.get(String(comment.id)) || [];
                  return '<div class="news-comment-thread">' + renderComment(comment, false) +
                    (children.length ? '<div class="news-comment__replies">' +
                      children.map(function (reply) { return renderComment(reply, true); }).join('') +
                    '</div>' : '') + '</div>';
                }).join('')
                : '<p class="news-comments__empty muted">No comments yet. Be the first to comment.</p>';
            }

            textarea.focus();
            drawComments().catch(function (error) {
              B.ui.toast('Could not load comments: ' + error.message, 'error');
            });
            list.addEventListener('click', function (event) {
              const replyButton = event.target.closest('[data-reply-to]');
              if (replyButton) {
                if (!B.auth.requireSignIn()) return;
                const thread = replyButton.closest('.news-comment-thread');
                const replyForm = thread && $('[data-reply-form]', thread);
                if (replyForm) {
                  replyForm.hidden = false;
                  $('textarea', replyForm).focus();
                }
                return;
              }

              const cancelButton = event.target.closest('[data-cancel-reply]');
              if (cancelButton) {
                const replyForm = cancelButton.closest('[data-reply-form]');
                if (replyForm) {
                  replyForm.hidden = true;
                  replyForm.reset();
                  $('[data-reply-error]', replyForm).textContent = '';
                }
                return;
              }

              const button = event.target.closest('[data-comment-vote]');
              if (!button || !B.auth.requireSignIn()) return;
              const comment = button.closest('.news-comment');
              const commentId = comment && comment.getAttribute('data-comment-id');
              if (!commentId) return;

              const vote = Number(button.getAttribute('data-comment-vote'));
              B.utils.$$('[data-comment-vote]', comment).forEach(function (voteButton) {
                voteButton.disabled = true;
              });
              B.store.toggleCommentVote(commentId, vote).then(function (summary) {
                const likeButton = $('[data-comment-vote="1"]', comment);
                const downlikeButton = $('[data-comment-vote="-1"]', comment);
                $('[data-comment-vote="1"] span', comment).textContent = String(summary.likeCount);
                $('[data-comment-vote="-1"] span', comment).textContent = String(summary.downlikeCount);
                likeButton.classList.toggle('is-selected', summary.userVote === 1);
                likeButton.setAttribute('aria-pressed', String(summary.userVote === 1));
                downlikeButton.classList.toggle('is-selected', summary.userVote === -1);
                downlikeButton.setAttribute('aria-pressed', String(summary.userVote === -1));
              }).catch(function (failure) {
                B.ui.toast('Could not save your vote: ' + failure.message, 'error');
              }).finally(function () {
                B.utils.$$('[data-comment-vote]', comment).forEach(function (voteButton) {
                  voteButton.disabled = false;
                });
              });
            });

            async function submitComment(commentForm, parentCommentId) {
              if (!B.auth.requireSignIn()) return;
              const replyTextarea = $('textarea', commentForm);
              const commentText = replyTextarea.value.trim();
              const replyError = $('[data-reply-error]', commentForm) || $('[data-comment-error]', commentForm);
              const commentField = $('[data-comment-field]', commentForm) || replyTextarea.closest('.field');
              if (!commentText) {
                if (commentField) commentField.classList.add('has-error');
                if (replyError) replyError.textContent = parentCommentId ? 'Please enter a reply.' : 'Please enter a comment.';
                replyTextarea.setAttribute('aria-invalid', 'true');
                replyTextarea.focus();
                return;
              }

              const submit = $('button[type="submit"]', commentForm);
              submit.disabled = true;
              submit.textContent = parentCommentId ? 'Replying…' : 'Posting…';
              try {
                await B.store.addComment(contentType, itemId, commentText, parentCommentId);
                if (commentField) commentField.classList.remove('has-error');
                if (replyError) replyError.textContent = '';
                replyTextarea.removeAttribute('aria-invalid');
                commentForm.reset();
                await drawComments();
                const commentCount = await B.store.getCommentCount(contentType, itemId);
                if (count) count.textContent = String(commentCount);
              } catch (failure) {
                B.ui.toast('Could not post ' + (parentCommentId ? 'reply' : 'comment') + ': ' + failure.message, 'error');
              } finally {
                submit.disabled = false;
                submit.textContent = parentCommentId ? 'Reply' : 'Post comment';
              }
            }

            list.addEventListener('submit', function (event) {
              const replyForm = event.target.closest('[data-reply-form]');
              if (!replyForm) return;
              event.preventDefault();
              submitComment(replyForm, replyForm.getAttribute('data-parent-comment'));
            });

            form.addEventListener('submit', function (event) {
              event.preventDefault();
              submitComment(form, null);
            });
          }
        });
      });
    });
  }

  /** Binds "Read more" buttons to open the article modal. */
  function bindLikes(root, selector, attribute, contentType, countSelector) {
    $$(selector, root).forEach(function (btn) {
      const contentId = btn.getAttribute(attribute);
      const count = $(countSelector, btn);
      B.store.getLikeSummary(contentType, contentId).then(function (summary) {
        if (count) count.textContent = String(summary.count);
        btn.classList.toggle('is-liked', summary.liked);
        btn.setAttribute('aria-pressed', String(summary.liked));
        if (contentType === 'post') {
          btn.setAttribute('aria-label', summary.liked ? 'Unlike this post' : 'Like this post');
        }
      }).catch(function (error) {
        B.ui.toast('Could not load likes: ' + error.message, 'error');
      });

      btn.addEventListener('click', function () {
        if (!B.auth.requireSignIn()) return;
        btn.disabled = true;
        B.store.toggleContentLike(contentType, contentId).then(function (summary) {
          if (count) count.textContent = String(summary.count);
          btn.classList.toggle('is-liked', summary.liked);
          btn.setAttribute('aria-pressed', String(summary.liked));
          if (contentType === 'news') {
            btn.setAttribute('aria-label', summary.liked ? 'Unlike' : 'Like this news');
          } else if (contentType === 'event') {
            btn.setAttribute('aria-label', summary.liked ? 'Unlike this event' : 'Like this event');
          } else if (contentType === 'post') {
            btn.setAttribute('aria-label', summary.liked ? 'Unlike this post' : 'Like this post');
          }
        }).catch(function (error) {
          B.ui.toast('Could not save your like: ' + error.message, 'error');
        }).finally(function () {
          btn.disabled = false;
        });
      });
    });
  }

  function bindNews(root) {
    bindLikes(root, '[data-news-like]', 'data-news-like', 'news', '[data-news-likes]');
    $$('[data-read]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!B.auth.requireSignIn()) return;
        const newsId = btn.getAttribute('data-read');

        function openNewsModal(n) {
          if (!n) return;
          const paragraphs = Array.isArray(n.body) ? n.body : [n.body].filter(Boolean);
          const images = Array.isArray(n.images) ? n.images : [];
          const views = B.store.incrementNewsViews(newsId);
          const card = btn.closest('.card');
          const viewCount = card && $('[data-news-view-count]', card);
          if (viewCount) {
            viewCount.textContent = String(views);
            viewCount.parentElement.setAttribute('aria-label', views + ' views');
          }
          B.ui.openModal({
            title: n.title,
            html: '<div class="article"><span class="badge">' + esc(n.category) + '</span>' +
              '<p class="muted small">' + esc(newsDate(n)) + '</p>' +
              (paragraphs.length ? paragraphs.map(function (para) { return '<p>' + esc(para) + '</p>'; }).join('') : '<p>' + esc(n.summary || '') + '</p>') +
              (images.length ? '<div class="article__pages" aria-label="Article images">' +
                images.map(function (image, index) {
                  return '<img src="' + esc(image) + '" alt="' + esc(n.title) + ', image ' + (index + 1) + '" loading="lazy">';
                }).join('') + '</div>' : '') + '</div>'
          });
        }

        const staticMatch = (B.data.news || []).find(function (x) {
          return String(x.id) === String(newsId);
        });
        if (staticMatch) {
          openNewsModal(staticMatch);
          return;
        }

        B.store.getNews().then(function (items) {
          const liveMatch = (items || []).find(function (x) {
            return String(x.id) === String(newsId);
          });
          openNewsModal(liveMatch);
        }).catch(function (error) {
          B.ui.toast('Could not load this news item: ' + error.message, 'error');
        });
      });
    });
    bindComments(root, '[data-news-comment]', 'data-news-comment', 'news', '[data-news-comment-count]');
  }

  function bindEvents(root) {
    bindLikes(root, '[data-event-like]', 'data-event-like', 'event', '[data-event-likes]');
    bindComments(root, '[data-event-comment]', 'data-event-comment', 'event', '[data-event-comment-count]');
  }

  /** Binds RSVP buttons and calls onChange after an update. */
  function bindRsvp(root, onChange) {
    $$('[data-rsvp]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!B.auth.requireSignIn()) return;
        const joined = B.store.toggleRsvp(btn.getAttribute('data-rsvp'));
        B.ui.toast(joined ? 'You are on the attendee list.' : 'Your RSVP has been removed.', joined ? 'success' : '');
        onChange();
      });
    });
  }

  /** Binds post like and delete buttons. */
  function bindPosts(root, onChange) {
    bindLikes(root, '[data-like]', 'data-like', 'post', '[data-post-likes]');
    bindComments(root, '[data-post-comment]', 'data-post-comment', 'post', '[data-post-comment-count]');
    $$('[data-del]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!B.auth.requireSignIn()) return;
        if (!window.confirm('Delete your post?')) return;
        btn.disabled = true;
        B.store.deletePost(btn.getAttribute('data-del')).then(function (result) {
          B.ui.toast(result.imageCleanupError
            ? 'Post deleted, but its image could not be removed: ' + result.imageCleanupError
            : 'Post deleted.', result.imageCleanupError ? 'error' : 'success');
          return onChange();
        }).catch(function (error) {
          B.ui.toast('Could not delete post: ' + error.message, 'error');
        }).finally(function () {
          btn.disabled = false;
        });
      });
    });
  }

  B.components = { pageHead, empty, newsCard, eventCard, postCard, bindNews, bindEvents, bindRsvp, bindPosts };
})(window.Barobo = window.Barobo || {});
