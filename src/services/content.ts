import { supabase } from "@/lib/supabase/client";
import type { Flashcard, Lesson, QuestionType, QuizQuestion, Subject, Topic, Unit } from "@/types";

/** Read helpers for the content hierarchy. Content is admin-written, user-read. */

async function rows<T>(query: PromiseLike<{ data: unknown }>): Promise<T[]> {
  const { data, error } = await query as { data: unknown; error: { message: string } | null };
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export async function getSubjects(): Promise<Subject[]> {
  return rows<Subject>(supabase.from("subjects").select("*").order("created_at"));
}

export async function getUnits(): Promise<Unit[]> {
  return rows<Unit>(supabase.from("units").select("*").order("order_index"));
}

export async function getLessons(): Promise<Lesson[]> {
  return rows<Lesson>(supabase.from("lessons").select("*").order("order_index"));
}

export async function getTopics(): Promise<Topic[]> {
  return rows<Topic>(supabase.from("topics").select("*").order("order_index"));
}

export async function getFlashcards(): Promise<Flashcard[]> {
  return rows<Flashcard>(supabase.from("flashcards").select("*").order("order_index"));
}

export async function getQuestionsForTopic(topicId: string): Promise<QuizQuestion[]> {
  return rows<QuizQuestion>(
    supabase.from("quiz_questions").select("*").eq("topic_id", topicId).order("order_index")
  );
}

export async function getTopicById(topicId: string): Promise<Topic | null> {
  const { data, error } = await supabase.from("topics").select("*").eq("id", topicId).single();
  if (error) return null;
  return data as Topic;
}

/** Resolve the full breadcrumb (subject/unit/lesson) for a topic. */
export async function getBreadcrumbForTopic(
  topicId: string
): Promise<{
  topic: Topic | null;
  lesson: Lesson | null;
  unit: Unit | null;
  subject: Subject | null;
}> {
  const topic = await getTopicById(topicId);
  if (!topic) return { topic: null, lesson: null, unit: null, subject: null };

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", topic.lesson_id)
    .single();
  if (!lesson) return { topic, lesson: null, unit: null, subject: null };

  const { data: unit } = await supabase
    .from("units")
    .select("*")
    .eq("id", lesson.unit_id)
    .single();
  if (!unit) return { topic, lesson: lesson as Lesson, unit: null, subject: null };

  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", unit.subject_id)
    .single();

  return {
    topic,
    lesson: lesson as Lesson,
    unit: unit as Unit,
    subject: (subject as Subject) ?? null
  };
}

export const QUESTION_TYPES: QuestionType[] = [
  "multiple_choice",
  "true_false",
  "identification",
  "enumeration",
  "fill_blank",
  "matching"
];
