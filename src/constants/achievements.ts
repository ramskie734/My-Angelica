/**
 * Achievement definitions. `check` receives aggregated account statistics and
 * returns true when the achievement is unlocked.
 */
export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  check: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  masteredCards: number;
  totalCards: number;
  sessions: number;
  studyMinutes: number;
  bestQuizPct: number;
  quizzesTaken: number;
  streakDays: number;
  favoriteCount: number;
  subjectsCompleted: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Complete your first study session",
    emoji: "🌱",
    check: (s) => s.sessions >= 1
  },
  {
    id: "card-collector",
    title: "Card Collector",
    description: "Master your first 10 flashcards",
    emoji: "🃏",
    check: (s) => s.masteredCards >= 10
  },
  {
    id: "halfway-hero",
    title: "Halfway Hero",
    description: "Master 50 flashcards",
    emoji: "⭐",
    check: (s) => s.masteredCards >= 50
  },
  {
    id: "card-master",
    title: "Card Master",
    description: "Master 100 flashcards",
    emoji: "👑",
    check: (s) => s.masteredCards >= 100
  },
  {
    id: "quiz-rookie",
    title: "Quiz Rookie",
    description: "Finish your first quiz",
    emoji: "📝",
    check: (s) => s.quizzesTaken >= 1
  },
  {
    id: "quiz-whiz",
    title: "Quiz Whiz",
    description: "Score 100% on any quiz",
    emoji: "🎯",
    check: (s) => s.bestQuizPct >= 100
  },
  {
    id: "streak-starter",
    title: "Streak Starter",
    description: "Study 3 days in a row",
    emoji: "🔥",
    check: (s) => s.streakDays >= 3
  },
  {
    id: "week-warrior",
    title: "Week Warrior",
    description: "Keep a 7-day study streak",
    emoji: "⚡",
    check: (s) => s.streakDays >= 7
  },
  {
    id: "marathon",
    title: "Marathon Mind",
    description: "Study 60 minutes in total",
    emoji: "🏃",
    check: (s) => s.studyMinutes >= 60
  },
  {
    id: "collector-heart",
    title: "Curious Heart",
    description: "Add 5 favorites",
    emoji: "💖",
    check: (s) => s.favoriteCount >= 5
  },
  {
    id: "subject-finisher",
    title: "Subject Finisher",
    description: "Complete an entire subject",
    emoji: "🏆",
    check: (s) => s.subjectsCompleted >= 1
  }
];
