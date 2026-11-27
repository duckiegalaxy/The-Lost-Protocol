begin;

create or replace function public.save_avatar(p_learner_id uuid, p_avatar jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog'
as $function$declare
  lid uuid;
  previous_avatar jsonb;
  saved_avatar jsonb;
begin
  if auth.uid() is null then raise exception 'Sign in required.'; end if;
  if p_avatar is null or jsonb_typeof(p_avatar) <> 'object' then
    raise exception 'Avatar must be an object.';
  end if;
  if pg_column_size(p_avatar) > 4096 then
    raise exception 'Avatar config too large.';
  end if;

  select id, avatar into lid, previous_avatar
    from public.learners
   where id = p_learner_id
     and (user_id = auth.uid() or parent_user_id = auth.uid() or public.is_admin());
  if lid is null then raise exception 'Not allowed.'; end if;

  saved_avatar := jsonb_build_object(
    'animal', left(coalesce(p_avatar->>'animal', previous_avatar->>'animal', 'robot'), 24),
    'b', left(coalesce(p_avatar->>'b', previous_avatar->>'b', 'blue'), 24),
    'gear', left(coalesce(p_avatar->>'gear', previous_avatar->>'gear', 'none'), 24),
    'hat', left(coalesce(p_avatar->>'hat', previous_avatar->>'hat', 'none'), 24),
    'face', left(coalesce(p_avatar->>'face', previous_avatar->>'face', 'std'), 24),
    'speech', left(coalesce(p_avatar->>'speech', previous_avatar->>'speech', ''), 24),
    'pet', left(coalesce(p_avatar->>'pet', previous_avatar->>'pet', 'none'), 24),
    'anim', left(coalesce(p_avatar->>'anim', previous_avatar->>'anim', 'idle'), 24),
    'pal', case
      when jsonb_typeof(p_avatar->'pal') = 'array'
       and jsonb_array_length(p_avatar->'pal') = 3
       and not exists (
         select 1 from jsonb_array_elements(p_avatar->'pal') colour
          where jsonb_typeof(colour) <> 'string'
             or colour #>> '{}' !~ '^#[0-9a-fA-F]{6}$'
       )
      then p_avatar->'pal'
      else previous_avatar->'pal'
    end,
    'look', case
      when jsonb_typeof(p_avatar->'look') = 'object' then p_avatar->'look'
      when jsonb_typeof(previous_avatar->'look') = 'object' then previous_avatar->'look'
      else '{}'::jsonb
    end,
    'updatedAt', floor(extract(epoch from clock_timestamp()) * 1000)::bigint
  );

  update public.learners set avatar = saved_avatar where id = lid;
  return saved_avatar;
end;
$function$;

revoke execute on function public.save_avatar(uuid, jsonb) from public;
grant execute on function public.save_avatar(uuid, jsonb) to authenticated;

commit;
