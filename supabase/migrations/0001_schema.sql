-- ============================================================================
-- My Angelica - Database Schema
-- Structured reviewer system: Subject -> Unit -> Lesson -> Topic -> Study /
-- Flashcards / Quiz / Mastery
-- Run this file first in the Supabase SQL Editor (Dashboard -> SQL Editor).
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Helper functions
-- ----------------------------------------------------------------------------

-- Returns the role of the current authenticated user.
create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'anon');
$$;

-- Returns true when the current authenticated user is an admin.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

-- ----------------------------------------------------------------------------
-- Profiles
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Extended profile data for every authenticated user.';

-- Keep the created_at column fresh on update.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Automatically create a profile whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Content hierarchy: subjects -> units -> lessons -> topics
-- ----------------------------------------------------------------------------
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  emoji text not null default '📘',
  color text not null default '#EC4899',
  is_published boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  title text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  summary text,
  explanation text,
  image_url text,
  teacher_notes text,
  important_reminders text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Flashcards and per-user progress
-- ----------------------------------------------------------------------------
create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  front text not null,
  back text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flashcard_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flashcard_id uuid not null references public.flashcards(id) on delete cascade,
  status text not null check (status in ('learning', 'almost_mastered', 'mastered')),
  review_count integer not null default 0,
  correct_streak integer not null default 0,
  last_reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, flashcard_id)
);

comment on table public.flashcard_progress is 'Per-user mastery state per flashcard. Absence of a row means the card is still NEW.';

-- ----------------------------------------------------------------------------
-- Quizzes
-- ----------------------------------------------------------------------------
create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  question_type text not null check (question_type in
    ('multiple_choice', 'true_false', 'identification', 'enumeration', 'fill_blank', 'matching')),
  question text not null,
  options jsonb,
  answer jsonb not null,
  points integer not null default 1,
  explanation text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.quiz_questions.options is 'For multiple_choice: array of option strings. For matching: array of { left, right } pairs (answer holds the same pairs).';

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  score numeric not null default 0,
  total_points numeric not null default 0,
  percentage numeric not null default 0,
  time_seconds integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  skipped_count integer not null default 0,
  details jsonb,
  created_at timestamptz not null default now()
);

create index quiz_attempts_topic_idx on public.quiz_attempts (topic_id);
create index quiz_attempts_user_created_idx on public.quiz_attempts (user_id, created_at desc);

-- ----------------------------------------------------------------------------
-- Favorites
-- ----------------------------------------------------------------------------
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('subject', 'lesson', 'topic', 'flashcard')),
  item_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

-- ----------------------------------------------------------------------------
-- Personal notes per topic
-- ----------------------------------------------------------------------------
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id)
);

-- ----------------------------------------------------------------------------
-- Study sessions (used for study time, streaks and daily goals)
-- ----------------------------------------------------------------------------
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete set null,
  activity text not null check (activity in ('study', 'flashcards', 'quiz')),
  duration_seconds integer not null default 0,
  created_at timestamptz not null default now()
);

create index study_sessions_user_created_idx on public.study_sessions (user_id, created_at desc);

-- ----------------------------------------------------------------------------
-- Daily goals
-- ----------------------------------------------------------------------------
create table public.daily_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  target_minutes integer not null default 20,
  target_cards integer not null default 10,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ----------------------------------------------------------------------------
-- Notifications
-- ----------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  type text not null default 'reminder' check (type in ('reminder', 'streak', 'achievement', 'goal')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, is_read, created_at desc);

-- ----------------------------------------------------------------------------
-- User settings
-- ----------------------------------------------------------------------------
create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_goal_minutes integer not null default 20,
  daily_goal_cards integer not null default 10,
  reminder_enabled boolean not null default false,
  reminder_time text not null default '19:00',
  reduce_motion boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Achievements
-- ----------------------------------------------------------------------------
create table public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ----------------------------------------------------------------------------
-- Indexes on foreign keys
-- ----------------------------------------------------------------------------
create index units_subject_idx on public.units (subject_id, order_index);
create index lessons_unit_idx on public.lessons (unit_id, order_index);
create index topics_lesson_idx on public.topics (lesson_id, order_index);
create index flashcards_topic_idx on public.flashcards (topic_id, order_index);
create index flashcard_progress_user_idx on public.flashcard_progress (user_id);
create index flashcard_progress_flashcard_idx on public.flashcard_progress (flashcard_id);
create index quiz_questions_topic_idx on public.quiz_questions (topic_id, order_index);
create index favorites_user_idx on public.favorites (user_id);
create index notes_user_idx on public.notes (user_id);
create index notes_topic_idx on public.notes (topic_id);

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.topics enable row level security;
alter table public.flashcards enable row level security;
alter table public.flashcard_progress enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.favorites enable row level security;
alter table public.notes enable row level security;
alter table public.study_sessions enable row level security;
alter table public.daily_goals enable row level security;
alter table public.notifications enable row level security;
alter table public.user_settings enable row level security;
alter table public.user_achievements enable row level security;

-- Profiles ------------------------------------------------------------------
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.my_role());

create policy "profiles_admin_update_any"
  on public.profiles for update
  to authenticated
  using (public.is_admin());

