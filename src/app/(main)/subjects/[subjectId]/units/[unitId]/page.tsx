"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { fadeUp, staggerContainer, listItem } from "@/animations";
import { lessonCompletion, lessonsOfUnit, topicsOfLesson } from "@/lib/stats";

/** Lessons of one unit, each linking to its topics. */
export default function UnitPage() {
  const { subjectId, unitId } = useParams<{ subjectId: string; unitId: string }>();
  const { units, lessons, topics, flashcards, progress, loading } = useAppData();

  const unit = units.find((u) => u.id === unitId);
  const unitLessons = lessonsOfUnit(lessons, unitId ?? "");

  if (!loading && !unit) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Unit not found.</p>;
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeUp}>
        <Link
          href={`/subjects/${subjectId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" /> {unit?.title ?? "Unit"}
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{unit?.title ?? "…"}</h1>
        {unit?.description && <p className="mt-1 text-sm text-muted-foreground">{unit.description}</p>}
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {unitLessons.map((lesson) => {
          const completion = lessonCompletion(flashcards, progress, topics, lesson.id);
          const topicCount = topicsOfLesson(topics, lesson.id).length;
          return (
            <motion.div key={lesson.id} variants={listItem}>
              <Link href={`/lessons/${lesson.id}`}>
                <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lift">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold">{lesson.title}</h2>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {lesson.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{lesson.description}</p>
                    )}
                    <div className="mt-4 flex items-center gap-3">
                      <Progress value={completion} className="flex-1" />
                      <span className="text-xs font-semibold text-primary">{completion}%</span>
                    </div>
                    <Badge variant="secondary" className="mt-3">
                      {topicCount} topics
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
        {!loading && unitLessons.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            This unit has no lessons yet.
          </p>
        )}
      </div>
    </motion.div>
  );
}
