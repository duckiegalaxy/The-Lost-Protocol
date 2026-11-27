begin;

create table if not exists public.friend_requests (
  id uuid not null default gen_random_uuid(),
  requester_id uuid not null references public.learners(id) on delete cascade,
  recipient_id uuid not null references public.learners(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friend_requests_pkey primary key (id),
  constraint friend_requests_distinct_learners_check check (requester_id <> recipient_id),
  constraint friend_requests_status_check check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  constraint friend_requests_response_check check (
    (status = 'pending' and responded_at is null)
    or (status in ('accepted', 'declined', 'cancelled') and responded_at is not null)
  )
);

create unique index if not exists friend_requests_pending_pair_uq
  on public.friend_requests (
    least(requester_id, recipient_id),
    greatest(requester_id, recipient_id)
  )
  where status = 'pending';

create index if not exists friend_requests_requester_created_idx
  on public.friend_requests (requester_id, created_at desc);

create index if not exists friend_requests_recipient_pending_idx
  on public.friend_requests (recipient_id, created_at desc)
  where status = 'pending';

create table if not exists public.friendships (
  user_id uuid not null references public.learners(id) on delete cascade,
  friend_id uuid not null references public.learners(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint friendships_pkey primary key (user_id, friend_id),
  constraint friendships_distinct_learners_check check (user_id <> friend_id)
);

create index if not exists friendships_friend_id_idx
  on public.friendships (friend_id);

create table if not exists public.friend_notifications (
  id uuid not null default gen_random_uuid(),
  learner_id uuid not null references public.learners(id) on delete cascade,
  actor_id uuid references public.learners(id) on delete set null,
  kind text not null,
  title text not null,
  body text not null,
  request_id uuid references public.friend_requests(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint friend_notifications_pkey primary key (id),
  constraint friend_notifications_kind_check check (
    kind in ('friend_request', 'friend_accepted', 'friend_declined', 'friend_removed')
  ),
  constraint friend_notifications_title_length_check check (char_length(title) between 1 and 120),
  constraint friend_notifications_body_length_check check (char_length(body) between 1 and 500)
);

create index if not exists friend_notifications_learner_created_idx
  on public.friend_notifications (learner_id, created_at desc, id desc);

alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;
alter table public.friend_notifications enable row level security;
alter table public.friend_requests replica identity full;
alter table public.friendships replica identity full;
alter table public.friend_notifications replica identity full;

revoke all on table public.friend_requests from public, anon, authenticated;
revoke all on table public.friendships from public, anon, authenticated;
revoke all on table public.friend_notifications from public, anon, authenticated;

grant select on table public.friend_requests to authenticated;
grant select on table public.friendships to authenticated;
grant select on table public.friend_notifications to authenticated;

drop policy if exists friend_requests_select on public.friend_requests;
create policy friend_requests_select on public.friend_requests
  for select to authenticated
  using (
    auth.uid() is not null
    and exists (
      select 1
      from public.learners caller
      where caller.user_id = auth.uid()
        and (caller.id = friend_requests.requester_id or caller.id = friend_requests.recipient_id)
    )
  );

drop policy if exists friendships_select on public.friendships;
create policy friendships_select on public.friendships
  for select to authenticated
  using (
    auth.uid() is not null
    and exists (
      select 1
      from public.learners caller
      where caller.user_id = auth.uid()
        and (caller.id = friendships.user_id or caller.id = friendships.friend_id)
    )
  );

drop policy if exists friend_notifications_select on public.friend_notifications;
create policy friend_notifications_select on public.friend_notifications
  for select to authenticated
  using (
    auth.uid() is not null
    and exists (
      select 1
      from public.learners caller
      where caller.user_id = auth.uid()
        and caller.id = friend_notifications.learner_id
    )
  );

do $publication$
declare
  v_table text;
begin
  if not exists (
    select 1
    from pg_catalog.pg_publication
    where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;
  for v_table in
    select unnest(array['friend_requests', 'friendships', 'friend_notifications']::text[])
  loop
    if not exists (
      select 1
      from pg_catalog.pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = v_table
    ) then
      execute format(
        'alter publication %I add table public.%I',
        'supabase_realtime',
        v_table
      );
    end if;
  end loop;
end;
$publication$;

drop function if exists public.send_friend_request(text);
drop function if exists public.respond_friend_request(uuid, boolean);
drop function if exists public.cancel_friend_request(uuid);
drop function if exists public.remove_friend(text);
drop function if exists public.list_friends();
drop function if exists public.list_friend_requests();
drop function if exists public.list_friend_notifications(integer);
drop function if exists public.mark_friend_notifications_read();

create or replace function public.send_friend_request(p_learner_id uuid, p_player_id text)
returns jsonb
language plpgsql
security definer
set search_path = 'pg_catalog'
as $function$
declare
  v_me uuid;
  v_recipient_id uuid;
  v_me_name text;
  v_player_id text;
  v_request_id uuid;
  v_recipient_name text;
  v_recipient_avatar jsonb;
  v_created_at timestamptz;
  v_day date := (now() at time zone 'utc')::date;
begin
  if auth.uid() is null then
    raise exception 'Sign in required.';
  end if;

  select learner.id into v_me
  from public.learners learner
  join public.profiles profile on profile.id = learner.user_id
  where learner.id = p_learner_id
    and learner.user_id = auth.uid()
    and profile.role = 'learner';

  if v_me is null then
    raise exception 'A learner account is required.';
  end if;

  v_player_id := upper(regexp_replace(coalesce(p_player_id, ''), '[[:space:]]+', '', 'g'));

  if v_player_id = '' then
    raise exception 'Enter a Player ID.';
  end if;

  if char_length(v_player_id) > 32 then
    raise exception 'That Player ID is invalid.';
  end if;

  select id into v_recipient_id
  from public.learners
  where player_id = v_player_id;

  if not found then
    raise exception 'Player not found.';
  end if;

  if v_recipient_id = v_me then
    raise exception 'You cannot send a friend request to yourself.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('tlp-friend-requests:' || v_me::text, 0)
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'tlp-friend-pair:' || least(v_me, v_recipient_id)::text || ':' || greatest(v_me, v_recipient_id)::text,
      0
    )
  );

  perform id
  from public.learners
  where id in (v_me, v_recipient_id)
  order by id
  for update;

  select id into v_recipient_id
  from public.learners
  where id = v_recipient_id;

  if not found then
    raise exception 'Player not found.';
  end if;

  select name into v_me_name
  from public.learners
  where id = v_me
    and user_id = auth.uid();

  if not found then
    raise exception 'A learner account is required.';
  end if;

  if exists (
    select 1
    from public.friendships
    where (user_id = v_me and friend_id = v_recipient_id)
       or (user_id = v_recipient_id and friend_id = v_me)
  ) then
    return jsonb_build_object('status', 'friends');
  end if;

  if exists (
    select 1
    from public.friend_requests
    where requester_id = v_recipient_id
      and recipient_id = v_me
      and status = 'pending'
  ) then
    return jsonb_build_object('status', 'incoming');
  end if;

  if exists (
    select 1
    from public.friend_requests
    where requester_id = v_me
      and recipient_id = v_recipient_id
      and status = 'pending'
  ) then
    return jsonb_build_object('status', 'pending');
  end if;

  if (select count(*) from public.friendships where user_id = v_me) >= 100 then
    raise exception 'You already have 100 friends. Remove a friend before sending more requests.';
  end if;

  if (select count(*) from public.friendships where user_id = v_recipient_id) >= 100 then
    raise exception 'That learner already has 100 friends.';
  end if;

  if (
    select count(*)
    from public.friend_requests
    where requester_id = v_me
      and created_at >= (v_day::timestamp at time zone 'utc')
      and created_at < ((v_day + 1)::timestamp at time zone 'utc')
  ) >= 20 then
    raise exception 'Daily friend request limit reached (20 requests). Try again tomorrow.';
  end if;

  insert into public.friend_requests (requester_id, recipient_id)
  values (v_me, v_recipient_id)
  returning id, created_at into v_request_id, v_created_at;

  select name, avatar into v_recipient_name, v_recipient_avatar
  from public.learners
  where id = v_recipient_id;

  insert into public.friend_notifications (
    learner_id, actor_id, kind, title, body, request_id
  )
  values (
    v_recipient_id,
    v_me,
    'friend_request',
    left(coalesce(v_me_name, 'Learner'), 80) || ' sent you a friend request',
    'Open Friends to accept or decline the request.',
    v_request_id
  );

  return jsonb_build_object(
    'status', 'sent',
    'request_id', v_request_id,
    'learner_id', v_recipient_id,
    'player_id', v_player_id,
    'name', v_recipient_name,
    'avatar', v_recipient_avatar,
    'created_at', v_created_at
  );
end;
$function$;

create or replace function public.respond_friend_request(p_learner_id uuid, p_request_id uuid, p_accept boolean)
returns jsonb
language plpgsql
security definer
set search_path = 'pg_catalog'
as $function$
declare
  v_me uuid;
  v_me_name text;
  v_request public.friend_requests%rowtype;
  v_other_id uuid;
  v_other_player_id text;
  v_other_name text;
  v_other_avatar jsonb;
  v_friendship_exists boolean;
  v_status text;
  v_kind text;
  v_title text;
  v_body text;
begin
  if auth.uid() is null then
    raise exception 'Sign in required.';
  end if;

  select learner.id into v_me
  from public.learners learner
  join public.profiles profile on profile.id = learner.user_id
  where learner.id = p_learner_id
    and learner.user_id = auth.uid()
    and profile.role = 'learner';

  if v_me is null then
    raise exception 'A learner account is required.';
  end if;

  if p_request_id is null then
    raise exception 'Friend request not found.';
  end if;

  if p_accept is null then
    raise exception 'Choose whether to accept the friend request.';
  end if;

  select * into v_request
  from public.friend_requests
  where id = p_request_id;

  if not found then
    raise exception 'Friend request not found.';
  end if;

  if v_request.recipient_id <> v_me then
    raise exception 'Only the recipient can respond to this friend request.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'tlp-friend-pair:' || least(v_request.requester_id, v_request.recipient_id)::text || ':' || greatest(v_request.requester_id, v_request.recipient_id)::text,
      0
    )
  );

  perform id
  from public.learners
  where id in (v_request.requester_id, v_request.recipient_id)
  order by id
  for update;

  select * into v_request
  from public.friend_requests
  where id = p_request_id
    and recipient_id = v_me
  for update;

  if not found then
    raise exception 'Friend request not found or no longer pending.';
  end if;

  v_other_id := v_request.requester_id;

  select id, player_id, name, avatar
  into v_other_id, v_other_player_id, v_other_name, v_other_avatar
  from public.learners
  where id = v_other_id;

  if not found then
    raise exception 'Learner not found.';
  end if;

  if v_request.status <> 'pending' then
    if (v_request.status = 'accepted' and p_accept)
      or (v_request.status = 'declined' and not p_accept) then
      v_friendship_exists := exists (
        select 1
        from public.friendships
        where (user_id = v_me and friend_id = v_other_id)
           or (user_id = v_other_id and friend_id = v_me)
      );

      return jsonb_build_object(
        'status', v_request.status,
        'already_processed', true,
        'friend_exists', v_friendship_exists,
        'learner_id', v_other_id,
        'player_id', v_other_player_id,
        'name', v_other_name,
        'avatar', v_other_avatar
      );
    end if;
    raise exception 'Friend request not found or no longer pending.';
  end if;

  if p_accept then
    if (
      (select count(*) from public.friendships where user_id = v_me) >= 100
      or (select count(*) from public.friendships where user_id = v_other_id) >= 100
    ) then
      raise exception 'Friend limit reached: both learners must have fewer than 100 friends.';
    end if;

    insert into public.friendships (user_id, friend_id)
    values (v_me, v_other_id), (v_other_id, v_me)
    on conflict (user_id, friend_id) do nothing;

    v_status := 'accepted';
    v_kind := 'friend_accepted';
    v_title := ' accepted your friend request';
    v_body := 'You are now friends and can find each other on the Friends board.';
  else
    v_status := 'declined';
    v_kind := 'friend_declined';
    v_title := ' declined your friend request';
    v_body := 'The friend request was declined.';
  end if;

  update public.friend_requests
  set status = v_status,
      responded_at = now()
  where id = p_request_id;

  select name into v_me_name
  from public.learners
  where id = v_me;

  insert into public.friend_notifications (
    learner_id, actor_id, kind, title, body, request_id
  )
  values (
    v_other_id,
    v_me,
    v_kind,
    left(coalesce(v_me_name, 'Learner'), 80) || v_title,
    v_body,
    p_request_id
  );

  return jsonb_build_object(
    'status', v_status,
    'friend_exists', v_status = 'accepted',
    'learner_id', v_other_id,
    'player_id', v_other_player_id,
    'name', v_other_name,
    'avatar', v_other_avatar
  );
