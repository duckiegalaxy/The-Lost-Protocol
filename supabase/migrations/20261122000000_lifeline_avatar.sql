
alter table public.learners
  add column if not exists avatar jsonb not null default '{}'::jsonb,
  add column if not exists lifeline int,
  add column if not exists lifeline_max int,
  add column if not exists lifeline_day text;

alter table public.leaderboard_public
  add column if not exists avatar jsonb;

grant select (avatar) on table public.leaderboard_public to anon;
grant select (avatar) on table public.leaderboard_public to authenticated;


update public.learners set
  lifeline_max = case assigned_path
    when 'g16' then 7 when 'g710' then 5 when 'g1112' then 4 else 3 end,
  lifeline = case assigned_path
    when 'g16' then 7 when 'g710' then 5 when 'g1112' then 4 else 3 end,
  lifeline_day = to_char(now() at time zone 'utc', 'YYYY-MM-DD')
where lifeline is null;


update public.leaderboard_public lp
set avatar = l.avatar
from public.learners l
where lp.learner_id = l.id and lp.avatar is null;


create or replace function public.sync_leaderboard_public_player()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'pg_catalog', 'public'
as $function$
begin
  if tg_op = 'UPDATE' then
    update public.leaderboard_public
    set player_id = new.player_id, avatar = new.avatar
    where learner_id = new.id;
    return new;
  end if;
  if tg_op = 'DELETE' then
    delete from public.leaderboard_public where learner_id = old.id;
    return old;
  end if;
  return new;
end;
$function$;


create or replace function public.sync_leaderboard_public_entry()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'pg_catalog', 'public'
as $function$
begin
  if tg_op = 'DELETE' then
    delete from public.leaderboard_public where id = old.id;
    return old;
  end if;

  if tg_op = 'UPDATE' and old.id <> new.id then
    delete from public.leaderboard_public where id = old.id;
  end if;

  insert into public.leaderboard_public (
    id, learner_id, display_name, learning_path, game_diff,
    total_score, total_stars, chapters_cleared, updated_at,
    player_id, badges, is_test, avatar
  )
  select
    e.id, e.learner_id, e.display_name, e.learning_path, e.game_diff,
    e.total_score, e.total_stars, e.chapters_cleared, e.updated_at,
    l.player_id,
    coalesce((
      select case when jsonb_typeof(pr.badges) = 'array'
                  then jsonb_array_length(pr.badges) else 0 end
      from public.progress_records pr
      where pr.learner_id = e.learner_id
        and pr.learning_path = e.learning_path
        and pr.game_diff = e.game_diff
      limit 1
    ), 0),
    coalesce(e.is_test, false),
    l.avatar
  from public.leaderboard_entries e
  join public.learners l on l.id = e.learner_id
  where e.id = new.id
  on conflict (id) do update set
    learner_id = excluded.learner_id,
    display_name = excluded.display_name,
    learning_path = excluded.learning_path,
    game_diff = excluded.game_diff,
    total_score = excluded.total_score,
    total_stars = excluded.total_stars,
    chapters_cleared = excluded.chapters_cleared,
    updated_at = excluded.updated_at,
    player_id = excluded.player_id,
    badges = excluded.badges,
    is_test = excluded.is_test,
    avatar = excluded.avatar;

  if not exists (
    select 1 from public.leaderboard_entries e
    join public.learners l on l.id = e.learner_id
    where e.id = new.id
  ) then
    delete from public.leaderboard_public where id = new.id;
  end if;

  return new;
end;
$function$;


create or replace view public.public_leaderboard with (security_invoker = true) as
  select id, display_name, learning_path, game_diff, total_score, total_stars,
         chapters_cleared, updated_at, player_id, badges, learner_id, avatar
    from leaderboard_public
   where is_test = false;




create or replace function public.save_avatar(p_learner_id uuid, p_avatar jsonb)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  lid uuid;
  av jsonb;
