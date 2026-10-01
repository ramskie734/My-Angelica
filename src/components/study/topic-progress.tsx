"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppData } from "@/components/providers/app-data-provider";
import { masteryStats, progressMap, statusOf } from "@/lib/mastery";
import { cardsOfTopic } from "@/lib/stats";
import { quizAverage } from "@/lib/stats";
import { MASTERY_COLORS, MASTERY_LABELS } from "@/constants";
import type { Topic } from "@/types";

/** Progress tab: mastery breakdown, quiz history and per-card status list. */
export function TopicProgress({ topic }: { topic: Topic }) {
  const { flashcards, progress, attempts } = useAppData();
  const cards = useMemo(() => cardsOfTopic(flashcards, topic.id), [flashcards, topic.id]);
  const pMap = useMemo(() => progressMap(progress), [progress]);
  const stats = masteryStats(cards, pMap);
  const topicAttempts = attempts.filter((a) => a.topic_id === topic.id);
  const avg = quizAverage(topicAttempts);
  const best = topicAttempts.reduce((m, a) => Math.max(m, a.percentage), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Topic Completion</h2>
            <Badge variant="soft">{stats.completionPct}%</Badge>
          </div>
          <Progress value={stats.completionPct} className="mt-3" />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["new", "learning", "almost_mastered", "mastered"] as const).map((s) => (
              <div key={s} className={`rounded-xl p-3 text-center ${MASTERY_COLORS[s]}`}>
                <p className="text-lg font-bold">
                  {s === "new" ? stats.new : s === "learning" ? stats.learning : s === "almost_mastered" ? stats.almostMastered : stats.mastered}
                </p>
                <p className="text-[11px] font-medium">{MASTERY_LABELS[s]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold">Quiz Performance</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-muted p-4 text-center">
              <p className="text-xl font-bold">{topicAttempts.length}</p>
              <p className="text-xs text-muted-foreground">Attempts</p>
            </div>
            <div className="rounded-xl bg-muted p-4 text-center">
              <p className="text-xl font-bold">{avg}%</p>
              <p className="text-xs text-muted-foreground">Average</p>
            </div>
            <div className="rounded-xl bg-muted p-4 text-center">
              <p className="text-xl font-bold">{best}%</p>
              <p className="text-xs text-muted-foreground">Best</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-3 font-semibold">Flashcards by Mastery</h2>
          <ul className="divide-y divide-border/60">
            {cards.map((card, i) => {
              const status = statusOf(card.id, pMap);
              return (
                <li key={card.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="w-5 text-xs text-muted-foreground">{i + 1}</span>
                    <span className="truncate text-sm font-medium">{card.front}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${MASTERY_COLORS[status]}`}>
                    {MASTERY_LABELS[status]}
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
