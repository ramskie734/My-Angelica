"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/dashboard/favorite-button";
import { fadeUp, staggerContainer, listItem } from "@/animations";
import { subjectCompletion, unitsOfSubject } from "@/lib/stats";

/** All subjects, in the order the teacher structured them. */
export default function SubjectsPage() {
  const { subjects, units, lessons, topics, flashcards, progress, loading } = useAppData();

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Subjects</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Study in the same order your teacher teaches. No shuffling, ever.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const completion = subjectCompletion(flashcards, progress, topics, lessons, units, subject.id);
            const unitCount = unitsOfSubject(units, subject.id).length;
            return (
              <motion.div key={subject.id} variants={listItem}>
                <Card className="group h-full transition-all hover:-translate-y-1 hover:shadow-lift">
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="flex items-start justify-between">
                      <span
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                        style={{ backgroundColor: `${subject.color}1A` }}
                      >
                        {subject.emoji}
                      </span>
                      <FavoriteButton itemType="subject" itemId={subject.id} />
                    </div>
                    <Link href={`/subjects/${subject.id}`} className="mt-3 flex-1">
                      <h2 className="font-semibold group-hover:text-primary">{subject.title}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {subject.description}
                      </p>
                    </Link>
                    <div className="mt-4 flex items-center gap-3">
                      <Progress value={completion} className="flex-1" />
                      <span className="text-xs font-semibold text-primary">{completion}%</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Layers className="h-3 w-3" /> {unitCount} units
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {subjects.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
              No subjects yet. An admin needs to add content first.
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