end;
$function$;

create or replace function public.cancel_friend_request(p_learner_id uuid, p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = 'pg_catalog'
as $function$
declare
  v_me uuid;
  v_request_id uuid;
  v_requester_id uuid;
  v_recipient_id uuid;
  v_status text;
begin
  if auth.uid() is null then
    raise exception 'Sign in required.';
  end if;

  select learner.id into v_me
  from public.learners learner
  join public.profiles profile on profile.id = learner.user_id
  where learner.id = p_learner_id
    and learner.user_id = auth.uid()
    and profile.role = 'learner';

  if v_me is null then
    raise exception 'A learner account is required.';
  end if;

  if p_request_id is null then
    raise exception 'Friend request not found.';
  end if;

  select requester_id, recipient_id, status
  into v_requester_id, v_recipient_id, v_status
  from public.friend_requests
  where id = p_request_id;

  if not found then
    raise exception 'Friend request not found.';
  end if;

  if v_requester_id <> v_me then
    raise exception 'Only the requester can cancel a pending friend request.';
  end if;

  if v_status = 'cancelled' then
    return jsonb_build_object('status', 'cancelled', 'already_processed', true);
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'tlp-friend-pair:' || least(v_requester_id, v_recipient_id)::text || ':' || greatest(v_requester_id, v_recipient_id)::text,
      0
    )
  );

  select id, status into v_request_id, v_status
  from public.friend_requests
  where id = p_request_id
    and requester_id = v_me
  for update;

  if found and v_status = 'pending' then
    update public.friend_requests
    set status = 'cancelled',
        responded_at = now()
    where id = v_request_id;

    return jsonb_build_object('status', 'cancelled');
  end if;

  if found and v_status = 'cancelled' then
    return jsonb_build_object('status', 'cancelled', 'already_processed', true);
  end if;

  raise exception 'Only the requester can cancel a pending friend request.';
