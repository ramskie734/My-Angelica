"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search as SearchIcon, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { globalSearch, type SearchResults } from "@/services/search";
import { useAppData } from "@/components/providers/app-data-provider";
import { QUESTION_TYPE_LABELS } from "@/constants";
import { fadeUp } from "@/animations";

const EMPTY: SearchResults = {
  subjects: [], lessons: [], topics: [], flashcards: [], notes: [], definitions: [], questions: []
};

/** Global search: subjects, lessons, topics, flashcards, notes and quiz questions. */
export default function SearchPage() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [searching, setSearching] = useState(false);
  const debounced = useDebounce(term, 350);
  const { topics } = useAppData();

  useEffect(() => {
    let cancelled = false;
    if (debounced.trim().length < 2) {
      setResults(EMPTY);
      setSearching(false);
      return;
    }
    setSearching(true);
    globalSearch(debounced).then((r) => {
      if (!cancelled) {
        setResults(r);
        setSearching(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const total =
    results.subjects.length + results.lessons.length + results.topics.length +
    results.flashcards.length + results.notes.length + results.questions.length;

  const section = (title: string, count: number, children: React.ReactNode) =>
    count > 0 ? (
      <motion.section variants={fadeUp}>
        <h2 className="mb-2 font-semibold">
          {title}{" "}
          <span className="text-sm font-normal text-muted-foreground">({count})</span>
        </h2>
        <div className="space-y-2">{children}</div>
      </motion.section>
    ) : null;

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search everything: subjects, topics, flashcards, notes and quizzes.
        </p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Type at least 2 letters…"
          className="h-12 rounded-2xl pl-10 text-base"
          autoFocus
        />
      </div>

      {searching && <p className="text-sm text-muted-foreground">Searching…</p>}

      {!searching && debounced.trim().length >= 2 && total === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No matches for &ldquo;{debounced}&rdquo;. Try another word.
        </p>
      )}

      {debounced.trim().length < 2 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Start typing to search across all your subjects 💖
        </p>
      )}

      <motion.div variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="space-y-5">
        {section("Subjects", results.subjects.length,
          results.subjects.map((s) => (
            <Link key={s.id} href={`/subjects/${s.id}`}>
              <Card className="transition-all hover:shadow-lift">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="flex-1 truncate font-medium">{s.title}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))
        )}

        {section("Lessons", results.lessons.length,
          results.lessons.map((l) => (
            <Link key={l.id} href={`/lessons/${l.id}`}>
              <Card className="transition-all hover:shadow-lift">
                <CardContent className="p-4">
                  <span className="font-medium">{l.title}</span>
                  {l.description && <p className="text-xs text-muted-foreground">{l.description}</p>}
                </CardContent>
              </Card>
            </Link>
          ))
        )}

        {section("Topics", results.topics.length,
          results.topics.map((t) => (
            <Link key={t.id} href={`/topics/${t.id}`}>
              <Card className="transition-all hover:shadow-lift">
                <CardContent className="p-4">
                  <span className="font-medium">{t.title}</span>
                  {t.summary && <p className="text-xs text-muted-foreground">{t.summary}</p>}
                </CardContent>
              </Card>
            </Link>
          ))
        )}

        {section("Flashcards & Definitions", results.flashcards.length,
          results.flashcards.map((c) => (
            <Link key={c.id} href={`/topics/${c.topic_id}?tab=flashcards`}>
              <Card className="transition-all hover:shadow-lift">
                <CardContent className="p-4">
                  <span className="font-medium">{c.front}</span>
                  <p className="text-xs text-muted-foreground">{c.back}</p>
                  {topics.find((t) => t.id === c.topic_id) && (
                    <Badge variant="soft" className="mt-2">
                      {topics.find((t) => t.id === c.topic_id)!.title}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        )}

        {section("Notes", results.notes.length,
          results.notes.map((n, i) => (
            <Link key={`${n.topic_id}-${i}`} href={`/topics/${n.topic_id}?tab=notes`}>
              <Card className="transition-all hover:shadow-lift">
                <CardContent className="p-4">
                  <p className="line-clamp-2 text-sm">{n.content}</p>
                  <Badge variant="soft" className="mt-2">Personal note</Badge>
                </CardContent>
              </Card>
            </Link>
          ))
        )}

        {section("Quiz Questions", results.questions.length,
          results.questions.map((q) => (
            <Link key={q.id} href={`/topics/${q.topic_id}?tab=quiz`}>
              <Card className="transition-all hover:shadow-lift">
                <CardContent className="p-4">
                  <span className="font-medium">{q.question}</span>
                  <Badge variant="secondary" className="mt-2">
                    {QUESTION_TYPE_LABELS[q.question_type]}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
