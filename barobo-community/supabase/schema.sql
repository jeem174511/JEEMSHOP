create table if not exists public.community_posts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 40),
  barangay text not null,
  category text not null,
  message text not null check (char_length(message) between 5 and 500),
  image_path text,
  created_at timestamptz not null default now()
);

create index if not exists community_posts_created_idx
  on public.community_posts (created_at desc);

alter table public.community_posts enable row level security;

drop policy if exists "Anyone can read community posts" on public.community_posts;
create policy "Anyone can read community posts"
  on public.community_posts for select
  using (true);

drop policy if exists "Users can create their own community posts" on public.community_posts;
create policy "Users can create their own community posts"
  on public.community_posts for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own community posts" on public.community_posts;
create policy "Users can delete their own community posts"
  on public.community_posts for delete to authenticated
  using (auth.uid() = user_id);

grant select (id, name, barangay, category, message, image_path, created_at)
  on public.community_posts to anon, authenticated;
grant insert (user_id, name, barangay, category, message, image_path)
  on public.community_posts to authenticated;
grant usage, select on sequence public.community_posts_id_seq to authenticated;

drop function if exists public.get_community_posts();
create function public.get_community_posts()
returns table (
  id bigint,
  name text,
  barangay text,
  category text,
  message text,
  image_path text,
  created_at timestamptz,
  owner_id uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.name,
    p.barangay,
    p.category,
    p.message,
    p.image_path,
    p.created_at,
    case when p.user_id = (select auth.uid()) then p.user_id else null end as owner_id
  from public.community_posts as p
  order by p.created_at desc;
$$;

revoke all on function public.get_community_posts() from public, anon, authenticated;
grant execute on function public.get_community_posts() to anon, authenticated;

create or replace function public.delete_community_post(p_post_id bigint)
returns table (image_path text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_image_path text;
begin
  if v_user_id is null then
    raise exception 'Sign in is required to delete a post.';
  end if;

  delete from public.community_posts as p
  where p.id = p_post_id and p.user_id = v_user_id
  returning p.image_path into v_image_path;
  if not found then
    raise exception 'Post not found or you do not have permission to delete it.';
  end if;

  return query select v_image_path;
end;
$$;

revoke all on function public.delete_community_post(bigint) from public, anon, authenticated;
grant execute on function public.delete_community_post(bigint) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-post-images',
  'community-post-images',
  true,
  1048576,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view community post images" on storage.objects;
create policy "Anyone can view community post images"
  on storage.objects for select
  using (bucket_id = 'community-post-images');

drop policy if exists "Users can upload their own community post images" on storage.objects;
create policy "Users can upload their own community post images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'community-post-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete their own community post images" on storage.objects;
create policy "Users can delete their own community post images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'community-post-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create table if not exists public.content_likes (
  user_id uuid not null references auth.users (id) on delete cascade,
  content_type text not null check (content_type in ('news', 'event', 'post')),
  content_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, content_type, content_id)
);

create index if not exists content_likes_content_idx
  on public.content_likes (content_type, content_id);

alter table public.content_likes enable row level security;

drop policy if exists "Anyone can read likes" on public.content_likes;
drop policy if exists "Users can read their own likes" on public.content_likes;
create policy "Users can read their own likes"
  on public.content_likes for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can like as themselves" on public.content_likes;
create policy "Users can like as themselves"
  on public.content_likes for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own likes" on public.content_likes;
create policy "Users can remove their own likes"
  on public.content_likes for delete to authenticated
  using (auth.uid() = user_id);

revoke select on public.content_likes from anon, authenticated;
grant select (user_id, content_type, content_id) on public.content_likes to authenticated;
grant insert (user_id, content_type, content_id) on public.content_likes to authenticated;
grant delete on public.content_likes to authenticated;