end;
$function$;

create or replace function public.remove_friend(p_learner_id uuid, p_player_id text)
returns jsonb
language plpgsql
security definer
set search_path = 'pg_catalog'
as $function$
declare
  v_me uuid;
  v_other_id uuid;
  v_me_name text;
  v_player_id text;
begin
  if auth.uid() is null then
    raise exception 'Sign in required.';
  end if;

  select learner.id into v_me
  from public.learners learner
  join public.profiles profile on profile.id = learner.user_id
  where learner.id = p_learner_id
    and learner.user_id = auth.uid()
    and profile.role = 'learner';

  if v_me is null then
    raise exception 'A learner account is required.';
  end if;

  v_player_id := upper(regexp_replace(coalesce(p_player_id, ''), '[[:space:]]+', '', 'g'));

  if v_player_id = '' then
    raise exception 'Enter a Player ID.';
  end if;

  if char_length(v_player_id) > 32 then
    raise exception 'That Player ID is invalid.';
  end if;

  select id into v_other_id
  from public.learners
  where player_id = v_player_id;

  if not found then
    raise exception 'Player not found.';
  end if;

  if v_other_id = v_me then
    raise exception 'You cannot remove yourself.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'tlp-friend-pair:' || least(v_me, v_other_id)::text || ':' || greatest(v_me, v_other_id)::text,
      0
    )
  );

  perform id
  from public.learners
  where id in (v_me, v_other_id)
  order by id
  for update;

  select id into v_other_id
  from public.learners
  where id = v_other_id;

  if not found then
    raise exception 'Player not found.';
  end if;

  select name into v_me_name
  from public.learners
  where id = v_me
    and user_id = auth.uid();

  if not found then
    raise exception 'A learner account is required.';
  end if;

  if not exists (
    select 1
    from public.friendships
    where (user_id = v_me and friend_id = v_other_id)
       or (user_id = v_other_id and friend_id = v_me)
  ) then
    if exists (
      select 1
      from public.friend_requests
      where status = 'accepted'
        and (
          (requester_id = v_me and recipient_id = v_other_id)
          or (requester_id = v_other_id and recipient_id = v_me)
        )
    ) then
      return jsonb_build_object('status', 'removed', 'already_processed', true);
    end if;
    raise exception 'You are not friends with this player.';
  end if;

  delete from public.friendships
  where (user_id = v_me and friend_id = v_other_id)
     or (user_id = v_other_id and friend_id = v_me);

  delete from public.friend_requests
  where status = 'pending'
    and (
      (requester_id = v_me and recipient_id = v_other_id)
      or (requester_id = v_other_id and recipient_id = v_me)
    );

  insert into public.friend_notifications (
    learner_id, actor_id, kind, title, body
  )
  values (
    v_other_id,
    v_me,
    'friend_removed',
    left(coalesce(v_me_name, 'Learner'), 80) || ' removed you from their friends',
    'The friendship has been removed.'
  );

  return jsonb_build_object('status', 'removed');
