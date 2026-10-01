import { supabase } from "@/lib/supabase/client";
import type { FlashcardProgress, QuizAttempt, StudySession, UserSettings } from "@/types";

/** Per-user progress, sessions, attempts and settings. */

export async function getMyProgress(): Promise<FlashcardProgress[]> {
  const { data } = await supabase.from("flashcard_progress").select("*");
  return (data ?? []) as FlashcardProgress[];
}

/** Mark a flashcard with a new status, creating or updating the progress row. */
export async function setFlashcardStatus(
  flashcardId: string,
  status: "learning" | "almost_mastered" | "mastered"
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("flashcard_progress")
    .upsert(
      {
        user_id: user.id,
        flashcard_id: flashcardId,
        status,
        review_count: 1,
        correct_streak: status === "mastered" ? 1 : 0,
        last_reviewed_at: new Date().toISOString()
      },
      { onConflict: "user_id,flashcard_id" }
    );
  if (error) throw new Error(error.message);
}

export async function getMyAttempts(): Promise<QuizAttempt[]> {
  const { data } = await supabase
    .from("quiz_attempts")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as QuizAttempt[];
}

export async function saveQuizAttempt(attempt: {
  topic_id: string;
  score: number;
  total_points: number;
  percentage: number;
  time_seconds: number;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  details: unknown;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from("quiz_attempts")
    .insert({ ...attempt, user_id: user.id });
  if (error) throw new Error(error.message);
}

export async function getMySessions(): Promise<StudySession[]> {
  const { data } = await supabase
    .from("study_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  return (data ?? []) as StudySession[];
}

export async function logStudySession(
  topicId: string,
  activity: "study" | "flashcards" | "quiz",
  durationSeconds: number
): Promise<void> {
  if (durationSeconds < 1) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("study_sessions").insert({
    user_id: user.id,
    topic_id: topicId,
    activity,
    duration_seconds: Math.round(durationSeconds)
  });
}

export const DEFAULT_SETTINGS: UserSettings = {
  user_id: "",
  daily_goal_minutes: 20,
  daily_goal_cards: 10,
  reminder_enabled: false,
  reminder_time: "19:00",
  reduce_motion: false,
  created_at: "",
  updated_at: ""
};

export async function getMySettings(): Promise<UserSettings> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ...DEFAULT_SETTINGS };
  const { data } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (data) return data as UserSettings;

  // First visit - create default settings for this user.
  const fresh = { ...DEFAULT_SETTINGS, user_id: user.id };
  delete (fresh as Partial<UserSettings>).created_at;
  delete (fresh as Partial<UserSettings>).updated_at;
  await supabase.from("user_settings").upsert(fresh, { onConflict: "user_id" });
  return { ...DEFAULT_SETTINGS, user_id: user.id };
}

export async function updateMySettings(
  partial: Partial<Pick<UserSettings, "daily_goal_minutes" | "daily_goal_cards" | "reminder_enabled" | "reminder_time" | "reduce_motion">>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: user.id, ...partial }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
}
