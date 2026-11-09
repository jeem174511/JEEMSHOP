/* store.js — all reads and writes for user data (posts, likes, RSVPs, messages).
   Replace this code here if a real backend is added in the future. */
(function (B) {
  const S = B.storage;

  const LIKE_TABLE = 'content_likes';
  const COMMENT_TABLE = 'content_comments';
  const POST_TABLE = 'community_posts';
  const STORAGE_BUCKET = 'community-post-images';

  function getAuthClient() {
    const client = B.auth && B.auth.getClient();
    if (!client) throw new Error('Supabase is not configured. Add the project URL and anon key in js/config.js.');
    return client;
  }

  async function getCurrentUserId(client) {
    const result = await client.auth.getUser();
    if (result.error) throw result.error;
    if (!result.data.user) throw new Error('Please sign in to use this feature.');
    return result.data.user.id;
  }

  async function getPosts() {
    const client = getAuthClient();
    const [result, userResult] = await Promise.allSettled([
      client.rpc('get_community_posts'),
      client.auth.getUser().catch(function (error) {
        return { error: error, data: { user: null } };
      })
    ]);

    if (result.status === 'rejected') {
      throw result.reason;
    }
    if (result.value.error) {
      throw result.value.error;
    }

    const currentUserId = userResult.status === 'fulfilled' && userResult.value && userResult.value.data && userResult.value.data.user
      ? userResult.value.data.user.id
      : null;

    return result.value.data.map(function (row) {
      return {
        id: String(row.id),
        name: row.name,
        barangay: row.barangay,
        category: row.category,
        message: row.message,
        image: row.image_path
          ? client.storage.from(STORAGE_BUCKET).getPublicUrl(row.image_path).data.publicUrl
          : '',
        createdAt: row.created_at,
        likes: 0,
        mine: Boolean(currentUserId && row.owner_id === currentUserId)
      };
    });
  }

  async function addPost(input) {
    const client = getAuthClient();
    const userId = await getCurrentUserId(client);
    let imagePath = null;

    if (input.image) {
      const safeName = input.image.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      imagePath = userId + '/' + B.utils.uid() + '-' + safeName;
      const upload = await client.storage.from(STORAGE_BUCKET).upload(imagePath, input.image, {
        contentType: input.image.type,
        upsert: false
      });
      if (upload.error) throw upload.error;
    }

    let result;
    try {
      result = await client.from(POST_TABLE).insert({
        user_id: userId,
        name: input.name,
        barangay: input.barangay,
        category: input.category,
        message: input.message,
        image_path: imagePath
      }).select('id, name, barangay, category, message, image_path, created_at').single();
    } catch (error) {
      if (imagePath) {
        const cleanup = await client.storage.from(STORAGE_BUCKET).remove([imagePath]);
        if (cleanup.error) {
          throw new Error(error.message + ' The uploaded image could not be cleaned up: ' + cleanup.error.message);
        }
      }
      throw error;
    }

    if (result.error) {
      if (imagePath) {
        const cleanup = await client.storage.from(STORAGE_BUCKET).remove([imagePath]);
        if (cleanup.error) {
          throw new Error(result.error.message + ' The uploaded image could not be cleaned up: ' + cleanup.error.message);
        }
      }
      throw result.error;
    }

    const row = result.data;
    return {
      id: String(row.id),
      name: row.name,
      barangay: row.barangay,
      category: row.category,
      message: row.message,
      image: row.image_path
        ? client.storage.from(STORAGE_BUCKET).getPublicUrl(row.image_path).data.publicUrl
        : '',
      createdAt: row.created_at,
      likes: 0,
      mine: true
    };
  }

  async function deletePost(id) {
    const client = getAuthClient();
    const removed = await client.rpc('delete_community_post', { p_post_id: Number(id) });
    if (removed.error) throw removed.error;
    const result = Array.isArray(removed.data) ? removed.data[0] : removed.data;

    if (result && result.image_path) {
      const imageRemoval = await client.storage.from(STORAGE_BUCKET).remove([result.image_path]);
      if (imageRemoval.error) {
        return { imageCleanupError: imageRemoval.error.message };
      }
    }
    return { imageCleanupError: null };
  }

  async function getLikeSummary(contentType, contentId) {
    const result = await getAuthClient().rpc('get_content_like_summary', {
      p_content_type: contentType,
      p_content_id: contentId
    });
    if (result.error) throw result.error;
    const summary = Array.isArray(result.data) ? result.data[0] : result.data;
    return {
      count: summary ? Number(summary.like_count) : 0,
      liked: Boolean(summary && summary.liked)
    };
  }

  async function toggleContentLike(contentType, contentId) {
    const client = getAuthClient();
    const userId = await getCurrentUserId(client);
    const existing = await client.from(LIKE_TABLE)
      .select('user_id')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('user_id', userId)
      .maybeSingle();
    if (existing.error) throw existing.error;

    let liked;
    if (existing.data) {
      const removed = await client.from(LIKE_TABLE)
        .delete()
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('user_id', userId);
      if (removed.error) throw removed.error;
      liked = false;
    } else {
      const inserted = await client.from(LIKE_TABLE).insert({
        content_type: contentType,
        content_id: contentId,
        user_id: userId
      });
      if (inserted.error) throw inserted.error;
      liked = true;
    }

    const summary = await getLikeSummary(contentType, contentId);
    return { count: summary.count, liked: liked };
  }

  async function getCommentCount(contentType, contentId) {
    const result = await getAuthClient().from(COMMENT_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('content_type', contentType)
      .eq('content_id', contentId);
    if (result.error) throw result.error;
    return result.count || 0;
  }

  async function getComments(contentType, contentId) {
    const result = await getAuthClient().rpc('get_content_comments', {
      p_content_type: contentType,
      p_content_id: contentId
    });
    if (result.error) throw result.error;
    return result.data.map(function (comment) {
      return {
        id: comment.id,
        text: comment.body,
        createdAt: comment.created_at,
        authorEmail: comment.author_email,
        parentCommentId: comment.parent_comment_id,
        likeCount: Number(comment.like_count),
        downlikeCount: Number(comment.downlike_count),
        userVote: comment.user_vote == null ? 0 : Number(comment.user_vote)
      };
    });
  }

  async function toggleCommentVote(commentId, vote) {
    const result = await getAuthClient().rpc('toggle_comment_vote', {
      p_comment_id: commentId,
      p_vote: vote
    });
    if (result.error) throw result.error;
    const summary = Array.isArray(result.data) ? result.data[0] : result.data;
    return {
      likeCount: Number(summary.like_count),
      downlikeCount: Number(summary.downlike_count),
      userVote: summary.user_vote == null ? 0 : Number(summary.user_vote)
    };
  }

  async function addComment(contentType, contentId, text, parentCommentId) {
    const result = await getAuthClient().rpc('add_content_comment', {
      p_content_type: contentType,
      p_content_id: contentId,
      p_body: text,
      p_parent_comment_id: parentCommentId == null ? null : Number(parentCommentId)
    });
    if (result.error) throw result.error;
    const comment = Array.isArray(result.data) ? result.data[0] : result.data;
    return {
      id: comment.id,
      text: comment.body,
      createdAt: comment.created_at,
      parentCommentId: comment.parent_comment_id
    };
  }

  async function getEditorialNews() {
    const client = getAuthClient();
    const result = await client.from('editorial_news')
      .select('id, category, hue, published_on, end_date, title, summary, body, image_paths')
      .order('published_on', { ascending: false });
    if (result.error) throw result.error;
    return result.data.map(function (row) {
      const images = (row.image_paths || []).map(function (path) {
        return client.storage.from('editorial-media').getPublicUrl(path).data.publicUrl;
      });
      return {
        id: row.id,
        category: row.category,
        hue: row.hue,
        date: row.published_on,
        dateEnd: row.end_date,
        title: row.title,
        summary: row.summary,
        body: row.body || [],
        image: images[0] || '',
        images: images
      };
    });
  }

  async function getEditorialEvents() {
    const client = getAuthClient();
    const result = await client.from('editorial_events')
      .select('id, event_date, end_date, title, event_time, place, category, description, image_paths, going')
      .order('event_date', { ascending: true });
    if (result.error) throw result.error;
    return result.data.map(function (row) {
      return {
        id: row.id,
        date: row.event_date,
        endDate: row.end_date,
        title: row.title,
        time: row.event_time,
        place: row.place,
        category: row.category,
        desc: row.description,
        images: (row.image_paths || []).map(function (path) {
          return client.storage.from('editorial-media').getPublicUrl(path).data.publicUrl;
        }),
        going: row.going
      };
    });
  }

  async function getNews() {
    const news = B.data.news.concat(await getEditorialNews());
    return news.sort(function (a, b) {
      return B.utils.toDate(b.date) - B.utils.toDate(a.date);
    });
  }

  async function getEvents() {
    const events = B.data.events.concat(await getEditorialEvents());
    return events.sort(function (a, b) {
      return B.utils.toDate(a.date) - B.utils.toDate(b.date);
    });
  }

  async function isSiteAdmin() {
    const result = await getAuthClient().rpc('is_site_admin');
    if (result.error) throw result.error;
    return result.data === true;
  }

  async function uploadEditorialImages(client, files) {
    if (files.length > 5) throw new Error('You can upload up to 5 images per post.');
    const userId = await getCurrentUserId(client);
    const paths = [];
    const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      if (!extensions[file.type]) throw new Error('Only JPEG, PNG, or WebP images can be uploaded.');
      if (file.size > 10 * 1024 * 1024) throw new Error('Each image must be no larger than 10 MB.');
      const path = userId + '/' + B.utils.uid() + '.' + extensions[file.type];
      const result = await client.storage.from('editorial-media').upload(path, file, {
        contentType: file.type,
        upsert: false
      });
      if (result.error) {
        if (paths.length) {
          const cleanup = await client.storage.from('editorial-media').remove(paths);
          if (cleanup.error) {
            throw new Error(result.error.message + ' Some uploaded images could not be cleaned up: ' + cleanup.error.message);
          }
        }
        throw result.error;
      }
      paths.push(path);
    }
    return paths;
  }

  async function removeEditorialImages(client, paths, cause) {
    if (!paths.length) throw cause;
    const cleanup = await client.storage.from('editorial-media').remove(paths);
    if (cleanup.error) {
      throw new Error(cause.message + ' Uploaded images could not be cleaned up: ' + cleanup.error.message);
    }
    throw cause;
  }

  async function createEditorialNews(input) {
    const client = getAuthClient();
    if (!(await isSiteAdmin())) throw new Error('Administrator access is required to publish news.');
    const paths = await uploadEditorialImages(client, input.images);
    const result = await client.from('editorial_news').insert({
      category: input.category,
      published_on: input.date,
      end_date: input.dateEnd || null,
      title: input.title,
      summary: input.summary,
      body: input.body,
      image_paths: paths
    });
    if (result.error) await removeEditorialImages(client, paths, result.error);
  }

  async function createEditorialEvent(input) {
    const client = getAuthClient();
    if (!(await isSiteAdmin())) throw new Error('Administrator access is required to publish events.');
    const paths = await uploadEditorialImages(client, input.images);
    const result = await client.from('editorial_events').insert({
      event_date: input.date,
      end_date: input.endDate || null,
      title: input.title,
      event_time: input.time,
      place: input.place,
      category: input.category,
      description: input.description,
      image_paths: paths
    });
    if (result.error) await removeEditorialImages(client, paths, result.error);
  }

  function hasJoined(eventId) {
    return S.get('rsvps', []).indexOf(eventId) !== -1;
  }

  /** Returns the new state (true = attending). */
  function toggleRsvp(eventId) {
    const rsvps = S.get('rsvps', []);
    const idx = rsvps.indexOf(eventId);
    if (idx === -1) rsvps.push(eventId); else rsvps.splice(idx, 1);
    S.set('rsvps', rsvps);
    return idx === -1;
  }

  function getNewsViews(newsId) {
    const views = S.get('newsViews', {});
    return Number.isSafeInteger(views[newsId]) && views[newsId] > 0 ? views[newsId] : 0;
  }

  function incrementNewsViews(newsId) {
    const views = S.get('newsViews', {});
    views[newsId] = getNewsViews(newsId) + 1;
    S.set('newsViews', views);
    return views[newsId];
  }

  function addMessage(msg) {
    const list = S.get('messages', []);
    list.push(Object.assign({ id: B.utils.uid(), createdAt: new Date().toISOString() }, msg));
    S.set('messages', list);
  }

  B.store = {
    getPosts, addPost, deletePost, hasJoined, toggleRsvp,
    getLikeSummary, toggleContentLike, getCommentCount, getComments, toggleCommentVote, addComment,
    getNews, getEvents, isSiteAdmin, createEditorialNews, createEditorialEvent,
    getNewsViews, incrementNewsViews, addMessage
  };
})(window.Barobo = window.Barobo || {});
