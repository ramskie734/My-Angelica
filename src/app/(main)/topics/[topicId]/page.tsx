"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/dashboard/favorite-button";
import { StudyView } from "@/components/study/study-view";
import { FlashcardStudy } from "@/components/flashcards/flashcard-study";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { TopicNotes } from "@/components/study/topic-notes";
import { TopicProgress } from "@/components/study/topic-progress";
import { fadeUp } from "@/animations";
import { pushRecent, saveContinue } from "@/lib/continue";
import { topicCompletion } from "@/lib/stats";

type TabId = "study" | "flashcards" | "quiz" | "notes" | "progress";

/**
 * Topic hub. Keeps the study position in Smart Continue and provides the
 * four ways to engage with a topic: study, flashcards, quiz and notes,
 * plus a progress overview.
 */
export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const searchParams = useSearchParams();
  const { topics, lessons, units, subjects, flashcards, progress, loading } = useAppData();

  const initialTab = (searchParams.get("tab") as TabId) || "study";
  const [tab, setTab] = useState<TabId>(initialTab);

  const topic = topics.find((t) => t.id === topicId);
  const lesson = lessons.find((l) => l.id === topic?.lesson_id);
  const unit = units.find((u) => u.id === lesson?.unit_id);
  const subject = subjects.find((s) => s.id === unit?.subject_id);

  // Record the visit for Smart Continue and Recent Lessons.
  useEffect(() => {
    if (!topic || !lesson || !unit || !subject) return;
    saveContinue({
      subjectId: subject.id,
      subjectTitle: subject.title,
      unitId: unit.id,
      unitTitle: unit.title,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      topicId: topic.id,
      topicTitle: topic.title,
      mode: tab === "study" || tab === "flashcards" || tab === "quiz" ? tab : "study",
      flashcardIndex: 0,
      updatedAt: new Date().toISOString()
    });
    pushRecent({
      topicId: topic.id,
      topicTitle: topic.title,
      lessonTitle: lesson.title,
      subjectTitle: subject.title,
      at: new Date().toISOString()
    });
  }, [topicId, topic, lesson, unit, subject, tab]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-muted" />;
  }

  if (!topic) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Topic not found.</p>;
  }

  const completion = topicCompletion(flashcards, progress, topic.id);

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href={`/subjects/${subject?.id}`} className="hover:text-primary">
          {subject?.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/subjects/${subject?.id}/units/${unit?.id}`} className="hover:text-primary">
          {unit?.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/lessons/${lesson?.id}`} className="hover:text-primary">
          {lesson?.title}
        </Link>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{topic.title}</h1>
          {topic.summary && <p className="mt-1 text-sm text-muted-foreground">{topic.summary}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="soft">{completion}% complete</Badge>
          <FavoriteButton itemType="topic" itemId={topic.id} />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)} className="w-full">
        <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
          <TabsList className="w-full min-w-max sm:w-auto">
            <TabsTrigger value="study">📖 Study</TabsTrigger>
            <TabsTrigger value="flashcards">🃏 Flashcards</TabsTrigger>
            <TabsTrigger value="quiz">📝 Quiz</TabsTrigger>
            <TabsTrigger value="notes">✏️ Notes</TabsTrigger>
            <TabsTrigger value="progress">📊 Progress</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="study">
          <StudyView topic={topic} />
        </TabsContent>
        <TabsContent value="flashcards">
          <FlashcardStudy topic={topic} />
        </TabsContent>
        <TabsContent value="quiz">
          <QuizRunner topicId={topic.id} topicTitle={topic.title} />
        </TabsContent>
        <TabsContent value="notes">
          <TopicNotes topic={topic} />
        </TabsContent>
        <TabsContent value="progress">
          <TopicProgress topic={topic} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
