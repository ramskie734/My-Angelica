"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAppData } from "@/components/providers/app-data-provider";
import { unlockAchievements } from "@/services/user-data";
import { ACHIEVEMENTS, type AchievementStats } from "@/constants/achievements";
import { overallStats, quizAverage, streakDays, totalStudySeconds, completedSubjects } from "@/lib/stats";

/**
 * Watches account stats and automatically unlocks achievements as the
 * student reaches them, celebrating with a toast.
 */
export function AchievementChecker() {
  const { user, profile, flashcards, progress, attempts, sessions, favorites, subjects, units, lessons, topics, achievements, loading, refreshProgress } = useAppData();
  const checkedRef = useRef("");

  useEffect(() => {
    if (loading || !user || achievements.length === 0 && flashcards.length === 0) return;

    // Run once per data snapshot to avoid unlock loops.
    const key = `${user.id}:${progress.length}:${attempts.length}:${sessions.length}:${favorites.length}:${subjects.length}`;
    if (checkedRef.current === key) return;

    const stats: AchievementStats = {
      masteredCards: overallStats(flashcards, progress).mastered,
      totalCards: flashcards.length,
      sessions: sessions.length,
      studyMinutes: Math.round(totalStudySeconds(sessions) / 60),
      bestQuizPct: attempts.reduce((m, a) => Math.max(m, a.percentage), 0),
      quizzesTaken: attempts.length,
      streakDays: streakDays(sessions),
      favoriteCount: favorites.length,
      subjectsCompleted: completedSubjects(subjects, units, lessons, topics, flashcards, progress)
    };

    const eligible = ACHIEVEMENTS.filter((a) => a.check(stats)).map((a) => a.id);
    const fresh = eligible.filter((id) => !achievements.includes(id));
    if (fresh.length === 0) {
      checkedRef.current = key;
      return;
    }

    checkedRef.current = key;
    unlockAchievements(fresh).then(async (unlocked) => {
      if (unlocked.length === 0) return;
      await refreshProgress();
      for (const id of unlocked) {
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (def) toast.success(`Achievement unlocked: ${def.emoji} ${def.title}!`);
      }
    });
  }, [
    user, profile, loading, flashcards, progress, attempts, sessions, favorites,
    subjects, units, lessons, topics, achievements, refreshProgress
  ]);

  return null;
}
