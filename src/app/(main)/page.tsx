"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Flame,
  Target,
  Trophy,
  Sparkles
} from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { fadeUp, staggerContainer, listItem } from "@/animations";
import {
  cardsReviewedToday,
  overallStats,
  quizAverage,
  streakDays,
  subjectCompletion,
  todayStudySeconds,
  topicsNeedingReview,
  totalStudySeconds
} from "@/lib/stats";
import { getContinue, getRecent } from "@/lib/continue";
import { formatDuration, greeting } from "@/lib/utils";
import { ACHIEVEMENTS } from "@/constants/achievements";
import type { ContinueState, RecentVisit } from "@/types";

/**
 * Home dashboard: greeting, continue learning, today's goal, overall progress,
 * subjects, recent lessons, upcoming review, study time, streak, achievements.
 */
export default function HomePage() {
  const {
    profile,
    subjects,
    units,
    lessons,
    topics,
    flashcards,
    progress,
    attempts,
    sessions,
    achievements,
    settings,
    loading
  } = useAppData();

  const overall = overallStats(flashcards, progress);
  const streak = streakDays(sessions);
  const studySeconds = totalStudySeconds(sessions);
  const todaySeconds = todayStudySeconds(sessions);
  const todayCards = cardsReviewedToday(progress);
  const quizAvg = quizAverage(attempts);
  const recent = typeof window !== "undefined" ? getRecent() : [];
  const cont: ContinueState | null = typeof window !== "undefined" ? getContinue() : null;
  const goalMinutesPct = Math.min(
    100,
    Math.round((todaySeconds / 60 / Math.max(1, settings.daily_goal_minutes)) * 100)
  );
  const goalCardsPct = Math.min(
    100,
    Math.round((todayCards / Math.max(1, settings.daily_goal_cards)) * 100)
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="h-28 animate-pulse rounded-2xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const firstName = (profile?.full_name ?? "Student").split(" ")[0];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      {/* Greeting */}
      <motion.section variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {greeting()}, {firstName} <span className="inline-block">👋</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Study in order, master every topic. You&apos;ve got this!
          </p>
        </div>
        <ProgressRing value={overall.completionPct} size={64} />
      </motion.section>

      {/* Continue Learning */}
      {cont ? (
        <motion.div variants={fadeUp}>
          <Card className="border-primary/20 bg-gradient-to-br from-accent via-card to-blush shadow-lift">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Continue learning
                </p>
                <h2 className="mt-1 truncate text-lg font-bold">{cont.topicTitle}</h2>
                <p className="truncate text-sm text-muted-foreground">
                  {cont.subjectTitle} · {cont.unitTitle} · {cont.lessonTitle}
                </p>
              </div>
              <Link
                href={`/topics/${cont.topicId}?tab=${cont.mode}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.02]"
              >
                Resume <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <BookOpen className="h-8 w-8 text-primary" />
              <h2 className="text-lg font-semibold">Start your first topic</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Open a subject and pick a topic. Angelica will remember exactly where you stopped.
              </p>
              <Link
                href="/subjects"
                className="mt-1 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft"
              >
                Browse subjects <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Today's Goal + Streak + Study time */}
      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Target className="h-4 w-4 text-primary" /> Today&apos;s Goal
              </p>
              <Badge variant="soft">{goalMinutesPct}%</Badge>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Study time</span>
                  <span>
                    {Math.round(todaySeconds / 60)} / {settings.daily_goal_minutes} min
                  </span>
                </div>
                <Progress value={goalMinutesPct} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Flashcards</span>
                  <span>
                    {todayCards} / {settings.daily_goal_cards}
                  </span>
                </div>
                <Progress value={goalCardsPct} />
              </div>
            </div>
          </CardContent>
        </Card>

        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label="Study Streak"
          value={`${streak} day${streak === 1 ? "" : "s"}`}
          hint={streak > 0 ? "Keep it alive today!" : "Study today to start one"}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Study Time"
          value={formatDuration(studySeconds)}
          hint={`Quiz average: ${quizAvg}%`}
        />
      </motion.div>

      {/* Overall progress */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <ProgressRing value={overall.completionPct} size={84} />
              <div>
                <p className="text-sm font-semibold text-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">
                  {overall.mastered}
                  <span className="text-base font-medium text-muted-foreground">
                    {" "}
                    / {overall.total} cards mastered
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {overall.remaining} remaining · {overall.learning} learning · {overall.new} new
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                {subjects.length} subjects
              </Badge>
              <Badge variant="soft" className="px-3 py-1">
                {topics.length} topics
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subjects */}
      <motion.section variants={fadeUp}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Subjects</h2>
          <Link href="/subjects" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
          {subjects.map((s) => {
            const completion = subjectCompletion(flashcards, progress, topics, lessons, units, s.id);
            return (
              <motion.div key={s.id} variants={listItem} className="w-64 shrink-0">
                <Link href={`/subjects/${s.id}`}>
                  <Card className="h-full transition-transform hover:-translate-y-0.5 hover:shadow-lift">
                    <CardContent className="p-5">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-2xl">
                        {s.emoji}
                      </span>
                      <h3 className="mt-3 truncate font-semibold">{s.title}</h3>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{s.description}</p>
                      <div className="mt-4 flex items-center gap-3">
                        <Progress value={completion} className="flex-1" />
                        <span className="text-xs font-semibold text-primary">{completion}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
          {subjects.length === 0 && (
            <p className="py-8 text-sm text-muted-foreground">
              No subjects yet - an admin needs to add content first.
            </p>
          )}
        </div>
      </motion.section>

      {/* Recent lessons + upcoming review */}
      <motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4 text-primary" /> Recent Lessons
            </h2>
            <ul className="space-y-2">
              {(recent as RecentVisit[]).slice(0, 4).map((r) => (
                <li key={r.topicId}>
                  <Link
                    href={`/topics/${r.topicId}`}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-accent/70"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{r.topicTitle}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {r.subjectTitle} · {r.lessonTitle}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
              {recent.length === 0 && (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  Topics you open will appear here.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> Upcoming Review
            </h2>
            <ul className="space-y-2">
              {topicsNeedingReview(flashcards, progress, topics).map(({ topic, remaining }) => (
                <li key={topic.id}>
                  <Link
                    href={`/topics/${topic.id}?tab=flashcards`}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-accent/70"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{topic.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {remaining} card{remaining === 1 ? "" : "s"} to master
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
              {topicsNeedingReview(flashcards, progress, topics).length === 0 && (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  Everything is mastered. Amazing work! 🎉
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <Trophy className="h-4 w-4 text-primary" /> Achievements
              </h2>
              <Badge variant="soft">
                {achievements.length} / {ACHIEVEMENTS.length} unlocked
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = achievements.includes(a.id);
                return (
                  <div
                    key={a.id}
                    className={`flex w-[calc(50%-0.375rem)] items-center gap-3 rounded-xl p-3 sm:w-56 ${
                      unlocked ? "bg-accent" : "bg-muted opacity-60"
                    }`}
                    title={a.description}
                  >
                    <span className="text-2xl">{a.emoji}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{a.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
