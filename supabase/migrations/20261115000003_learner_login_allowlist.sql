create table if not exists public.learner_login_allowlist (
  email      text primary key,
  created_at timestamptz not null default now()
);

alter table public.learner_login_allowlist enable row level security;

revoke all on table public.learner_login_allowlist from anon, authenticated;

grant select, insert, update, delete on table public.learner_login_allowlist to service_role;



create or replace function public.guard_learner_login_domain()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$begin
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