end;
$function$;

create or replace function public.list_friends(p_learner_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = 'pg_catalog'
as $function$
declare
  v_me uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in required.';
  end if;

  select learner.id into v_me
  from public.learners learner
  join public.profiles profile on profile.id = learner.user_id
  where learner.id = p_learner_id
    and learner.user_id = auth.uid()
    and profile.role = 'learner';

  if v_me is null then
    raise exception 'A learner account is required.';
  end if;

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'learner_id', learner.id,
        'player_id', learner.player_id,
        'name', learner.name,
        'avatar', learner.avatar,
        'created_at', friendship.created_at
      )
      order by learner.name, learner.player_id
    )
    from public.friendships friendship
    join public.learners learner on learner.id = friendship.friend_id
    where friendship.user_id = v_me
  ), '[]'::jsonb);
end;
$function$;

create or replace function public.list_friend_requests(p_learner_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = 'pg_catalog'
as $function$
declare
  v_me uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in required.';
  end if;

  select learner.id into v_me
  from public.learners learner
  join public.profiles profile on profile.id = learner.user_id
  where learner.id = p_learner_id
    and learner.user_id = auth.uid()
    and profile.role = 'learner';

  if v_me is null then
    raise exception 'A learner account is required.';
  end if;

  return jsonb_build_object(
    'incoming', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'request_id', request.id,
          'status', request.status,
          'created_at', request.created_at,
          'learner_id', learner.id,
          'player_id', learner.player_id,
          'name', learner.name,
          'avatar', learner.avatar
        )
        order by request.created_at desc, request.id desc
      )
      from public.friend_requests request
      join public.learners learner on learner.id = request.requester_id
      where request.recipient_id = v_me
        and request.status = 'pending'
    ), '[]'::jsonb),
    'outgoing', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'request_id', request.id,
          'status', request.status,
          'created_at', request.created_at,
          'learner_id', learner.id,
          'player_id', learner.player_id,
          'name', learner.name,
          'avatar', learner.avatar
        )
        order by request.created_at desc, request.id desc
      )
      from public.friend_requests request
      join public.learners learner on learner.id = request.recipient_id
      where request.requester_id = v_me
        and request.status = 'pending'
    ), '[]'::jsonb)
  );