create or replace function public.get_content_like_summary(
  p_content_type text,
  p_content_id text
)
returns table (like_count bigint, liked boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select
    count(*) as like_count,
    coalesce(bool_or(user_id = (select auth.uid())), false) as liked
  from public.content_likes
  where content_type = p_content_type
    and content_id = p_content_id;
$$;

revoke all on function public.get_content_like_summary(text, text) from public, anon, authenticated;
grant execute on function public.get_content_like_summary(text, text) to anon, authenticated;

create table if not exists public.content_comments (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  content_type text not null check (content_type in ('news', 'event', 'post')),
  content_id text not null,
  body text not null check (char_length(body) between 1 and 500),
  parent_comment_id bigint references public.content_comments (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.content_comments
  add column if not exists parent_comment_id bigint references public.content_comments (id) on delete cascade;

alter table public.content_comments
  drop constraint if exists content_comments_content_type_check;
alter table public.content_comments
  add constraint content_comments_content_type_check
  check (content_type in ('news', 'event', 'post'));

create index if not exists content_comments_content_idx
  on public.content_comments (content_type, content_id, created_at desc);

alter table public.content_comments enable row level security;

drop policy if exists "Anyone can read comments" on public.content_comments;
create policy "Anyone can read comments"
  on public.content_comments for select
  using (true);

drop policy if exists "Users can comment as themselves" on public.content_comments;
create policy "Users can comment as themselves"
  on public.content_comments for insert to authenticated
  with check (auth.uid() = user_id);

revoke select on public.content_comments from anon, authenticated;
grant select (id, content_type, content_id, body, created_at) on public.content_comments to anon, authenticated;
revoke insert on public.content_comments from anon, authenticated;
revoke usage, select on sequence public.content_comments_id_seq from anon, authenticated;

create table if not exists public.comment_votes (
  comment_id bigint not null references public.content_comments (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  vote smallint not null check (vote in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create index if not exists comment_votes_comment_idx
  on public.comment_votes (comment_id, vote);

alter table public.comment_votes enable row level security;
revoke all on public.comment_votes from anon, authenticated;

drop function if exists public.get_content_comments(text, text);
create or replace function public.get_content_comments(
  p_content_type text,
  p_content_id text
)
returns table (
  id bigint,
  body text,
  created_at timestamptz,
  parent_comment_id bigint,
  author_email text,
  like_count bigint,
  downlike_count bigint,
  user_vote smallint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id,
    c.body,
    c.created_at,
    c.parent_comment_id,
    u.email::text as author_email,
    (select count(*) from public.comment_votes as v where v.comment_id = c.id and v.vote = 1) as like_count,
    (select count(*) from public.comment_votes as v where v.comment_id = c.id and v.vote = -1) as downlike_count,
    (select v.vote from public.comment_votes as v where v.comment_id = c.id and v.user_id = (select auth.uid())) as user_vote
  from public.content_comments as c
  join auth.users as u on u.id = c.user_id
  where c.content_type = p_content_type
    and c.content_id = p_content_id
    and (select auth.uid()) is not null
  order by c.created_at desc;
$$;

revoke all on function public.get_content_comments(text, text) from public, anon, authenticated;
grant execute on function public.get_content_comments(text, text) to authenticated;

create or replace function public.add_content_comment(
  p_content_type text,
  p_content_id text,
  p_body text,
  p_parent_comment_id bigint default null
)
returns table (id bigint, body text, created_at timestamptz, parent_comment_id bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_comment public.content_comments%rowtype;
begin
  if v_user_id is null then
    raise exception 'Sign in is required to comment.';
  end if;
  if p_content_type is null or p_content_type not in ('news', 'event', 'post')
    or p_content_id is null or length(trim(p_content_id)) = 0 then
    raise exception 'Invalid comment target.';
  end if;
  if p_content_type = 'post' then
    if p_content_id !~ '^[0-9]+$' then
      raise exception 'Invalid community post.';
    end if;
    if not exists (
      select 1 from public.community_posts as p where p.id = p_content_id::bigint
    ) then
      raise exception 'Community post not found.';
    end if;
  end if;
  if p_body is null or length(trim(p_body)) not between 1 and 500 then
    raise exception 'Comments and replies must be between 1 and 500 characters.';
  end if;
  if p_parent_comment_id is not null and not exists (
    select 1
    from public.content_comments as parent
    where parent.id = p_parent_comment_id
      and parent.content_type = p_content_type
      and parent.content_id = p_content_id
      and parent.parent_comment_id is null
  ) then
    raise exception 'Replies must be attached to a top-level comment on the same item.';
  end if;

  insert into public.content_comments (user_id, content_type, content_id, body, parent_comment_id)
  values (v_user_id, p_content_type, p_content_id, trim(p_body), p_parent_comment_id)
  returning * into v_comment;

  return query select v_comment.id, v_comment.body, v_comment.created_at, v_comment.parent_comment_id;
end;
$$;

revoke all on function public.add_content_comment(text, text, text, bigint) from public, anon, authenticated;
grant execute on function public.add_content_comment(text, text, text, bigint) to authenticated;

create or replace function public.toggle_comment_vote(
  p_comment_id bigint,
  p_vote smallint
)
returns table (like_count bigint, downlike_count bigint, user_vote smallint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_existing_vote smallint;
begin
  if v_user_id is null then
    raise exception 'Sign in is required to vote on comments.';
  end if;
  if p_vote is null or p_vote not in (-1, 1) then
    raise exception 'Vote must be 1 (like) or -1 (downlike).';
  end if;

  select cv.vote into v_existing_vote
  from public.comment_votes as cv
  where cv.comment_id = p_comment_id and cv.user_id = v_user_id;

  if v_existing_vote = p_vote then
    delete from public.comment_votes as cv
    where cv.comment_id = p_comment_id and cv.user_id = v_user_id;
  else
    insert into public.comment_votes (comment_id, user_id, vote)
    values (p_comment_id, v_user_id, p_vote)
    on conflict (comment_id, user_id)
    do update set vote = excluded.vote, created_at = now();
  end if;

  return query
  select
    (select count(*) from public.comment_votes as cv where cv.comment_id = p_comment_id and cv.vote = 1),
    (select count(*) from public.comment_votes as cv where cv.comment_id = p_comment_id and cv.vote = -1),
    (select cv.vote from public.comment_votes as cv where cv.comment_id = p_comment_id and cv.user_id = v_user_id);
end;
$$;

revoke all on function public.toggle_comment_vote(bigint, smallint) from public, anon, authenticated;
grant execute on function public.toggle_comment_vote(bigint, smallint) to authenticated;
