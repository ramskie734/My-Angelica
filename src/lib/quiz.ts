import type { MatchPair, QuizQuestion, QuizQuestionDetail } from "@/types";
import { normalizeAnswer } from "@/lib/utils";

/**
 * Quiz grading engine. Partial credit is supported for enumeration and
 * matching questions; every other type is all-or-nothing.
 *
 * Answer shapes stored in quiz_questions.answer:
 * - multiple_choice: string (the correct option, must exist in options)
 * - true_false: boolean
 * - identification: string (single accepted answer)
 * - enumeration: string[] (all acceptable items; each matched answer earns a share)
 * - fill_blank: string[] (any of the accepted answers)
 * - matching: MatchPair[] (options holds the same pairs; user maps left -> right)
 */

type Given = unknown;

function asPairs(value: unknown): MatchPair[] {
  return Array.isArray(value) ? (value as MatchPair[]) : [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v)) : [];
}

/** True when a typed/selected answer is equivalent to the expected answer. */
function textMatches(given: string, expected: string): boolean {
  return normalizeAnswer(given) === normalizeAnswer(expected);
}

export interface GradeResult {
  earned: number;
  max: number;
  isCorrect: boolean;
  correctAnswer: unknown;
}

/** Grade a single question given the user's answer and partial credit rules. */
export function gradeQuestion(question: QuizQuestion, given: Given): GradeResult {
  const max = question.points;

  switch (question.question_type) {
    case "multiple_choice": {
      const expected = String(question.answer ?? "");
      const correct = typeof given === "string" && given === expected;
      return { earned: correct ? max : 0, max, isCorrect: correct, correctAnswer: expected };
    }

    case "true_false": {
      const expected = Boolean(question.answer);
      const correct = typeof given === "boolean" && given === expected;
      return { earned: correct ? max : 0, max, isCorrect: correct, correctAnswer: expected };
    }

    case "identification": {
      const expected = String(question.answer ?? "");
      const accepted = asStringArray(question.answer);
      const correct =
        typeof given === "string" &&
        (accepted.length > 0
          ? accepted.some((a) => textMatches(given, a))
          : textMatches(given, expected));
      return { earned: correct ? max : 0, max, isCorrect: correct, correctAnswer: expected };
    }

    case "fill_blank": {
      const accepted = asStringArray(question.answer);
      const correct =
        typeof given === "string" &&
        accepted.length > 0 &&
        accepted.some((a) => textMatches(given, a));
      return { earned: correct ? max : 0, max, isCorrect: correct, correctAnswer: accepted.join(" / ") };
    }

    case "enumeration": {
      const answers = asStringArray(question.answer);
      if (answers.length === 0) return { earned: 0, max, isCorrect: false, correctAnswer: answers };
      const userItems = Array.isArray(given) ? given.map((v) => String(v)) : [];
      const remaining = new Set(answers.map((a) => normalizeAnswer(a)));
      let matched = 0;
      for (const item of userItems) {
        const key = normalizeAnswer(item);
        if (key && remaining.has(key)) {
          remaining.delete(key);
          matched++;
        }
      }
      const earned = (matched / answers.length) * max;
      return {
        earned,
        max,
        isCorrect: matched === answers.length,
        correctAnswer: answers
      };
    }

    case "matching": {
      const pairs = asPairs(question.answer);
      if (pairs.length === 0) return { earned: 0, max, isCorrect: false, correctAnswer: pairs };
      const userMap = (given && typeof given === "object" ? (given as Record<string, string>) : {});
      let correct = 0;
      for (const pair of pairs) {
        if (textMatches(userMap[pair.left] ?? "", pair.right)) correct++;
      }
      const earned = (correct / pairs.length) * max;
      return {
        earned,
        max,
        isCorrect: correct === pairs.length,
        correctAnswer: pairs
      };
    }

    default:
      return { earned: 0, max, isCorrect: false, correctAnswer: null };
  }
}

/** Grade a whole attempt and produce the persisted details + summary numbers. */
export function gradeAttempt(
  questions: QuizQuestion[],
  answers: Record<string, Given>
): {
  details: QuizQuestionDetail[];
  score: number;
  totalPoints: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
} {
  const details: QuizQuestionDetail[] = [];
  let score = 0;
  let totalPoints = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  for (const q of questions) {
    const given = answers[q.id];
    const answered =
      given !== undefined &&
      given !== "" &&
      !(Array.isArray(given) && given.every((v) => String(v).trim() === "")) &&
      given !== null;

    const result = gradeQuestion(q, given);
    score += result.earned;
    totalPoints += result.max;

    const isCorrect = answered && result.isCorrect;
    if (!answered) skippedCount++;
    else if (isCorrect) correctCount++;
    else wrongCount++;

    details.push({
      question_id: q.id,
      question: q.question,
      question_type: q.question_type,
      given: given ?? null,
      correct_answer: result.correctAnswer,
      earned: result.earned,
      max: result.max,
      is_correct: Boolean(isCorrect),
      explanation: q.explanation
    });
  }

  return {
    details,
    score: Math.round(score * 100) / 100,
    totalPoints,
    percentage: totalPoints === 0 ? 0 : Math.round((score / totalPoints) * 100),
    correctCount,
    wrongCount,
    skippedCount
  };
}

/** Right-side options for a matching question, shuffled for display. */
export function shuffledRights(pairs: MatchPair[]): string[] {
  const rights = pairs.map((p) => p.right);
  for (let i = rights.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rights[i], rights[j]] = [rights[j], rights[i]];
  }
  return rights;
}
