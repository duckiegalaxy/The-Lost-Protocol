begin;

drop view if exists public.public_coop_leaderboard cascade;

do $$declare
  obj record;
begin


  for obj in
    select p.oid::regprocedure as signature
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and position('coop' in p.proname) > 0
  loop
    execute 'drop function if exists ' || obj.signature || ' cascade';
  end loop;
end
$$;

drop table if exists
  public.coop_spectators,
  public.coop_queue,
  public.coop_invites,
  public.coop_matches,
  public.coop_leaderboard_public,
  public.coop_rooms,
  public.coop_challenges
  cascade;

commit;