end;
$function$;

create or replace function public.list_friend_notifications(p_learner_id uuid, p_limit integer default 20)
returns jsonb
language plpgsql
security definer
set search_path = 'pg_catalog'
as $function$
declare
  v_me uuid;
  v_limit integer;
begin
  if auth.uid() is null then
    raise exception 'Sign in required.';
  end if;

  select learner.id into v_me
  from public.learners learner
  join public.profiles profile on profile.id = learner.user_id
  where learner.id = p_learner_id
    and learner.user_id = auth.uid()
    and profile.role = 'learner';

  if v_me is null then
    raise exception 'A learner account is required.';
  end if;

  v_limit := least(50, greatest(1, coalesce(p_limit, 20)));

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', notification.id,
        'actor_id', notification.actor_id,
        'actor_player_id', notification.actor_player_id,
        'actor_name', notification.actor_name,
        'actor_avatar', notification.actor_avatar,
        'kind', notification.kind,
        'title', notification.title,
        'body', notification.body,
        'request_id', notification.request_id,
        'read_at', notification.read_at,
        'created_at', notification.created_at
      )
      order by notification.created_at desc, notification.id desc
    )
    from (
      select notification.*,
             actor.player_id as actor_player_id,
             actor.name as actor_name,
             actor.avatar as actor_avatar
      from public.friend_notifications notification
      left join public.learners actor on actor.id = notification.actor_id
      where notification.learner_id = v_me
      order by notification.created_at desc, notification.id desc
      limit v_limit
    ) notification
  ), '[]'::jsonb);
