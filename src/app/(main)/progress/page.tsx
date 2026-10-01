"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Flame, Target, Trophy } from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { StatCard } from "@/components/dashboard/stat-card";
import { fadeUp, staggerContainer } from "@/animations";
import {
  overallStats,
  quizAverage,
  streakDays,
  subjectCompletion,
  todayStudySeconds,
  totalStudySeconds,
  unitCompletion,
  lessonCompletion,
  topicCompletion
} from "@/lib/stats";
import { formatDuration, greeting } from "@/lib/utils";
import { ACHIEVEMENTS } from "@/constants/achievements";
import { completedSubjects } from "@/lib/stats";

/**
 * Progress dashboard: overall, subject, unit, lesson and topic completion,
 * flashcards mastered, quiz average, study time, streak, achievements and
 * the daily goal with generated today's tasks.
 */
export default function ProgressPage() {
  const {
    subjects, units, lessons, topics, flashcards, progress, attempts,
    sessions, achievements, settings
  } = useAppData();

  const overall = overallStats(flashcards, progress);
  const streak = streakDays(sessions);
  const quizAvg = quizAverage(attempts);
  const studySeconds = totalStudySeconds(sessions);
  const todaySeconds = todayStudySeconds(sessions);
  const finishedSubjects = completedSubjects(subjects, units, lessons, topics, flashcards, progress);

  // Today's tasks: what remains to finish the daily goals.
  const remainingCards = Math.max(0, settings.daily_goal_cards - progress.filter(
    (p) => p.last_reviewed_at.slice(0, 10) === new Date().toISOString().slice(0, 10)
  ).length);
  const goalMinutesLeft = Math.max(0, settings.daily_goal_minutes - Math.round(todaySeconds / 60));

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Progress</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your whole journey at a glance.</p>
        </div>
        <ProgressRing value={overall.completionPct} size={80} />
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Trophy className="h-5 w-5" />} label="Cards Mastered" value={`${overall.mastered}/${overall.total}`} hint={`${overall.completionPct}% of your library`} />
        <StatCard icon={<Flame className="h-5 w-5" />} label="Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} hint={greeting() === "Good morning" ? "Morning sessions count!" : "Study today to keep it"} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Study Time" value={formatDuration(studySeconds)} hint={`${attempts.length} quizzes taken`} />
        <StatCard icon={<Target className="h-5 w-5" />} label="Quiz Average" value={`${quizAvg}%`} hint={`${finishedSubjects} subject${finishedSubjects === 1 ? "" : "s"} completed`} />
      </motion.div>

      {/* Today's tasks */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-1 font-semibold">Today&apos;s Tasks</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Auto-generated from your daily goal ({settings.daily_goal_cards} cards,{" "}
              {settings.daily_goal_minutes} minutes).
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-accent p-4">
                <p className="text-sm font-semibold text-primary">🃏 Review {remainingCards} more card{remainingCards === 1 ? "" : "s"}</p>
                <p className="text-xs text-muted-foreground">to hit your flashcard goal</p>
              </div>
              <div className="rounded-xl bg-blush p-4">
                <p className="text-sm font-semibold text-primary">
                  ⏱ {goalMinutesLeft > 0 ? `${goalMinutesLeft} min left` : "Time goal reached!"}
                </p>
                <p className="text-xs text-muted-foreground">estimated remaining study time today</p>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <p className="text-sm font-semibold text-foreground">
                  📝 {overall.remaining > 0 ? `${overall.remaining} cards left in total` : "All caught up!"}
                </p>
                <p className="text-xs text-muted-foreground">across every subject</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Per-subject breakdown */}
      <motion.div variants={fadeUp} className="space-y-3">
        <h2 className="text-lg font-bold">Subject Progress</h2>
        {subjects.map((subject) => {
          const sPct = subjectCompletion(flashcards, progress, topics, lessons, units, subject.id);
          const subjectUnits = units.filter((u) => u.subject_id === subject.id);
          return (
            <Card key={subject.id}>
              <CardContent className="p-5">
                <Link href={`/subjects/${subject.id}`} className="flex items-center justify-between">
                  <span className="flex items-center gap-3 font-semibold">
                    <span className="text-xl">{subject.emoji}</span> {subject.title}
                  </span>
                  <Badge variant="soft">{sPct}%</Badge>
                </Link>
                <Progress value={sPct} className="mt-3" />

                {/* Units */}
                <div className="mt-4 space-y-3">
                  {subjectUnits.map((unit) => {
                    const uPct = unitCompletion(flashcards, progress, topics, lessons, unit.id);
                    return (
                      <details key={unit.id} className="group rounded-xl bg-muted/60 p-3">
                        <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                          <span>{unit.title}</span>
                          <span className="text-xs text-primary">{uPct}%</span>
                        </summary>
                        <Progress value={uPct} className="mt-2" />
                        {/* Lessons */}
                        <div className="mt-3 space-y-2">
                          {lessons.filter((l) => l.unit_id === unit.id).map((lesson) => {
                            const lPct = lessonCompletion(flashcards, progress, topics, lesson.id);
                            return (
                              <details key={lesson.id} className="rounded-lg bg-card p-2.5">
                                <summary className="flex cursor-pointer items-center justify-between text-xs font-medium">
                                  <span>{lesson.title}</span>
                                  <span className="text-primary">{lPct}%</span>
                                </summary>
                                <Progress value={lPct} className="mt-2 h-1.5" />
                                <ul className="mt-2 space-y-1.5">
                                  {topics.filter((t) => t.lesson_id === lesson.id).map((topic) => {
                                    const tPct = topicCompletion(flashcards, progress, topic.id);
                                    return (
                                      <li key={topic.id}>
                                        <Link
                                          href={`/topics/${topic.id}`}
                                          className="flex items-center justify-between rounded-md px-2 py-1 text-xs hover:bg-accent/70"
                                        >
                                          <span className="truncate">{topic.title}</span>
                                          <span className="text-muted-foreground">{tPct}%</span>
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </details>
                            );
                          })}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Achievements */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <Trophy className="h-4 w-4 text-primary" /> Achievements
              </h2>
              <Badge variant="soft">{achievements.length}/{ACHIEVEMENTS.length}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = achievements.includes(a.id);
                return (
                  <div
                    key={a.id}
                    className={`rounded-xl p-3 text-center ${unlocked ? "bg-accent" : "bg-muted opacity-60"}`}
                  >
                    <p className="text-2xl">{a.emoji}</p>
                    <p className="mt-1 text-xs font-semibold">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground">{a.description}</p>
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