-- Content (admin writes, everyone authenticated reads published content) ----
create policy "subjects_select" on public.subjects for select to authenticated using (is_published or public.is_admin());
create policy "subjects_admin_write" on public.subjects for insert to authenticated with check (public.is_admin());
create policy "subjects_admin_update" on public.subjects for update to authenticated using (public.is_admin());
create policy "subjects_admin_delete" on public.subjects for delete to authenticated using (public.is_admin());

create policy "units_select" on public.units for select to authenticated using (true);
create policy "units_admin_insert" on public.units for insert to authenticated with check (public.is_admin());
create policy "units_admin_update" on public.units for update to authenticated using (public.is_admin());
create policy "units_admin_delete" on public.units for delete to authenticated using (public.is_admin());

create policy "lessons_select" on public.lessons for select to authenticated using (true);
create policy "lessons_admin_insert" on public.lessons for insert to authenticated with check (public.is_admin());
create policy "lessons_admin_update" on public.lessons for update to authenticated using (public.is_admin());
create policy "lessons_admin_delete" on public.lessons for delete to authenticated using (public.is_admin());

create policy "topics_select" on public.topics for select to authenticated using (true);
create policy "topics_admin_insert" on public.topics for insert to authenticated with check (public.is_admin());
create policy "topics_admin_update" on public.topics for update to authenticated using (public.is_admin());
create policy "topics_admin_delete" on public.topics for delete to authenticated using (public.is_admin());

create policy "flashcards_select" on public.flashcards for select to authenticated using (true);
create policy "flashcards_admin_insert" on public.flashcards for insert to authenticated with check (public.is_admin());
create policy "flashcards_admin_update" on public.flashcards for update to authenticated using (public.is_admin());
create policy "flashcards_admin_delete" on public.flashcards for delete to authenticated using (public.is_admin());

create policy "quiz_questions_select" on public.quiz_questions for select to authenticated using (true);
create policy "quiz_questions_admin_insert" on public.quiz_questions for insert to authenticated with check (public.is_admin());
create policy "quiz_questions_admin_update" on public.quiz_questions for update to authenticated using (public.is_admin());
create policy "quiz_questions_admin_delete" on public.quiz_questions for delete to authenticated using (public.is_admin());

-- Per-user data: owner only ---------------------------------------------------
create policy "flashcard_progress_select_own" on public.flashcard_progress for select to authenticated using (user_id = auth.uid());
create policy "flashcard_progress_insert_own" on public.flashcard_progress for insert to authenticated with check (user_id = auth.uid());
create policy "flashcard_progress_update_own" on public.flashcard_progress for update to authenticated using (user_id = auth.uid());
create policy "flashcard_progress_delete_own" on public.flashcard_progress for delete to authenticated using (user_id = auth.uid());

create policy "quiz_attempts_select_own" on public.quiz_attempts for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "quiz_attempts_insert_own" on public.quiz_attempts for insert to authenticated with check (user_id = auth.uid());

create policy "favorites_select_own" on public.favorites for select to authenticated using (user_id = auth.uid());
create policy "favorites_insert_own" on public.favorites for insert to authenticated with check (user_id = auth.uid());
create policy "favorites_delete_own" on public.favorites for delete to authenticated using (user_id = auth.uid());

create policy "notes_select_own" on public.notes for select to authenticated using (user_id = auth.uid());
create policy "notes_insert_own" on public.notes for insert to authenticated with check (user_id = auth.uid());
create policy "notes_update_own" on public.notes for update to authenticated using (user_id = auth.uid());

create policy "study_sessions_select_own" on public.study_sessions for select to authenticated using (user_id = auth.uid());
create policy "study_sessions_insert_own" on public.study_sessions for insert to authenticated with check (user_id = auth.uid());

create policy "daily_goals_select_own" on public.daily_goals for select to authenticated using (user_id = auth.uid());
create policy "daily_goals_insert_own" on public.daily_goals for insert to authenticated with check (user_id = auth.uid());
create policy "daily_goals_update_own" on public.daily_goals for update to authenticated using (user_id = auth.uid());

create policy "notifications_select_own" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications_insert_own" on public.notifications for insert to authenticated with check (user_id = auth.uid());
create policy "notifications_update_own" on public.notifications for update to authenticated using (user_id = auth.uid());

create policy "user_settings_select_own" on public.user_settings for select to authenticated using (user_id = auth.uid());
create policy "user_settings_insert_own" on public.user_settings for insert to authenticated with check (user_id = auth.uid());
create policy "user_settings_update_own" on public.user_settings for update to authenticated using (user_id = auth.uid());

create policy "user_achievements_select_own" on public.user_achievements for select to authenticated using (user_id = auth.uid());
create policy "user_achievements_insert_own" on public.user_achievements for insert to authenticated with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Storage bucket for topic images
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('topic-images', 'topic-images', true)
on conflict (id) do nothing;

create policy "topic_images_public_read"
  on storage.objects for select
  using (bucket_id = 'topic-images');

create policy "topic_images_admin_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'topic-images' and public.is_admin());

create policy "topic_images_admin_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'topic-images' and public.is_admin());

create policy "topic_images_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'topic-images' and public.is_admin());
