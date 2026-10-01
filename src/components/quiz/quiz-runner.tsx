"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Timer, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAppData } from "@/components/providers/app-data-provider";
import { getQuestionsForTopic } from "@/services/content";
import { saveQuizAttempt, logStudySession } from "@/services/progress";
import { gradeAttempt, shuffledRights } from "@/lib/quiz";
import { QUESTION_TYPE_LABELS } from "@/constants";
import { formatDuration, shuffle } from "@/lib/utils";
import { fadeUp } from "@/animations";
import type { MatchPair, QuizQuestion, QuizQuestionDetail } from "@/types";

type Phase = "intro" | "running" | "results" | "review";

/**
 * Topic-scoped quiz. Supports multiple choice, true/false, identification,
 * enumeration (partial credit), matching type (partial credit), fill in the
 * blank, and a random mixed order. After grading it shows score, percentage,
 * time, correct / wrong / skipped, with Review Wrong Answers, Retry and
 * Back to Topic.
 */
export function QuizRunner({ topicId, topicTitle }: { topicId: string; topicTitle: string }) {
  const { refreshProgress } = useAppData();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [startedAt, setStartedAt] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<{
    details: QuizQuestionDetail[];
    score: number;
    totalPoints: number;
    percentage: number;
    correctCount: number;
    wrongCount: number;
    skippedCount: number;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getQuestionsForTopic(topicId)
      .then((q) => setQuestions(q))
      .catch(() => toast.error("Could not load quiz questions"));
  }, [topicId]);

  // Live timer while running.
  useEffect(() => {
    if (phase === "running") {
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase, startedAt]);

  const question = questions[index];
  const answeredCount = Object.entries(answers).filter(
    ([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.every((x) => String(x).trim() === ""))
  ).length;

  const startQuiz = () => {
    setQuestions((prev) => shuffle(prev)); // Random mixed quiz order.
    setAnswers({});
    setIndex(0);
    setElapsed(0);
    setStartedAt(Date.now());
    setResult(null);
    setPhase("running");
  };

  const setAnswer = (id: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const submit = async () => {
    const graded = gradeAttempt(questions, answers);
    const timeSeconds = Math.round((Date.now() - startedAt) / 1000);
    setResult(graded);
    setPhase("results");
    try {
      await saveQuizAttempt({
        topic_id: topicId,
        score: graded.score,
        total_points: graded.totalPoints,
        percentage: graded.percentage,
        time_seconds: timeSeconds,
        correct_count: graded.correctCount,
        wrong_count: graded.wrongCount,
        skipped_count: graded.skippedCount,
        details: graded.details
      });
      await logStudySession(topicId, "quiz", timeSeconds);
      await refreshProgress();
    } catch {
      toast.error("Could not save your quiz result");
    }
  };

  if (questions.length === 0 && phase === "intro") {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            This topic has no quiz questions yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mx-auto max-w-2xl space-y-4">
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div key="intro" {...fadeSlide}>
            <Card className="shadow-lift">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <span className="text-4xl">📝</span>
                <h2 className="text-xl font-bold">Quiz: {topicTitle}</h2>
                <p className="max-w-md text-sm text-muted-foreground">
                  {questions.length} questions in random mixed order - multiple choice, true/false,
                  identification, enumeration, matching and fill in the blank. Partial credit applies
                  to enumeration and matching.
                </p>
                <Button size="lg" className="rounded-2xl" onClick={startQuiz}>
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {phase === "running" && question && (
          <motion.div key={`q-${question.id}`} {...fadeSlide}>
            <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Question {index + 1} of {questions.length}
              </span>
              <span className="flex items-center gap-1.5">
                <Timer className="h-4 w-4" /> {formatDuration(elapsed)}
              </span>
            </div>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-3">
                  {QUESTION_TYPE_LABELS[question.question_type]}
                </Badge>
                <h2 className="text-lg font-semibold leading-snug">{question.question}</h2>

                <div className="mt-5">
                  <QuestionInput
                    question={question}
                    value={answers[question.id]}
                    onChange={(v) => setAnswer(question.id, v)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                disabled={index === 0}
                onClick={() => setIndex((i) => i - 1)}
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                {answeredCount}/{questions.length} answered
              </span>
              {index < questions.length - 1 ? (
                <Button onClick={() => setIndex((i) => i + 1)}>
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={submit}>
                  <Check className="h-4 w-4" /> Submit
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {phase === "results" && result && (
          <motion.div key="results" {...fadeSlide}>
            <Card className="shadow-lift">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                  <Trophy className="h-7 w-7 text-primary" />
                </span>
                <h2 className="text-2xl font-bold">{result.percentage}%</h2>
                <p className="text-sm text-muted-foreground">
                  Score {result.score} / {result.totalPoints} points
                </p>
                <div className="grid w-full grid-cols-4 gap-2">
                  <Stat label="Time" value={formatDuration(elapsed)} />
                  <Stat label="Correct" value={result.correctCount} />
                  <Stat label="Wrong" value={result.wrongCount} />
                  <Stat label="Skipped" value={result.skippedCount} />
                </div>
                <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
                  {result.wrongCount + result.skippedCount > 0 && (
                    <Button
                      variant="outline"
                      className="flex-1 rounded-2xl"
                      onClick={() => setPhase("review")}
                    >
                      Review Wrong Answers
                    </Button>
                  )}
                  <Button variant="secondary" className="flex-1 rounded-2xl" onClick={startQuiz}>
                    <RotateCcw className="h-4 w-4" /> Retry Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {phase === "review" && result && (
          <motion.div key="review" {...fadeSlide}>
            <h2 className="mb-3 text-lg font-bold">Wrong &amp; Skipped Answers</h2>
            <div className="space-y-3">
              {result.details
                .filter((d) => !d.is_correct)
                .map((d) => (
                  <Card key={d.question_id} className="border-destructive/30">
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-2">
                        {QUESTION_TYPE_LABELS[d.question_type]}
                      </Badge>
                      <p className="font-medium">{d.question}</p>
                      <p className="mt-2 text-sm text-destructive">
                        Your answer: {formatGiven(d)}
                      </p>
                      <p className="mt-1 text-sm text-emerald-600">
                        Correct answer: {formatCorrect(d)}
                      </p>
                      {d.explanation && (
                        <p className="mt-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                          {d.explanation}
                        </p>
                      )}
                      <p className="mt-2 text-xs font-medium text-muted-foreground">
                        Earned {d.earned} / {d.max} points
                      </p>
                    </CardContent>
                  </Card>
                ))}
              {result.details.filter((d) => !d.is_correct).length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-sm text-muted-foreground">
                    Nothing to review - everything was correct! 🎉
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => setPhase("results")}>
                <ArrowLeft className="h-4 w-4" /> Back to results
              </Button>
              <Button variant="secondary" className="flex-1" onClick={startQuiz}>
                <RotateCcw className="h-4 w-4" /> Retry Quiz
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const fadeSlide = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: "easeOut" as const }
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

/** Renders the correct input for each question type. */
function QuestionInput({
  question,
  value,
  onChange
}: {
  question: QuizQuestion;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  // Match options are shuffled once per question, not per render.
  const matchRights = useMemo(
    () => shuffledRights((question.answer as MatchPair[]) ?? []),
    [question.id]
  );

  switch (question.question_type) {
    case "multiple_choice": {
      const options = (question.options as string[]) ?? [];
      return (
        <div className="grid gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`rounded-xl border p-3.5 text-left text-sm font-medium transition-all ${
                value === opt
                  ? "border-primary bg-accent text-primary shadow-soft"
                  : "border-input bg-card hover:border-primary/50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }

    case "true_false": {
      const selected = value as boolean | undefined;
      return (
        <div className="grid grid-cols-2 gap-3">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => onChange(v)}
              className={`rounded-2xl border p-5 text-base font-semibold transition-all ${
                selected === v
                  ? "border-primary bg-accent text-primary shadow-soft"
                  : "border-input bg-card hover:border-primary/50"
              }`}
            >
              {v ? "True" : "False"}
            </button>
          ))}
        </div>
      );
    }

    case "identification":
    case "fill_blank": {
      return (
        <div className="space-y-2">
          <Label htmlFor="identification-answer">Your answer</Label>
          <Input
            id="identification-answer"
            value={(value as string) ?? ""}
            placeholder="Type your answer"
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    }

    case "enumeration": {
      const answers = (value as string[]) ?? [];
      const expectedCount = (Array.isArray(question.answer) ? question.answer.length : 1);
      const list = answers.length > 0 ? answers : [""];
      return (
        <div className="space-y-2">
          {list.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-sm text-muted-foreground">{i + 1}.</span>
              <Input
                value={item}
                placeholder={`Answer ${i + 1}`}
                onChange={(e) => {
                  const next = [...list];
                  next[i] = e.target.value;
                  onChange(next);
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange([...list, ""])}
            disabled={list.length >= expectedCount + 2}
          >
            Add another answer
          </Button>
          <p className="text-xs text-muted-foreground">
            {expectedCount} item{expectedCount > 1 ? "s" : ""} expected. Partial credit applies.
          </p>
        </div>
      );
    }

    case "matching": {
      const pairs = (question.answer as MatchPair[]) ?? [];
      const rights = matchRights;
      const given = (value as Record<string, string>) ?? {};
      return (
        <div className="space-y-2">
          {pairs.map((pair, i) => (
            <div key={`${pair.left}-${i}`} className="flex items-center gap-2">
              <span className="w-32 shrink-0 text-sm font-medium">{pair.left}</span>
              <span className="text-muted-foreground">→</span>
              <Select
                value={given[pair.left] ?? ""}
                onValueChange={(v) => onChange({ ...given, [pair.left]: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  {rights.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Partial credit applies.</p>
        </div>
      );
    }

    default:
      return null;
  }
}

function formatGiven(d: QuizQuestionDetail): string {
  if (d.given === null || d.given === undefined || d.given === "") return "(skipped)";
  if (Array.isArray(d.given)) return d.given.filter(Boolean).join(", ") || "(skipped)";
  if (typeof d.given === "boolean") return d.given ? "True" : "False";
  if (typeof d.given === "object") {
    return Object.entries(d.given as Record<string, string>)
      .map(([k, v]) => `${k} → ${v}`)
      .join(", ");
  }
  return String(d.given);
}

function formatCorrect(d: QuizQuestionDetail): string {
  const a = d.correct_answer;
  if (Array.isArray(a)) return a.map(String).join(", ");
  if (typeof a === "boolean") return a ? "True" : "False";
  if (a && typeof a === "object") {
    return (a as MatchPair[]).map((p) => `${p.left} → ${p.right}`).join(", ");
  }
  return String(a);
}
