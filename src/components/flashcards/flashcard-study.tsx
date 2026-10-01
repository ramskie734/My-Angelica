"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RefreshCw, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppData } from "@/components/providers/app-data-provider";
import { setFlashcardStatus, logStudySession } from "@/services/progress";
import { masteryStats, progressMap, statusOf } from "@/lib/mastery";
import { cardsOfTopic } from "@/lib/stats";
import { getContinue, saveContinue } from "@/lib/continue";
import { MASTERY_COLORS, MASTERY_LABELS } from "@/constants";
import { fadeUp } from "@/animations";
import type { Flashcard, Topic } from "@/types";

/**
 * The heart of My Angelica: flashcards scoped to ONE topic, never shuffled
 * across the subject. Mastered cards disappear from review but are never
 * deleted - "Show Mastered Cards" toggles them back on.
 */
export function FlashcardStudy({ topic }: { topic: Topic }) {
  const { flashcards, progress, refreshProgress } = useAppData();
  const cards = useMemo(() => cardsOfTopic(flashcards, topic.id), [flashcards, topic.id]);
  const pMap = useMemo(() => progressMap(progress), [progress]);
  const stats = masteryStats(cards, pMap);

  const [showMastered, setShowMastered] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const loggedRef = useRef(false);

  // The visible deck: everything except mastered cards, unless revealed.
  const deck = showMastered
    ? cards
    : cards.filter((c) => statusOf(c.id, pMap) !== "mastered");

  // Smart Continue: restore the last flashcard position for this topic.
  useEffect(() => {
    const cont = getContinue();
    if (cont && cont.topicId === topic.id) {
      const restored = Math.min(cont.flashcardIndex, Math.max(0, deck.length - 1));
      if (restored > 0) setIndex(restored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic.id]);

  // Track study time for goals and streaks.
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      clearInterval(timer);
      if (seconds > 5 && !loggedRef.current) {
        loggedRef.current = true;
        logStudySession(topic.id, "flashcards", seconds).catch(() => undefined);
      }
    };
  }, [topic.id, seconds]);

  // Clamp the index if the deck shrinks (cards becoming mastered).
  const safeIndex = Math.min(index, Math.max(0, deck.length - 1));
  const card: Flashcard | undefined = deck[safeIndex];

  // Persist the current position for Smart Continue.
  useEffect(() => {
    if (card) saveContinueFlashcards(topic.id, safeIndex);
  }, [card, topic.id, safeIndex]);

  const advance = () => {
    setFlipped(false);
    setTimeout(() => {
      setIndex((i) => (i + 1) % Math.max(1, deck.length));
    }, 120);
  };

  const mark = async (mastered: boolean) => {
    if (!card) return;
    try {
      await setFlashcardStatus(card.id, mastered ? "mastered" : "learning");
      await refreshProgress();
      toast.success(
        mastered ? "Mastered! This card is now stored away 💖" : "Added back to review 🔄"
      );
      advance();
    } catch {
      toast.error("Could not save your progress");
    }
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
      {/* Session stats */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Flashcards for this topic</h2>
              <p className="text-xs text-muted-foreground">
                {stats.mastered} mastered · {stats.remaining} remaining ·{" "}
                {stats.total} total
              </p>
            </div>
            <Button
              variant={showMastered ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowMastered((v) => !v);
                setIndex(0);
                setFlipped(false);
              }}
            >
              {showMastered ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showMastered ? "Hide Mastered" : "Show Mastered Cards"}
            </Button>
          </div>
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
          <div className="mt-4 flex items-center gap-3">
            <Progress value={stats.completionPct} className="flex-1" />
            <span className="text-xs font-semibold text-primary">{stats.completionPct}%</span>
          </div>
        </CardContent>
      </Card>

      {/* The card */}
      {card ? (
        <div className="mx-auto max-w-xl">
          <div
            className="perspective-1200 cursor-pointer select-none"
            onClick={() => setFlipped((f) => !f)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${card.id}-${flipped}`}
                initial={{ rotateY: flipped ? -90 : 90, opacity: 0.4 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: flipped ? 90 : -90, opacity: 0.4 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="preserve-3d"
              >
                <Card className="min-h-[280px] border-2 border-primary/20 shadow-lift">
                  <CardContent className="flex min-h-[280px] flex-col items-center justify-center gap-4 p-8 text-center">
                    <Badge variant="soft" className="mb-1">
                      {safeIndex + 1} / {deck.length} · {MASTERY_LABELS[statusOf(card.id, pMap)]}
                    </Badge>
                    {flipped ? (
                      <p className="text-lg font-medium leading-relaxed text-foreground md:text-xl">
                        {card.back}
                      </p>
                    ) : (
                      <p className="text-2xl font-bold leading-snug text-foreground md:text-3xl">
                        {card.front}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {flipped ? "How well did you know it?" : "Tap to reveal the answer"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-12 rounded-2xl border-secondary/60 text-secondary-foreground hover:bg-accent"
              onClick={() => mark(false)}
            >
              <RefreshCw className="h-4 w-4" /> Review Again
            </Button>
            <Button
              className="h-12 rounded-2xl shadow-soft"
              onClick={() => mark(true)}
            >
              <Heart className="h-4 w-4 fill-white" /> I Know This
            </Button>
          </div>
        </div>
      ) : (
        <Card className="mx-auto max-w-xl">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <span className="text-4xl">🎉</span>
            <h2 className="text-lg font-bold">All cards mastered!</h2>
            <p className="text-sm text-muted-foreground">
              Every flashcard in this topic is mastered. They&apos;re safely stored - turn on
              &ldquo;Show Mastered Cards&rdquo; to review them again anytime.
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

/** Persist the flashcard position into Smart Continue. */
function saveContinueFlashcards(topicId: string, cardIndex: number) {
  const cont = getContinue();
  if (cont && cont.topicId === topicId) {
    saveContinue({ ...cont, mode: "flashcards", flashcardIndex: cardIndex, updatedAt: new Date().toISOString() });
  }
}