begin
  if auth.uid() is null then raise exception 'Sign in required.'; end if;
  if p_avatar is null or jsonb_typeof(p_avatar) <> 'object' then
    raise exception 'Avatar must be an object.';
  end if;
  if pg_column_size(p_avatar) > 4096 then
    raise exception 'Avatar config too large.';
  end if;
  select id into lid from public.learners
   where id = p_learner_id
     and (user_id = auth.uid() or parent_user_id = auth.uid() or public.is_admin());
  if lid is null then raise exception 'Not allowed.'; end if;


  av := jsonb_build_object(
    'b',      left(coalesce(p_avatar->>'b', 'blue'), 24),
    'hat',    left(coalesce(p_avatar->>'hat', 'none'), 24),
    'face',   left(coalesce(p_avatar->>'face', 'std'), 24),
    'speech', left(coalesce(p_avatar->>'speech', ''), 24),
    'anim',   left(coalesce(p_avatar->>'anim', 'idle'), 24),
    'updatedAt', floor(extract(epoch from clock_timestamp()) * 1000)::bigint
  );
  update public.learners set avatar = av where id = lid;
  return av;
end;
$function$;




create or replace function public.player_lifeline(p_learner_id uuid)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare r record;
begin
  if auth.uid() is null then raise exception 'Sign in required.'; end if;
  select id, assigned_path, lifeline, lifeline_max, lifeline_day
    into r from public.learners
   where id = p_learner_id
     and (user_id = auth.uid() or parent_user_id = auth.uid() or public.is_admin());
  if r.id is null then raise exception 'Not allowed.'; end if;
  return jsonb_build_object(
    'learner_id', r.id,
    'path', r.assigned_path,
    'left', coalesce(r.lifeline, 0),
    'max', coalesce(r.lifeline_max, 3),
    'day', r.lifeline_day
  );
end;
$function$;




create or replace function public.player_drain_lifeline(p_learner_id uuid)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  r record;
  today_str text := to_char(now() at time zone 'utc', 'YYYY-MM-DD');
begin
  if auth.uid() is null then raise exception 'Sign in required.'; end if;
  update public.learners
     set lifeline = greatest(0,
           case
             when lifeline_day is distinct from today_str
             then coalesce(lifeline_max, case assigned_path when 'g16' then 7 when 'g710' then 5 when 'g1112' then 4 else 3 end) - 1
             else coalesce(lifeline, 0) - 1
           end),
         lifeline_day = today_str
   where id = p_learner_id
     and (user_id = auth.uid() or parent_user_id = auth.uid())
  returning id, assigned_path, lifeline, lifeline_max, lifeline_day into r;
  if r.id is null then
    return public.player_lifeline(p_learner_id);
  end if;
  return jsonb_build_object(
    'learner_id', r.id, 'path', r.assigned_path,
    'left', r.lifeline, 'max', r.lifeline_max, 'day', r.lifeline_day
  );
end;
$function$;




create or replace function public.admin_lifelines()
 returns table(learner_id uuid, player_id text, name text, path text,
               left int, max int, day text)
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;
  return query
    select l.id, l.player_id, l.name, l.assigned_path,
           coalesce(l.lifeline, 0), coalesce(l.lifeline_max, 3), l.lifeline_day
      from public.learners l
     where not l.is_test
     order by l.name;
end;
$function$;




create or replace function public.admin_refresh_lifeline(p_learner_id uuid)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare r record;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;
  update public.learners
     set lifeline = coalesce(lifeline_max,
           case assigned_path when 'g16' then 7 when 'g710' then 5
                               when 'g1112' then 4 else 3 end),
         lifeline_day = to_char(now() at time zone 'utc', 'YYYY-MM-DD')
   where id = p_learner_id
  returning id, assigned_path, lifeline, lifeline_max, lifeline_day into r;
  if r.id is null then raise exception 'Learner not found.'; end if;
  return jsonb_build_object(
    'learner_id', r.id, 'path', r.assigned_path,
    'left', r.lifeline, 'max', r.lifeline_max, 'day', r.lifeline_day
  );
end;
$function$;

grant execute on function public.save_avatar(uuid, jsonb) to authenticated;
grant execute on function public.player_lifeline(uuid) to authenticated;
grant execute on function public.player_drain_lifeline(uuid) to authenticated;
grant execute on function public.admin_lifelines() to authenticated;
grant execute on function public.admin_refresh_lifeline(uuid) to authenticated;
