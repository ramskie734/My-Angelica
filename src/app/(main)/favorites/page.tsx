"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Heart, Layers3, FileQuestion } from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeUp, staggerContainer, listItem } from "@/animations";

/** Everything the student favorited: subjects, lessons, topics, flashcards. */
export default function FavoritesPage() {
  const { favorites, subjects, lessons, topics, flashcards } = useAppData();

  const favSubjects = favorites.filter((f) => f.item_type === "subject");
  const favLessons = favorites.filter((f) => f.item_type === "lesson");
  const favTopics = favorites.filter((f) => f.item_type === "topic");
  const favCards = favorites.filter((f) => f.item_type === "flashcard");

  const Empty = () => (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
        <Heart className="h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground">
          No favorites yet. Tap the heart on any subject, lesson, topic or flashcard.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Favorites</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your most-loved study material 💖</p>
      </motion.div>

      {favorites.length === 0 && <Empty />}

      {favSubjects.length > 0 && (
        <motion.section variants={fadeUp}>
          <h2 className="mb-2 flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-primary" /> Subjects</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {favSubjects.map((f) => {
              const s = subjects.find((x) => x.id === f.item_id);
              if (!s) return null;
              return (
                <motion.div key={f.id} variants={listItem}>
                  <Link href={`/subjects/${s.id}`}>
                    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lift">
                      <CardContent className="flex items-center gap-3 p-4">
                        <span className="text-2xl">{s.emoji}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{s.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">{s.description}</span>
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}

      {favLessons.length > 0 && (
        <motion.section variants={fadeUp}>
          <h2 className="mb-2 flex items-center gap-2 font-semibold"><Layers3 className="h-4 w-4 text-primary" /> Lessons</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {favLessons.map((f) => {
              const l = lessons.find((x) => x.id === f.item_id);
              if (!l) return null;
              return (
                <motion.div key={f.id} variants={listItem}>
                  <Link href={`/lessons/${l.id}`}>
                    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lift">
                      <CardContent className="p-4">
                        <span className="block truncate font-medium">{l.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{l.description}</span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}

      {favTopics.length > 0 && (
        <motion.section variants={fadeUp}>
          <h2 className="mb-2 flex items-center gap-2 font-semibold"><FileQuestion className="h-4 w-4 text-primary" /> Topics</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {favTopics.map((f) => {
              const t = topics.find((x) => x.id === f.item_id);
              if (!t) return null;
              return (
                <motion.div key={f.id} variants={listItem}>
                  <Link href={`/topics/${t.id}`}>
                    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lift">
                      <CardContent className="p-4">
                        <span className="block truncate font-medium">{t.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{t.summary}</span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}

      {favCards.length > 0 && (
        <motion.section variants={fadeUp}>
          <h2 className="mb-2 flex items-center gap-2 font-semibold">🃏 Flashcards</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {favCards.map((f) => {
              const c = flashcards.find((x) => x.id === f.item_id);
              if (!c) return null;
              const t = topics.find((x) => x.id === c.topic_id);
              return (
                <motion.div key={f.id} variants={listItem}>
                  <Link href={`/topics/${c.topic_id}?tab=flashcards`}>
                    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lift">
                      <CardContent className="p-4">
                        <span className="block truncate font-medium">{c.front}</span>
                        <span className="block truncate text-xs text-muted-foreground">{c.back}</span>
                        {t && <Badge variant="soft" className="mt-2">{t.title}</Badge>}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
