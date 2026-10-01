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
import { unitCompletion, unitsOfSubject, lessonsOfUnit } from "@/lib/stats";

/** Units of one subject, each linking to its lessons. */
export default function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { subjects, units, lessons, topics, flashcards, progress, loading } = useAppData();

  const subject = subjects.find((s) => s.id === subjectId);
  const subjectUnits = unitsOfSubject(units, subjectId ?? "");

  if (!loading && !subject) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Subject not found.</p>;
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeUp}>
        <Link href="/subjects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ChevronLeft className="h-4 w-4" /> All subjects
        </Link>
        <h1 className="mt-2 flex items-center gap-3 text-2xl font-bold tracking-tight md:text-3xl">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
            style={{ backgroundColor: `${subject?.color ?? "#EC4899"}1A` }}
          >
            {subject?.emoji}
          </span>
          {subject?.title ?? "…"}
        </h1>
        {subject?.description && (
          <p className="mt-1 text-sm text-muted-foreground">{subject.description}</p>
        )}
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {subjectUnits.map((unit) => {
          const completion = unitCompletion(flashcards, progress, topics, lessons, unit.id);
          const lessonCount = lessonsOfUnit(lessons, unit.id).length;
          return (
            <motion.div key={unit.id} variants={listItem}>
              <Link href={`/subjects/${subjectId}/units/${unit.id}`}>
                <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lift">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold">{unit.title}</h2>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {unit.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{unit.description}</p>
                    )}
                    <div className="mt-4 flex items-center gap-3">
                      <Progress value={completion} className="flex-1" />
                      <span className="text-xs font-semibold text-primary">{completion}%</span>
                    </div>
                    <Badge variant="secondary" className="mt-3">
                      {lessonCount} lessons
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
        {!loading && subjectUnits.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            This subject has no units yet.
          </p>
        )}
      </div>
    </motion.div>
  );
}
