import { supabase } from "@/lib/supabase/client";
import type { Flashcard, Lesson, QuizQuestion, Subject, Topic } from "@/types";

export interface SearchResults {
  subjects: Subject[];
  lessons: Lesson[];
  topics: Topic[];
  flashcards: Flashcard[];
  notes: { topic_id: string; content: string }[];
  definitions: Flashcard[];
  questions: QuizQuestion[];
}

/**
 * Global search across subjects, lessons, topics, flashcards, notes and quiz
 * questions. Uses case-insensitive LIKE matching on the server side.
 */
export async function globalSearch(term: string): Promise<SearchResults> {
  const q = term.trim();
  if (q.length < 2) {
    return { subjects: [], lessons: [], topics: [], flashcards: [], notes: [], definitions: [], questions: [] };
  }
  const like = `%${q}%`;

  const [subjects, lessons, topics, flashcards, notes, questions] = await Promise.all([
    supabase.from("subjects").select("*").ilike("title", like).limit(10),
    supabase.from("lessons").select("*").ilike("title", like).limit(10),
    supabase.from("topics").select("*").or(`title.ilike.${like},summary.ilike.${like}`).limit(10),
    supabase.from("flashcards").select("*").or(`front.ilike.${like},back.ilike.${like}`).limit(15),
    supabase.from("notes").select("topic_id, content").ilike("content", like).limit(10),
    supabase.from("quiz_questions").select("*").ilike("question", like).limit(10)
  ]);

  const cards = (flashcards.data ?? []) as Flashcard[];
  return {
    subjects: (subjects.data ?? []) as Subject[],
    lessons: (lessons.data ?? []) as Lesson[],
    topics: (topics.data ?? []) as Topic[],
    flashcards: cards,
    definitions: cards,
    notes: (notes.data ?? []) as { topic_id: string; content: string }[],
    questions: (questions.data ?? []) as QuizQuestion[]
  };
}
