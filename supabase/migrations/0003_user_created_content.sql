-- ============================================================
-- 0003: User-created content
-- Lets every authenticated user create their own subjects,
-- units, lessons, topics, flashcards and quiz questions.
-- Users can only modify/delete content they created themselves
-- (ownership flows down from subjects.created_by). Admins keep
-- full access to everything.
-- ============================================================

-- Ownership helper functions (walk up the hierarchy to the subject owner)
create or replace function public.owns_subject(p_subject_id uuid)
returns boolean
language sql stable security definer set search_path = public as
$$
  select exists (
    select 1 from public.subjects s
    where s.id = p_subject_id
      and (s.created_by = auth.uid() or public.is_admin())
  )
$$;

create or replace function public.owns_unit(p_unit_id uuid)
returns boolean
language sql stable security definer set search_path = public as
$$
  select exists (
    select 1 from public.units u
    where u.id = p_unit_id and public.owns_subject(u.subject_id)
  )
$$;

create or replace function public.owns_lesson(p_lesson_id uuid)
returns boolean
language sql stable security definer set search_path = public as
$$
  select exists (
    select 1 from public.lessons l
    where l.id = p_lesson_id and public.owns_unit(l.unit_id)
  )
$$;

create or replace function public.owns_topic(p_topic_id uuid)
returns boolean
language sql stable security definer set search_path = public as
$$
  select exists (
    select 1 from public.topics t
    where t.id = p_topic_id and public.owns_lesson(t.lesson_id)
  )
$$;

-- Automatically stamp the creator on new subjects when the app
-- does not send created_by explicitly.
create or replace function public.set_subject_owner()
returns trigger
language plpgsql security definer set search_path = public as
$$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists subjects_set_owner on public.subjects;
create trigger subjects_set_owner
  before insert on public.subjects
  for each row execute function public.set_subject_owner();

-- ------------------------------------------------------------
-- Replace admin-only write policies with ownership-based ones
-- ------------------------------------------------------------

-- SUBJECTS
drop policy if exists "subjects_admin_write" on public.subjects;
drop policy if exists "subjects_admin_update" on public.subjects;
drop policy if exists "subjects_admin_delete" on public.subjects;

create policy "subjects_insert_own" on public.subjects
  for insert to authenticated
  with check (created_by = auth.uid() or public.is_admin());

create policy "subjects_update_own" on public.subjects
  for update to authenticated
  using (created_by = auth.uid() or public.is_admin());

create policy "subjects_delete_own" on public.subjects
  for delete to authenticated
  using (created_by = auth.uid() or public.is_admin());

-- UNITS
drop policy if exists "units_admin_insert" on public.units;
drop policy if exists "units_admin_update" on public.units;
drop policy if exists "units_admin_delete" on public.units;

create policy "units_insert_own" on public.units
  for insert to authenticated
  with check (public.owns_subject(subject_id));

create policy "units_update_own" on public.units
  for update to authenticated
  using (public.owns_subject(subject_id));

create policy "units_delete_own" on public.units
  for delete to authenticated
  using (public.owns_subject(subject_id));

-- LESSONS
drop policy if exists "lessons_admin_insert" on public.lessons;
drop policy if exists "lessons_admin_update" on public.lessons;
drop policy if exists "lessons_admin_delete" on public.lessons;

create policy "lessons_insert_own" on public.lessons
  for insert to authenticated
  with check (public.owns_unit(unit_id));

create policy "lessons_update_own" on public.lessons
  for update to authenticated
  using (public.owns_unit(unit_id));

create policy "lessons_delete_own" on public.lessons
  for delete to authenticated
  using (public.owns_unit(unit_id));

-- TOPICS
drop policy if exists "topics_admin_insert" on public.topics;
drop policy if exists "topics_admin_update" on public.topics;
drop policy if exists "topics_admin_delete" on public.topics;

create policy "topics_insert_own" on public.topics
  for insert to authenticated
  with check (public.owns_lesson(lesson_id));

create policy "topics_update_own" on public.topics
  for update to authenticated
  using (public.owns_lesson(lesson_id));

create policy "topics_delete_own" on public.topics
  for delete to authenticated
  using (public.owns_lesson(lesson_id));

-- FLASHCARDS
drop policy if exists "flashcards_admin_insert" on public.flashcards;
drop policy if exists "flashcards_admin_update" on public.flashcards;
drop policy if exists "flashcards_admin_delete" on public.flashcards;

create policy "flashcards_insert_own" on public.flashcards
  for insert to authenticated
  with check (public.owns_topic(topic_id));

create policy "flashcards_update_own" on public.flashcards
  for update to authenticated
  using (public.owns_topic(topic_id));

create policy "flashcards_delete_own" on public.flashcards
  for delete to authenticated
  using (public.owns_topic(topic_id));

-- QUIZ QUESTIONS
drop policy if exists "quiz_questions_admin_insert" on public.quiz_questions;
drop policy if exists "quiz_questions_admin_update" on public.quiz_questions;
drop policy if exists "quiz_questions_admin_delete" on public.quiz_questions;

create policy "quiz_questions_insert_own" on public.quiz_questions
  for insert to authenticated
  with check (public.owns_topic(topic_id));

create policy "quiz_questions_update_own" on public.quiz_questions
  for update to authenticated
  using (public.owns_topic(topic_id));

create policy "quiz_questions_delete_own" on public.quiz_questions
  for delete to authenticated
  using (public.owns_topic(topic_id));

-- ------------------------------------------------------------
-- Storage: any authenticated user can upload topic images
-- (public read stays, admin keeps update/delete control)
-- ------------------------------------------------------------
drop policy if exists "topic_images_admin_insert" on storage.objects;
create policy "topic_images_insert_authenticated" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'topic-images');
