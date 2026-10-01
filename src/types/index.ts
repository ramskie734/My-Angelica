import type { User } from "@supabase/supabase-js";

/** Application-wide entity and UI types shared by services, hooks and pages. */

export type AppUser = User;

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  title: string;
  description: string | null;
  emoji: string;
  color: string;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  lesson_id: string;
  title: string;
  summary: string | null;
  explanation: string | null;
  image_url: string | null;
  teacher_notes: string | null;
  important_reminders: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  topic_id: string;
  front: string;
  back: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

/** Mastery status of a single flashcard for the signed-in user. */
export type MasteryStatus = "new" | "learning" | "almost_mastered" | "mastered";

export interface FlashcardProgress {
  id: string;
  user_id: string;
  flashcard_id: string;
  status: Exclude<MasteryStatus, "new">;
  review_count: number;
  correct_streak: number;
  last_reviewed_at: string;
  created_at: string;
  updated_at: string;
}

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "identification"
  | "enumeration"
  | "fill_blank"
  | "matching";

export interface MatchPair {
  left: string;
  right: string;
}

export interface QuizQuestion {
  id: string;
  topic_id: string;
  question_type: QuestionType;
  question: string;
  /** multiple_choice: string[]. matching: MatchPair[]. otherwise null. */
  options: string[] | MatchPair[] | null;
  /** Shape depends on question_type (see docs in services/quiz.ts). */
  answer: unknown;
  points: number;
  explanation: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestionDetail {
  question_id: string;
  question: string;
  question_type: QuestionType;
  given: unknown;
  correct_answer: unknown;
  earned: number;
  max: number;
  is_correct: boolean;
  explanation: string | null;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  topic_id: string;
  score: number;
  total_points: number;
  percentage: number;
  time_seconds: number;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  details: QuizQuestionDetail[] | null;
  created_at: string;
}

export type FavoriteType = "subject" | "lesson" | "topic" | "flashcard";

export interface Favorite {
  id: string;
  user_id: string;
  item_type: FavoriteType;
  item_id: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  topic_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  topic_id: string | null;
  activity: "study" | "flashcards" | "quiz";
  duration_seconds: number;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  daily_goal_minutes: number;
  daily_goal_cards: number;
  reminder_enabled: boolean;
  reminder_time: string;
  reduce_motion: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface ContinueState {
  subjectId: string;
  subjectTitle: string;
  unitId: string;
  unitTitle: string;
  lessonId: string;
  lessonTitle: string;
  topicId: string;
  topicTitle: string;
  mode: "study" | "flashcards" | "quiz";
  flashcardIndex: number;
  updatedAt: string;
}

export interface RecentVisit {
  topicId: string;
  topicTitle: string;
  lessonTitle: string;
  subjectTitle: string;
  at: string;
}

/** Aggregated mastery numbers for any flashcard collection. */
export interface MasteryStats {
  total: number;
  mastered: number;
  almostMastered: number;
  learning: number;
  new: number;
  remaining: number;
  completionPct: number;
}
