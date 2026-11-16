-- =============================================================================
-- THE LOST PROTOCOL — learner login allowlist
-- Explorer accounts sign in with a Player ID at @learner.lostprotocol.app.
-- That domain is reserved: visitors may not self-register with it.
--
-- The original guard only accepted rows whose app_metadata already contained
-- tlp_learner = '1'. GoTrue does not do that on the INSERT though: admin
-- createUser first inserts auth.users with just {provider, providers} and
-- applies the caller's app_metadata in a follow-up UPDATE, so every
-- educator-created learner was rejected with "This email domain is reserved."
--
-- This table closes that gap. learner-admin (service role only) writes the
-- exact address it is about to create, the guard accepts that one address,
-- and the function deletes the row again afterwards. Anonymous and signed-in
-- browser roles have no privileges on the table, so the domain stays reserved.
-- =============================================================================

create table if not exists public.learner_login_allowlist (
  email      text primary key,
  created_at timestamptz not null default now()
);

alter table public.learner_login_allowlist enable row level security;

revoke all on table public.learner_login_allowlist from anon, authenticated;
-- update is included because PostgREST implements upsert as INSERT .. ON CONFLICT DO UPDATE
grant select, insert, update, delete on table public.learner_login_allowlist to service_role;

-- The guard now accepts either the app_metadata marker (kept for any flow that
-- can set it on insert) or a one-time allowlist entry made by the service role.
create or replace function public.guard_learner_login_domain()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if lower(coalesce(new.email, '')) like '%@learner.lostprotocol.app'
     and coalesce(new.raw_app_meta_data ->> 'tlp_learner', '') <> '1'
     and not exists (
       select 1 from public.learner_login_allowlist a
       where a.email = lower(new.email)
     )
  then
    raise exception 'This email domain is reserved.';
  end if;
  return new;
end
$function$;
