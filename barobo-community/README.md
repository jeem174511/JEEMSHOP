# Barobo Community

A community website platform for Barobo, built with plain HTML, CSS, and JavaScript. No installation or build step is required.

## Getting Started
Open `index.html` directly, or serve the project folder:

```bash
cd barobo-community
python3 -m http.server 8080   # then open http://localhost:8080
```

## Project Structure

```
barobo-community/
├── index.html            # shell: header, footer, script order
├── css/
│   ├── base.css          # colors, reset, typography
│   ├── layout.css        # header/nav, hero, grids, footer
│   └── components.css    # buttons, cards, forms, modal, toast
└── js/
    ├── config.js         # site name, barangays, categories
    ├── auth.js           # Supabase email/password authentication
    ├── data.js           # sample news, events, and directory
    ├── utils.js          # helpers (escaping, dates, debounce)
    ├── storage.js        # safe localStorage wrapper
    ├── store.js          # posts, likes, RSVPs, messages
    ├── ui.js             # toast, modal, mobile navigation
    ├── router.js         # hash router
    ├── icons.js          # inline SVG icons
    ├── components.js     # reusable card renderers
    ├── views/            # one file per page
    │   ├── home.js  news.js  events.js  admin.js
    │   └── board.js  directory.js  about.js
    └── app.js            # app initialization
└── supabase/
    ├── schema.sql        # shared posts, image storage, likes/comments, and RLS policies
    └── editorial-schema.sql # admin-only news and events publishing
```

## Editing the Site
- **News / Events / Directory:** `js/data.js` (replace sample entries with verified information).
- **Barangays and categories:** `js/config.js`.
- **Colors:** variables at the top of `css/base.css`.
- **New page:** create `js/views/<name>.js`, register it in `js/app.js`, and add its script and navigation link in `index.html`.
- **Admin publishing:** Run [`supabase/editorial-schema.sql`](./supabase/editorial-schema.sql) in the Supabase SQL Editor. Create a regular account on the site, find its ID with `SELECT id, email FROM auth.users;`, then approve it in the SQL Editor with `INSERT INTO public.site_admins (user_id) VALUES ('USER_UUID');` (replace `USER_UUID` with that account's ID). Approved accounts see the Admin link and can publish news or events, including up to five JPEG, PNG, or WebP images (10 MB each). Database row-level security restricts publishing and uploads to approved account IDs.

## Important Notes
- **Supabase setup:** Create a Supabase project, enable the Email provider under Authentication → Providers, and set the project's Site URL to `https://barobo-community.vercel.app` and add that URL under Authentication → URL Configuration → Redirect URLs (for local development, also allow `http://localhost:8080/**`). Sign-up confirmation, Google sign-in, and password-reset links return to the site origin currently in use. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor to create/update the shared post/comment/like tables, public image bucket, and Row Level Security policies. Then copy the project URL and publishable (anon) key into `supabase.url` and `supabase.anonKey` in `js/config.js`. The anon key is intended for browser use; never put a `service_role` key in this app. Email confirmation behavior follows the Supabase project's Auth settings.
- Community Board posts and uploaded images are shared through Supabase. Each post stores its creator's Supabase user ID; only that creator sees the Delete button, and the database also restricts deletion to the creator. Images are limited to JPEG, PNG, or WebP and 1 MB. Existing posts saved in individual browsers are not automatically migrated to Supabase.
- News/event comments and likes, comment replies and votes, plus comments and likes on community-board posts, are stored in Supabase and shared across users. Signed-in users can like or downlike each comment. Comments display the author's email with a stable email-derived avatar and the server-recorded date and time; comment email addresses are returned only to signed-in users. RSVPs and messages remain browser-local.
- Add verified local emergency and service contact information in `js/data.js`.
