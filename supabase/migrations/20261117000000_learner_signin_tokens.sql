create table if not exists public.learner_signin_tokens (
  token_hash      text primary key,
  learner_id      uuid not null references public.learners(id) on delete cascade,
  learner_user_id uuid not null references auth.users(id) on delete cascade,
  parent_user_id  uuid not null references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null,
  used_at         timestamptz,
  constraint learner_signin_tokens_expiry_check check (expires_at > created_at)
);



create index if not exists learner_signin_tokens_open_idx
  on public.learner_signin_tokens (learner_id)
  where used_at is null;


create index if not exists learner_signin_tokens_parent_idx
  on public.learner_signin_tokens (parent_user_id, created_at desc);

alter table public.learner_signin_tokens enable row level security;

revoke all on table public.learner_signin_tokens from public, anon, authenticated;

grant select, insert, update, delete on table public.learner_signin_tokens to service_role;

comment on table public.learner_signin_tokens is
  'Single-use learner sign-in codes. Stores only the SHA-256 hash of each code. Service role only.';
