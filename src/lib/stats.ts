import type {
  Flashcard,
  FlashcardProgress,
  Lesson,
  QuizAttempt,
  StudySession,
  Subject,
  Topic,
  Unit
} from "@/types";
import { dateKey, todayKey } from "@/lib/utils";
import { masteryStats, progressMap } from "@/lib/mastery";

/**
 * Pure aggregation helpers shared by the dashboard, progress page and
 * achievements checker. All functions receive plain data slices.
 */

export function unitsOfSubject(units: Unit[], subjectId: string): Unit[] {
  return units.filter((u) => u.subject_id === subjectId).sort((a, b) => a.order_index - b.order_index);
}

export function lessonsOfUnit(lessons: Lesson[], unitId: string): Lesson[] {
  return lessons.filter((l) => l.unit_id === unitId).sort((a, b) => a.order_index - b.order_index);
}

export function topicsOfLesson(topics: Topic[], lessonId: string): Topic[] {
  return topics.filter((t) => t.lesson_id === lessonId).sort((a, b) => a.order_index - b.order_index);
}

export function cardsOfTopic(cards: Flashcard[], topicId: string): Flashcard[] {
  return cards.filter((c) => c.topic_id === topicId).sort((a, b) => a.order_index - b.order_index);
}

/** Completion % for one topic. */
export function topicCompletion(cards: Flashcard[], progress: FlashcardProgress[], topicId: string): number {
  return masteryStats(cardsOfTopic(cards, topicId), progressMap(progress)).completionPct;
}

/** Completion % for a lesson: share of mastered flashcards across its topics. */
export function lessonCompletion(
  cards: Flashcard[],
  progress: FlashcardProgress[],
  topics: Topic[],
  lessonId: string
): number {
  const ids = topicsOfLesson(topics, lessonId).map((t) => t.id);
  const lessonCards = cards.filter((c) => ids.includes(c.topic_id));
  return masteryStats(lessonCards, progressMap(progress)).completionPct;
}

/** Completion % for a unit across all its lessons' topics. */
export function unitCompletion(
  cards: Flashcard[],
  progress: FlashcardProgress[],
  topics: Topic[],
  lessons: Lesson[],
  unitId: string
): number {
  const lessonIds = lessonsOfUnit(lessons, unitId).map((l) => l.id);
  const topicIds = topics.filter((t) => lessonIds.includes(t.lesson_id)).map((t) => t.id);
  const unitCards = cards.filter((c) => topicIds.includes(c.topic_id));
  return masteryStats(unitCards, progressMap(progress)).completionPct;
}

/** Completion % for a whole subject. */
export function subjectCompletion(
  cards: Flashcard[],
  progress: FlashcardProgress[],
  topics: Topic[],
  lessons: Lesson[],
  units: Unit[],
  subjectId: string
): number {
  const unitIds = unitsOfSubject(units, subjectId).map((u) => u.id);
  const lessonIds = lessons.filter((l) => unitIds.includes(l.unit_id)).map((l) => l.id);
  const topicIds = topics.filter((t) => lessonIds.includes(t.lesson_id)).map((t) => t.id);
  const subCards = cards.filter((c) => topicIds.includes(c.topic_id));
  return masteryStats(subCards, progressMap(progress)).completionPct;
}

/** Account-wide mastery. */
export function overallStats(cards: Flashcard[], progress: FlashcardProgress[]) {
  return masteryStats(cards, progressMap(progress));
}

/** Average quiz percentage across attempts (0 when none yet). */
export function quizAverage(attempts: QuizAttempt[]): number {
  if (attempts.length === 0) return 0;
  return Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length);
}

/** Total study time in seconds. */
export function totalStudySeconds(sessions: StudySession[]): number {
  return sessions.reduce((sum, s) => sum + s.duration_seconds, 0);
}

/** Study seconds logged today (local date). */
export function todayStudySeconds(sessions: StudySession[]): number {
  const today = todayKey();
  return sessions
    .filter((s) => dateKey(s.created_at) === today)
    .reduce((sum, s) => sum + s.duration_seconds, 0);
}

/** Number of flashcards reviewed today (local date). */
export function cardsReviewedToday(progress: FlashcardProgress[]): number {
  const today = todayKey();
  return progress.filter((p) => dateKey(p.last_reviewed_at) === today).length;
}

/** Consecutive-day study streak, counting today if the user already studied. */
export function streakDays(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => dateKey(s.created_at)));
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to survive until end of day: if today has no session yet,
  // start counting from yesterday.
  if (!days.has(todayKey())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(dateKey(cursor.toISOString()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Topics that need review: any topic with at least one non-mastered card,
 * sorted by the number of learning cards (most urgent first).
 */
export function topicsNeedingReview(
  cards: Flashcard[],
  progress: FlashcardProgress[],
  topics: Topic[],
  limit = 3
): { topic: Topic; remaining: number }[] {
  const map = progressMap(progress);
  const result: { topic: Topic; remaining: number }[] = [];
  for (const topic of topics) {
    const stats = masteryStats(cardsOfTopic(cards, topic.id), map);
    if (stats.remaining > 0) {
      result.push({ topic, remaining: stats.remaining });
    }
  }
  result.sort((a, b) => b.remaining - a.remaining);
  return result.slice(0, limit);
}

/** Topics with 100% mastery but at least one card (used by subject completion). */
export function completedSubjects(
  subjects: Subject[],
  units: Unit[],
  lessons: Lesson[],
  topics: Topic[],
  cards: Flashcard[],
  progress: FlashcardProgress[]
): number {
  return subjects.filter(
    (s) => subjectCompletion(cards, progress, topics, lessons, units, s.id) === 100
  ).length;
}
