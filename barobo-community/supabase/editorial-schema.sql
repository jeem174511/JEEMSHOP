create table if not exists public.site_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.site_admins enable row level security;
revoke all on public.site_admins from public, anon, authenticated;

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.site_admins as admins
    where admins.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_site_admin() from public, anon, authenticated;
grant execute on function public.is_site_admin() to anon, authenticated;

create table if not exists public.editorial_news (
  id text primary key default gen_random_uuid()::text,
  category text not null,
  hue integer not null default 170 check (hue between 0 and 360),
  published_on date not null,
  end_date date,
  title text not null check (char_length(title) between 1 and 200),
  summary text not null check (char_length(summary) between 1 and 2000),
  body text[] not null default '{}',
  image_paths text[] not null default '{}',
  created_at timestamptz not null default now(),
  check (end_date is null or end_date >= published_on)
);

create index if not exists editorial_news_published_idx
  on public.editorial_news (published_on desc, created_at desc);

alter table public.editorial_news enable row level security;
drop policy if exists "Anyone can read editorial news" on public.editorial_news;
create policy "Anyone can read editorial news"
  on public.editorial_news for select
  using (true);
drop policy if exists "Admins can manage editorial news" on public.editorial_news;
create policy "Admins can manage editorial news"
  on public.editorial_news for all to authenticated
  using ((select public.is_site_admin()))
  with check ((select public.is_site_admin()));

grant select on public.editorial_news to anon, authenticated;
grant insert, update, delete on public.editorial_news to authenticated;

create table if not exists public.editorial_events (
  id text primary key default gen_random_uuid()::text,
  event_date date not null,
  end_date date,
  title text not null check (char_length(title) between 1 and 200),
  event_time text not null default 'To be announced',
  place text not null,
  category text not null,
  description text not null check (char_length(description) between 1 and 4000),
  image_paths text[] not null default '{}',
  going integer not null default 0 check (going >= 0),
  created_at timestamptz not null default now(),
  check (end_date is null or end_date >= event_date)
);

create index if not exists editorial_events_date_idx
  on public.editorial_events (event_date, created_at desc);

alter table public.editorial_events enable row level security;
drop policy if exists "Anyone can read editorial events" on public.editorial_events;
create policy "Anyone can read editorial events"
  on public.editorial_events for select
  using (true);
drop policy if exists "Admins can manage editorial events" on public.editorial_events;
create policy "Admins can manage editorial events"
  on public.editorial_events for all to authenticated
  using ((select public.is_site_admin()))
  with check ((select public.is_site_admin()));

grant select on public.editorial_events to anon, authenticated;
grant insert, update, delete on public.editorial_events to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'editorial-media',
  'editorial-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view editorial media" on storage.objects;
create policy "Anyone can view editorial media"
  on storage.objects for select
  using (bucket_id = 'editorial-media');
drop policy if exists "Admins can upload editorial media" on storage.objects;
create policy "Admins can upload editorial media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'editorial-media'
    and (select public.is_site_admin())
  );
drop policy if exists "Admins can update editorial media" on storage.objects;
create policy "Admins can update editorial media"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'editorial-media'
    and (select public.is_site_admin())
  )
  with check (
    bucket_id = 'editorial-media'
    and (select public.is_site_admin())
  );
drop policy if exists "Admins can delete editorial media" on storage.objects;
create policy "Admins can delete editorial media"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'editorial-media'
    and (select public.is_site_admin())
  );
