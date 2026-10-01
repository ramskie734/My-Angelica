"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logStudySession } from "@/services/progress";
import { fadeUp } from "@/animations";
import { useAppData } from "@/components/providers/app-data-provider";
import type { Topic } from "@/types";

/**
 * Study mode: one concept at a time. Shows the topic title, explanation,
 * optional image, teacher notes and summary, with previous / next controls
 * across the whole lesson so concepts stay in teaching order.
 */
export function StudyView({ topic }: { topic: Topic }) {
  const siblings = useSiblings(topic);
  const [index, setIndex] = useState(() => Math.max(0, siblings.findIndex((t) => t.id === topic.id)));
  const activeTopic = siblings[index] ?? topic;
  const [seconds, setSeconds] = useState(0);
  const loggedRef = useRef(false);

  // Log study time for the streak and daily goal.
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      clearInterval(timer);
      if (seconds > 5 && !loggedRef.current) {
        loggedRef.current = true;
        logStudySession(activeTopic.id, "study", seconds).catch(() => undefined);
      }
    };
  }, [activeTopic.id, seconds]);

  const hasPrev = index > 0;
  const hasNext = index < siblings.length - 1;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <Card className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTopic.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <CardContent className="p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Study Notes · {index + 1} of {siblings.length}
              </p>
              <h2 className="mt-2 text-xl font-bold md:text-2xl">{activeTopic.title}</h2>

              {activeTopic.image_url && (
                <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl">
                  <Image
                    src={activeTopic.image_url}
                    alt={activeTopic.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 640px"
                  />
                </div>
              )}

              {activeTopic.explanation && (
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground md:text-[15px]">
                  {activeTopic.explanation.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}

              {activeTopic.teacher_notes && (
                <div className="mt-5 rounded-2xl border border-secondary/40 bg-accent/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    🍎 Teacher Notes
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-accent-foreground">
                    {activeTopic.teacher_notes}
                  </p>
                </div>
              )}

              {activeTopic.important_reminders && (
                <div className="mt-3 rounded-2xl border border-primary/30 bg-blush p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    ⭐ Important Reminders
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                    {activeTopic.important_reminders}
                  </p>
                </div>
              )}

              {activeTopic.summary && (
                <div className="mt-5 rounded-2xl bg-muted p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Summary
                  </p>
                  <p className="mt-1.5 text-sm text-foreground">{activeTopic.summary}</p>
                </div>
              )}
            </CardContent>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between border-t border-border/60 p-4">
          <Button variant="outline" disabled={!hasPrev} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="text-xs font-medium text-muted-foreground">
            {index + 1} / {siblings.length}
          </span>
          <Button disabled={!hasNext} onClick={() => setIndex((i) => Math.min(siblings.length - 1, i + 1))}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

/** All topics of the active lesson, in teaching order. */
function useSiblings(topic: Topic): Topic[] {
  const { topics } = useAppData();
  return topics
    .filter((t) => t.lesson_id === topic.lesson_id)
    .sort((a, b) => a.order_index - b.order_index);
}
