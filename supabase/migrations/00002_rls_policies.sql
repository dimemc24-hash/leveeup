-- ═══════════════════════════════════════════════════════════
-- Row Level Security Policies
-- ═══════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.progress enable row level security;
alter table public.answers enable row level security;
alter table public.theme_progress enable row level security;
alter table public.shop_inventory enable row level security;
alter table public.student_inventory enable row level security;
alter table public.daily_activity enable row level security;

-- ─── users ───
-- Users can read and update their own record
create policy "Users can read own record"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can insert own record"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update own record"
  on public.users for update
  using (auth.uid() = id);

-- ─── students ───
-- Students can access their own data
-- Parents can access their linked children
-- Teachers can read their assigned students
create policy "Students select own or linked"
  on public.students for select
  using (
    user_id = auth.uid()
    or parent_id = auth.uid()
    or teacher_id = auth.uid()
  );

create policy "Students insert own or as parent"
  on public.students for insert
  with check (
    user_id = auth.uid()
    or parent_id = auth.uid()
  );

create policy "Students update own or as parent"
  on public.students for update
  using (
    user_id = auth.uid()
    or parent_id = auth.uid()
  );

create policy "Students delete own or as parent"
  on public.students for delete
  using (
    user_id = auth.uid()
    or parent_id = auth.uid()
  );

-- ─── progress ───
-- Accessible via student ownership chain
create policy "Progress select"
  on public.progress for select
  using (
    student_id in (
      select id from public.students
      where user_id = auth.uid()
        or parent_id = auth.uid()
        or teacher_id = auth.uid()
    )
  );

create policy "Progress insert"
  on public.progress for insert
  with check (
    student_id in (
      select id from public.students
      where user_id = auth.uid()
        or parent_id = auth.uid()
    )
  );

create policy "Progress update"
  on public.progress for update
  using (
    student_id in (
      select id from public.students
      where user_id = auth.uid()
        or parent_id = auth.uid()
    )
  );

-- ─── answers ───
create policy "Answers select"
  on public.answers for select
  using (
    student_id in (
      select id from public.students
      where user_id = auth.uid()
        or parent_id = auth.uid()
        or teacher_id = auth.uid()
    )
  );

create policy "Answers insert"
  on public.answers for insert
  with check (
    student_id in (
      select id from public.students
      where user_id = auth.uid()
        or parent_id = auth.uid()
    )
  );

-- ─── theme_progress ───
create policy "Theme progress select"
  on public.theme_progress for select
  using (
    student_id in (
      select id from public.students
      where user_id = auth.uid()
        or parent_id = auth.uid()
        or teacher_id = auth.uid()
    )
  );

create policy "Theme progress insert"
  on public.theme_progress for insert
  with check (
    student_id in (
      select id from public.students
      where user_id = auth.uid()
        or parent_id = auth.uid()
    )
  );

create policy "Theme progress update"
  on public.theme_progress for update
  using (
    student_id in (
      select id from public.students
      where user_id = auth.uid()
        or parent_id = auth.uid()
    )
  );

-- ─── shop_inventory ───
-- Readable by all authenticated users (public catalog)
create policy "Shop inventory readable by authenticated"
  on public.shop_inventory for select
  using (auth.role() = 'authenticated');

-- ─── student_inventory ───
create policy "Student inventory select"
  on public.student_inventory for select
  using (
    student_id in (
      select id from public.students
      where user_id = auth.uid()
        or parent_id = auth.uid()
        or teacher_id = auth.uid()
    )
  );

create policy "Student inventory insert"
  on public.student_inventory for insert
  with check (
    student_id in (
      select id from public.students
      where user_id = auth.uid()
        or parent_id = auth.uid()
    )
  );

create policy "Student inventory update"
  on public.student_inventory for update
  using (
    student_id in (
      select id from public.students
      where user_id = auth.uid()
        or parent_id = auth.uid()
    )
  );

-- ─── daily_activity ───
create policy "Daily activity select"
  on public.daily_activity for select
  using (
    student_id in (
      select id from public.students
      where user_id = auth.uid()
        or parent_id = auth.uid()
        or teacher_id = auth.uid()
    )
  );

create policy "Daily activity insert"
  on public.daily_activity for insert
  with check (
    student_id in (
      select id from public.students
      where user_id = auth.uid()
        or parent_id = auth.uid()
    )
  );

create policy "Daily activity update"
  on public.daily_activity for update
  using (
    student_id in (
      select id from public.students
      where user_id = auth.uid()
        or parent_id = auth.uid()
    )
  );
