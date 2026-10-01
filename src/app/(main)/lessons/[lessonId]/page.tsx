"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Layers3 } from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/dashboard/favorite-button";
import { fadeUp, staggerContainer, listItem } from "@/animations";
import { topicCompletion, topicsOfLesson, cardsOfTopic } from "@/lib/stats";

/** Topics of one lesson - the study hub links. */
export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { lessons, topics, flashcards, progress, loading } = useAppData();

  const lesson = lessons.find((l) => l.id === lessonId);
  const lessonTopics = topicsOfLesson(topics, lessonId ?? "");

  if (!loading && !lesson) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Lesson not found.</p>;
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeUp}>
        <Link href="#" onClick={(e) => e.preventDefault()} className="hidden" aria-hidden />
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{lesson?.title ?? "…"}</h1>
        {lesson?.description && <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>}
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {lessonTopics.map((topic) => {
          const completion = topicCompletion(flashcards, progress, topic.id);
          const cardCount = cardsOfTopic(flashcards, topic.id).length;
          return (
            <motion.div key={topic.id} variants={listItem}>
              <Card className="group h-full transition-all hover:-translate-y-1 hover:shadow-lift">
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between">
                    <Link href={`/topics/${topic.id}`} className="flex-1">
                      <h2 className="font-semibold group-hover:text-primary">{topic.title}</h2>
                    </Link>
                    <FavoriteButton itemType="topic" itemId={topic.id} />
                  </div>
                  {topic.summary && (
                    <Link href={`/topics/${topic.id}`}>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{topic.summary}</p>
                    </Link>
                  )}
                  <div className="mt-4 flex items-center gap-3">
                    <Progress value={completion} className="flex-1" />
                    <span className="text-xs font-semibold text-primary">{completion}%</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Layers3 className="h-3 w-3" /> {cardCount} flashcards
                    </Badge>
                  </div>
                  <Link
                    href={`/topics/${topic.id}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    Study topic <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {!loading && lessonTopics.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            This lesson has no topics yet.
          </p>
        )}
      </div>
    </motion.div>
  );
}
