-- Arc Terminal — Supabase schema
-- Run in Supabase: Database → SQL Editor → New query.
-- Apply in order: tables first, then the increment_xp function.
-- All tables use Row Level Security (RLS). Server-side API routes use the
-- service role key which bypasses RLS automatically. Public read policies
-- are added only where needed for leaderboard / project browsing.

-- ─────────────────────────────────────────────────────────────────────
-- USERS
-- One row per wallet. wallet_address is always lowercased before insert.
-- display_name is null until the user completes onboarding.
-- ─────────────────────────────────────────────────────────────────────
create table if not exists users (
  wallet_address text        primary key,
  display_name   text        unique,           -- null = onboarding incomplete
  xp             integer     not null default 0,
  level          integer     not null default 1,
  -- jsonb array of earned badge strings, e.g. ["bronze","silver"]
  nft_badges     jsonb       not null default '[]'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table users enable row level security;

-- Public reads are allowed; wallet_address is NEVER returned from public API routes
-- (enforced in the API layer, not RLS, because the leaderboard needs xp/level/name).
create policy "Public read on users"
  on users for select using (true);
-- Service role key bypasses RLS — no additional write policy needed.


-- ─────────────────────────────────────────────────────────────────────
-- XP EVENTS (audit ledger)
-- Every XP award is recorded here. Used by /api/xp/award and future analytics.
-- ─────────────────────────────────────────────────────────────────────
create table if not exists xp_events (
  id             uuid        primary key default gen_random_uuid(),
  wallet_address text        not null references users(wallet_address) on delete cascade,
  amount         integer     not null check (amount > 0 and amount <= 1000),
  reason         text        not null,   -- e.g. "task:aave_supply", "quiz_complete"
  created_at     timestamptz not null default now()
);

create index if not exists xp_events_wallet_idx on xp_events (wallet_address);

alter table xp_events enable row level security;
-- Service role only — no public read on the XP ledger.


-- ─────────────────────────────────────────────────────────────────────
-- TASK COMPLETIONS
-- One row per (wallet, task). Unique constraint is the double-claim guard.
-- Used by /api/tasks/verify and /api/user/tasks.
-- ─────────────────────────────────────────────────────────────────────
create table if not exists task_completions (
  id             uuid        primary key default gen_random_uuid(),
  wallet_address text        not null references users(wallet_address) on delete cascade,
  task_id        text        not null,
  project_slug   text        not null,
  xp_awarded     integer     not null default 0,
  completed_at   timestamptz not null default now(),
  -- DB-level double-claim guard — matches application-level check in /api/tasks/verify
  unique (wallet_address, task_id)
);

create index if not exists task_completions_wallet_idx on task_completions (wallet_address);

alter table task_completions enable row level security;
-- Service role only.


-- ─────────────────────────────────────────────────────────────────────
-- QUIZ COMPLETIONS
-- One row per wallet. XP awarded exactly once per wallet.
-- Used by /api/quiz/submit.
-- ─────────────────────────────────────────────────────────────────────
create table if not exists quiz_completions (
  id             uuid        primary key default gen_random_uuid(),
  wallet_address text        not null references users(wallet_address) on delete cascade,
  completed_at   timestamptz not null default now(),
  xp_awarded     integer     not null default 0,
  -- One XP award per wallet — enforced at DB level and in /api/quiz/submit
  unique (wallet_address)
);

alter table quiz_completions enable row level security;
-- Service role only.


-- ─────────────────────────────────────────────────────────────────────
-- PROJECTS
-- Admin-managed. Listed via /api/projects.
-- ─────────────────────────────────────────────────────────────────────
create table if not exists projects (
  slug             text        primary key,
  name             text        not null,
  description      text        not null,
  long_description text        not null default '',
  -- "verified" = official Arc ecosystem project; "community" = community-submitted
  status           text        not null check (status in ('verified', 'community')),
  category         text        not null,
  website          text        not null default '',
  x_handle         text        not null default '',
  logo_placeholder text        not null default '',
  accent_color     text        not null default '#7B5EA7',
  total_xp         integer     not null default 0,
  participants     integer     not null default 0,
  created_at       timestamptz not null default now()
);

alter table projects enable row level security;

-- Public read — anyone can browse the project directory without a wallet.
create policy "Public read on projects"
  on projects for select using (true);


-- ─────────────────────────────────────────────────────────────────────
-- PROJECT TASKS
-- Each row is a task belonging to a project.
-- Used by /api/projects/[slug] and /api/tasks/verify.
-- ─────────────────────────────────────────────────────────────────────
create table if not exists project_tasks (
  id           text        primary key,          -- e.g. "aave_supply"
  project_slug text        not null references projects(slug) on delete cascade,
  title        text        not null,
  description  text        not null,
  xp_reward    integer     not null check (xp_reward > 0),
  task_type    text        not null check (task_type in ('onchain', 'social', 'educational')),
  cta_label    text        not null,
  cta_href     text        not null,
  sort_order   integer     not null default 0
);

create index if not exists project_tasks_project_idx on project_tasks (project_slug);

alter table project_tasks enable row level security;

-- Public read — task details are public.
create policy "Public read on project_tasks"
  on project_tasks for select using (true);


-- ─────────────────────────────────────────────────────────────────────
-- increment_xp(p_wallet text, p_amount integer)
--
-- Atomically:
--   1. Inserts a users row if the wallet is seen for the first time.
--   2. Adds p_amount to users.xp.
--   3. Recomputes users.level from fixed thresholds [0, 50, 200, 500, 1000].
--
-- Called by: /api/tasks/verify, /api/quiz/submit, /api/xp/award
--
-- SECURITY DEFINER — runs as the postgres superuser, bypassing RLS.
-- This keeps XP updates atomic and race-condition-free.
-- ─────────────────────────────────────────────────────────────────────
create or replace function increment_xp(p_wallet text, p_amount integer)
returns void
language plpgsql
security definer
as $$
declare
  v_new_xp    integer;
  v_new_level integer;
begin
  -- Ensure the user row exists (wallet may earn XP before setting a display name)
  insert into users (wallet_address)
  values (p_wallet)
  on conflict (wallet_address) do nothing;

  -- Atomically increment XP and capture the new total
  update users
  set    xp         = xp + p_amount,
         updated_at = now()
  where  wallet_address = p_wallet
  returning xp into v_new_xp;

  -- Derive level from canonical XP thresholds (mirrors xp-utils.ts)
  v_new_level := case
    when v_new_xp >= 1000 then 5
    when v_new_xp >= 500  then 4
    when v_new_xp >= 200  then 3
    when v_new_xp >= 50   then 2
    else 1
  end;

  -- Persist the updated level
  update users
  set    level = v_new_level
  where  wallet_address = p_wallet;
end;
$$;
