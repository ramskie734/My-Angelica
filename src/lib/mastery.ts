import type { Flashcard, FlashcardProgress, MasteryStats } from "@/types";

/**
 * Mastery engine. All progress percentages in the app derive from these helpers:
 * a flashcard with no progress row is NEW; a row marks learning /
 * almost_mastered / mastered. Completion % of a topic, lesson, unit, subject
 * and the whole account is the share of MASTERED flashcards.
 */

export function progressMap(progress: FlashcardProgress[]): Map<string, FlashcardProgress> {
  const map = new Map<string, FlashcardProgress>();
  for (const p of progress) map.set(p.flashcard_id, p);
  return map;
}

export function statusOf(cardId: string, map: Map<string, FlashcardProgress>): "new" | "learning" | "almost_mastered" | "mastered" {
  return map.get(cardId)?.status ?? "new";
}

/** Aggregate mastery statistics for a collection of flashcards. */
export function masteryStats(cards: Flashcard[], map: Map<string, FlashcardProgress>): MasteryStats {
  let mastered = 0;
  let almost = 0;
  let learning = 0;
  for (const card of cards) {
    const status = statusOf(card.id, map);
    if (status === "mastered") mastered++;
    else if (status === "almost_mastered") almost++;
    else if (status === "learning") learning++;
  }
  const total = cards.length;
  return {
    total,
    mastered,
    almostMastered: almost,
    learning,
    new: total - mastered - almost - learning,
    remaining: total - mastered,
    completionPct: total === 0 ? 0 : Math.round((mastered / total) * 100)
  };
}

/** Completion % across an arbitrary set of flashcards grouped by topic id. */
export function completionPctFor(allCards: Flashcard[], map: Map<string, FlashcardProgress>, topicIds: string[]): number {
  const cards = allCards.filter((c) => topicIds.includes(c.topic_id));
  return masteryStats(cards, map).completionPct;
}

/**
 * Promotion order used when quizzes reinforce flashcard mastery:
 * new -> learning -> almost_mastered -> mastered.
 */
export function nextStatus(
  current: "new" | "learning" | "almost_mastered" | "mastered"
): "learning" | "almost_mastered" | "mastered" {
  if (current === "new" || current === "learning") return "learning";
  if (current === "almost_mastered") return "mastered";
  return "mastered";
}
