-- =============================================================================
-- THE LOST PROTOCOL — one-time sign-in codes for learner accounts
-- A parent or educator asks the "learner-qr" edge function for a code. The
-- function returns the raw code once; only its SHA-256 hash is stored here.
-- The code is short-lived (10 minutes), single-use, and tied to one learner.
-- Scanning the QR opens auth.html, which redeems the code through the same
-- function. The function then issues a Supabase-admin magic link for that one
-- learner account; the service key never leaves the function.
--
-- Browser roles get no access at all: no grants and no policies. The function
-- reads and writes this table with the service role only.
-- =============================================================================

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

-- Creating a code first removes this learner's unused codes, so at most one
-- open code exists per learner. This partial index makes that lookup cheap.
create index if not exists learner_signin_tokens_open_idx
  on public.learner_signin_tokens (learner_id)
  where used_at is null;

-- The per-parent hourly limit counts rows created in the last hour.
create index if not exists learner_signin_tokens_parent_idx
  on public.learner_signin_tokens (parent_user_id, created_at desc);

alter table public.learner_signin_tokens enable row level security;

revoke all on table public.learner_signin_tokens from public, anon, authenticated;
-- update is included because PostgREST implements upsert as INSERT .. ON CONFLICT DO UPDATE
grant select, insert, update, delete on table public.learner_signin_tokens to service_role;

comment on table public.learner_signin_tokens is
  'Single-use learner sign-in codes. Stores only the SHA-256 hash of each code. Service role only.';