end;
$function$;

create or replace function public.mark_friend_notifications_read(p_learner_id uuid)
returns integer
language plpgsql
security definer
set search_path = 'pg_catalog'
as $function$
declare
  v_me uuid;
  v_count integer;
begin
  if auth.uid() is null then
    raise exception 'Sign in required.';
  end if;

  select learner.id into v_me
  from public.learners learner
  join public.profiles profile on profile.id = learner.user_id
  where learner.id = p_learner_id
    and learner.user_id = auth.uid()
    and profile.role = 'learner';

  if v_me is null then
    raise exception 'A learner account is required.';
  end if;

  with updated as (
    update public.friend_notifications
    set read_at = now()
    where learner_id = v_me
      and read_at is null
    returning id
  )
  select count(*)::integer into v_count
  from updated;

  return v_count;
end;
$function$;

revoke execute on function public.send_friend_request(uuid, text) from public, anon;
revoke execute on function public.respond_friend_request(uuid, uuid, boolean) from public, anon;
revoke execute on function public.cancel_friend_request(uuid, uuid) from public, anon;
revoke execute on function public.remove_friend(uuid, text) from public, anon;
revoke execute on function public.list_friends(uuid) from public, anon;
revoke execute on function public.list_friend_requests(uuid) from public, anon;
revoke execute on function public.list_friend_notifications(uuid, integer) from public, anon;
revoke execute on function public.mark_friend_notifications_read(uuid) from public, anon;

grant execute on function public.send_friend_request(uuid, text) to authenticated;
grant execute on function public.respond_friend_request(uuid, uuid, boolean) to authenticated;
grant execute on function public.cancel_friend_request(uuid, uuid) to authenticated;
grant execute on function public.remove_friend(uuid, text) to authenticated;
grant execute on function public.list_friends(uuid) to authenticated;
grant execute on function public.list_friend_requests(uuid) to authenticated;
grant execute on function public.list_friend_notifications(uuid, integer) to authenticated;
grant execute on function public.mark_friend_notifications_read(uuid) to authenticated;

commit;
