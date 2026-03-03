-- ═══════════════════════════════════════════════════════════
-- LeveeUp Database Schema
-- ═══════════════════════════════════════════════════════════

-- Users table (extends auth.users with app-specific data)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('student', 'parent', 'teacher')),
  display_name text not null,
  created_at timestamptz not null default now()
);

-- Students table (game profiles)
create table public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  parent_id uuid references public.users(id) on delete set null,
  teacher_id uuid references public.users(id) on delete set null,
  display_name text not null,
  selected_theme text not null default 'cryptid',
  avatar_config jsonb not null default '{"equippedItems":[]}',
  current_unit text,
  total_xp integer not null default 0,
  game_state jsonb,
  owned_items text[] not null default '{}',
  activity_log jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- Progress table (per-standard analytical data)
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  standard_id text not null,
  current_tier text not null default 'introductory',
  attempts integer not null default 0,
  correct_count integer not null default 0,
  last_attempted timestamptz,
  unique(student_id, standard_id)
);

-- Answers table (individual answer records)
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  question_id text not null,
  standard_id text not null,
  is_correct boolean not null,
  time_spent_seconds integer not null default 0,
  tier_at_time text not null,
  created_at timestamptz not null default now()
);

-- Theme progress table (investigation/narrative state)
create table public.theme_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  theme_id text not null,
  current_chapter text,
  clues_found integer not null default 0,
  discoveries_made jsonb not null default '[]',
  milestones jsonb not null default '[]',
  unique(student_id, theme_id)
);

-- Shop inventory table (items available for purchase)
create table public.shop_inventory (
  id uuid primary key default gen_random_uuid(),
  theme_id text not null,
  item_name text not null,
  item_type text not null,
  cost_xp integer not null,
  asset_reference text not null
);

-- Student inventory table (purchased items)
create table public.student_inventory (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  item_id uuid not null references public.shop_inventory(id) on delete cascade,
  equipped boolean not null default false,
  purchased_at timestamptz not null default now(),
  unique(student_id, item_id)
);

-- Daily activity table (aggregated daily metrics)
create table public.daily_activity (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  date date not null,
  sessions_count integer not null default 0,
  total_time_seconds integer not null default 0,
  questions_answered integer not null default 0,
  questions_correct integer not null default 0,
  xp_earned integer not null default 0,
  unique(student_id, date)
);

-- ═══════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════

create index idx_students_user_id on public.students(user_id);
create index idx_students_parent_id on public.students(parent_id);
create index idx_students_teacher_id on public.students(teacher_id);
create index idx_progress_student_id on public.progress(student_id);
create index idx_answers_student_id on public.answers(student_id);
create index idx_answers_created_at on public.answers(created_at);
create index idx_theme_progress_student_id on public.theme_progress(student_id);
create index idx_student_inventory_student_id on public.student_inventory(student_id);
create index idx_daily_activity_student_id on public.daily_activity(student_id);
create index idx_daily_activity_date on public.daily_activity(date);
