import { supabase } from "@/lib/supabase/client";
import type {
  Flashcard,
  Lesson,
  Profile,
  QuestionType,
  QuizQuestion,
  Subject,
  Topic,
  Unit
} from "@/types";

/** Admin-only content management (guarded by RLS policies in the database). */

export async function createSubject(input: {
  title: string;
  description?: string;
  emoji?: string;
  color?: string;
}): Promise<Subject | null> {
  const { data, error } = await supabase
    .from("subjects")
    .insert({ title: input.title, description: input.description ?? null, emoji: input.emoji ?? "📘", color: input.color ?? "#EC4899" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Subject;
}

export async function createUnit(subjectId: string, title: string, description?: string, orderIndex = 0): Promise<Unit | null> {
  const { data, error } = await supabase
    .from("units")
    .insert({ subject_id: subjectId, title, description: description ?? null, order_index: orderIndex })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Unit;
}

export async function createLesson(unitId: string, title: string, description?: string, orderIndex = 0): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from("lessons")
    .insert({ unit_id: unitId, title, description: description ?? null, order_index: orderIndex })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Lesson;
}

export interface TopicInput {
  title: string;
  summary?: string;
  explanation?: string;
  teacherNotes?: string;
  importantReminders?: string;
  imageUrl?: string | null;
}

export async function createTopic(lessonId: string, input: TopicInput, orderIndex = 0): Promise<Topic | null> {
  const { data, error } = await supabase
    .from("topics")
    .insert({
      lesson_id: lessonId,
      title: input.title,
      summary: input.summary ?? null,
      explanation: input.explanation ?? null,
      teacher_notes: input.teacherNotes ?? null,
      important_reminders: input.importantReminders ?? null,
      image_url: input.imageUrl ?? null,
      order_index: orderIndex
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Topic;
}

export async function createFlashcards(
  topicId: string,
  cards: { front: string; back: string }[]
): Promise<Flashcard[]> {
  if (cards.length === 0) return [];
  const { data, error } = await supabase
    .from("flashcards")
    .insert(cards.map((c, i) => ({ topic_id: topicId, front: c.front, back: c.back, order_index: i + 1 })))
    .select();
  if (error) throw new Error(error.message);
  return (data ?? []) as Flashcard[];
}

export interface QuizQuestionInput {
  questionType: QuestionType;
  question: string;
  options: string[] | null;
  answer: unknown;
  points: number;
  explanation?: string;
}

export async function createQuizQuestion(topicId: string, input: QuizQuestionInput): Promise<QuizQuestion | null> {
  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({
      topic_id: topicId,
      question_type: input.questionType,
      question: input.question,
      options: input.options,
      answer: input.answer,
      points: input.points,
      explanation: input.explanation ?? null,
      order_index: 0
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as QuizQuestion;
}

/** Upload a topic image to the public storage bucket and return its public URL. */
export async function uploadTopicImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("topic-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("topic-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
}

export async function getAccountProgressSnapshot(): Promise<{
  userId: string;
  mastered: number;
  reviewed: number;
}[]> {
  const { data, error } = await supabase
    .from("flashcard_progress")
    .select("user_id, status");
  if (error) throw new Error(error.message);
  const map = new Map<string, { mastered: number; reviewed: number }>();
  for (const row of (data ?? []) as { user_id: string; status: string }[]) {
    const entry = map.get(row.user_id) ?? { mastered: 0, reviewed: 0 };
    entry.reviewed++;
    if (row.status === "mastered") entry.mastered++;
    map.set(row.user_id, entry);
  }
  return [...map.entries()].map(([userId, v]) => ({ userId, ...v }));
}
