"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAppData } from "@/components/providers/app-data-provider";
import {
  createSubject,
  createUnit,
  createLesson,
  createTopic,
  createFlashcards,
  createQuizQuestion,
  uploadTopicImage,
  getAllProfiles,
  getAccountProgressSnapshot
} from "@/services/admin";
import { QUESTION_TYPE_LABELS } from "@/constants";
import type { Profile, QuestionType } from "@/types";

/**
 * Admin content-management forms. Each form refreshes the shared app data so
 * the new content is immediately visible everywhere.
 */
export function AdminForms({ onDone }: { onDone: () => Promise<void> }) {
  const [tab, setTab] = useState<"structure" | "flashcards" | "quiz">("structure");

  return (
    <div className="space-y-4">
      <Select value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="structure">Structure (subject → topic)</SelectItem>
          <SelectItem value="flashcards">Flashcards</SelectItem>
          <SelectItem value="quiz">Quiz questions</SelectItem>
        </SelectContent>
      </Select>

      {tab === "structure" && <StructureForms onDone={onDone} />}
      {tab === "flashcards" && <FlashcardsForm onDone={onDone} />}
      {tab === "quiz" && <QuizForm onDone={onDone} />}
    </div>
  );
}

function useAdminData() {
  const { subjects, units, lessons, topics } = useAppData();
  return { subjects, units, lessons, topics };
}

function StructureForms({ onDone }: { onDone: () => Promise<void> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SubjectForm onDone={onDone} />
      <UnitForm onDone={onDone} />
      <LessonForm onDone={onDone} />
      <TopicForm onDone={onDone} />
    </div>
  );
}

function SubjectForm({ onDone }: { onDone: () => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📘");
  const [color, setColor] = useState("#EC4899");
  const [busy, setBusy] = useState(false);

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">New Subject</CardTitle></CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await createSubject({ title, description, emoji, color });
              setTitle("");
              setDescription("");
              await onDone();
              toast.success("Subject created");
            } catch (err) {
              toast.error((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Subject title (e.g. Cruise Tourism)" />
          <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="Emoji (e.g. 🚢)" maxLength={4} />
          <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} />
          <Button type="submit" disabled={busy} className="w-full">
            <PlusCircle className="h-4 w-4" /> Create subject
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function UnitForm({ onDone }: { onDone: () => Promise<void> }) {
  const { subjects } = useAdminData();
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(1);
  const [busy, setBusy] = useState(false);

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">New Unit</CardTitle></CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await createUnit(subjectId, title, undefined, order);
              setTitle("");
              await onDone();
              toast.success("Unit created");
            } catch (err) {
              toast.error((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger><SelectValue placeholder="Choose a subject" /></SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.emoji} {s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Unit title (e.g. Unit 1: The Cruise Ship)" />
          <Input type="number" min={1} value={order} onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)} />
          <Button type="submit" disabled={busy || !subjectId} className="w-full">
            <PlusCircle className="h-4 w-4" /> Create unit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function LessonForm({ onDone }: { onDone: () => Promise<void> }) {
  const { subjects, units } = useAdminData();
  const [unitId, setUnitId] = useState("");
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(1);
  const [busy, setBusy] = useState(false);

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">New Lesson</CardTitle></CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await createLesson(unitId, title, undefined, order);
              setTitle("");
              await onDone();
              toast.success("Lesson created");
            } catch (err) {
              toast.error((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Select value={unitId} onValueChange={setUnitId}>
            <SelectTrigger><SelectValue placeholder="Choose a unit" /></SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {subjects.find((s) => s.id === u.subject_id)?.title} → {u.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lesson title" />
          <Input type="number" min={1} value={order} onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)} />
          <Button type="submit" disabled={busy || !unitId} className="w-full">
            <PlusCircle className="h-4 w-4" /> Create lesson
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function TopicSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { lessons, topics } = useAdminData();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Choose a topic" /></SelectTrigger>
      <SelectContent>
        {topics.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            {lessons.find((l) => l.id === t.lesson_id)?.title} → {t.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TopicForm({ onDone }: { onDone: () => Promise<void> }) {
  const { lessons } = useAdminData();
  const [lessonId, setLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [explanation, setExplanation] = useState("");
  const [teacherNotes, setTeacherNotes] = useState("");
  const [reminders, setReminders] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [order, setOrder] = useState(1);
  const [busy, setBusy] = useState(false);

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">New Topic</CardTitle></CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              let imageUrl: string | null = null;
              if (image) imageUrl = await uploadTopicImage(image);
              await createTopic(
                lessonId,
                { title, summary, explanation, teacherNotes, importantReminders: reminders, imageUrl },
                order
              );
              setTitle("");
              setSummary("");
              setExplanation("");
              setTeacherNotes("");
              setReminders("");
              setImage(null);
              await onDone();
              toast.success("Topic created");
            } catch (err) {
              toast.error((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Select value={lessonId} onValueChange={setLessonId}>
            <SelectTrigger><SelectValue placeholder="Choose a lesson" /></SelectTrigger>
            <SelectContent>
              {lessons.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Topic title" />
          <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" rows={2} />
          <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explanation (study notes - blank line between paragraphs)" rows={5} />
          <Textarea value={teacherNotes} onChange={(e) => setTeacherNotes(e.target.value)} placeholder="Teacher notes" rows={2} />
          <Textarea value={reminders} onChange={(e) => setReminders(e.target.value)} placeholder="Important reminders" rows={2} />
          <div className="space-y-1">
            <Label htmlFor="topic-image">Optional topic image</Label>
            <Input id="topic-image" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
          </div>
          <Input type="number" min={1} value={order} onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)} />
          <Button type="submit" disabled={busy || !lessonId} className="w-full">
            <PlusCircle className="h-4 w-4" /> Create topic
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function FlashcardsForm({ onDone }: { onDone: () => Promise<void> }) {
  const [topicId, setTopicId] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [bulk, setBulk] = useState("");
  const [busy, setBusy] = useState(false);

  const addOne = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createFlashcards(topicId, [{ front: front.trim(), back: back.trim() }]);
      setFront("");
      setBack("");
      await onDone();
      toast.success("Flashcard created");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const addBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const cards = bulk
        .split("\n")
        .map((line) => line.split("|"))
        .filter((parts) => parts.length >= 2)
        .map((parts) => ({ front: parts[0].trim(), back: parts.slice(1).join("|").trim() }));
      if (cards.length === 0) throw new Error("Use the format: front | back");
      await createFlashcards(topicId, cards);
      setBulk("");
      await onDone();
      toast.success(`Created ${cards.length} flashcards`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Add one flashcard</CardTitle></CardHeader>
        <CardContent>
          <TopicSelect value={topicId} onChange={setTopicId} />
          <form onSubmit={addOne} className="mt-3 space-y-3">
            <Input required value={front} onChange={(e) => setFront(e.target.value)} placeholder="Front (question / term)" />
            <Input required value={back} onChange={(e) => setBack(e.target.value)} placeholder="Back (answer / definition)" />
            <Button type="submit" disabled={busy || !topicId} className="w-full">Add flashcard</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bulk add</CardTitle>
          <p className="text-xs text-muted-foreground">One card per line: <code>front | back</code></p>
        </CardHeader>
        <CardContent>
          <TopicSelect value={topicId} onChange={setTopicId} />
          <form onSubmit={addBulk} className="mt-3 space-y-3">
            <Textarea
              required
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              rows={8}
              placeholder={"Bridge | The command center of the ship\nCabin | A passenger room"}
            />
            <Button type="submit" disabled={busy || !topicId} className="w-full">Add all cards</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function QuizForm({ onDone }: { onDone: () => Promise<void> }) {
  const [topicId, setTopicId] = useState("");
  const [type, setType] = useState<QuestionType>("multiple_choice");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState("");
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      let parsedOptions: string[] | null = null;
      let parsedAnswer: unknown = answer.trim();

      if (type === "multiple_choice") {
        parsedOptions = options.split("\n").map((o) => o.trim()).filter(Boolean);
        if (!parsedOptions.includes(answer.trim())) {
          throw new Error("The correct answer must exactly match one of the options");
        }
      } else if (type === "enumeration" || type === "fill_blank") {
        parsedAnswer = answer.split("\n").map((a) => a.trim()).filter(Boolean);
      } else if (type === "matching") {
        parsedAnswer = options
          .split("\n")
          .map((line) => line.split("|"))
          .filter((p) => p.length >= 2)
          .map((p) => ({ left: p[0].trim(), right: p[1].trim() }));
      } else if (type === "true_false") {
        parsedAnswer = answer.trim().toLowerCase() === "true";
      }

      await createQuizQuestion(topicId, {
        questionType: type,
        question,
        options: parsedOptions,
        answer: parsedAnswer,
        points:
          type === "enumeration" || type === "matching"
            ? Array.isArray(parsedAnswer)
              ? parsedAnswer.length
              : 1
            : 1,
        explanation
      });
      setQuestion("");
      setOptions("");
      setAnswer("");
      setExplanation("");
      await onDone();
      toast.success("Quiz question created");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader><CardTitle className="text-base">New Quiz Question</CardTitle></CardHeader>
      <CardContent>
        <TopicSelect value={topicId} onChange={setTopicId} />
        <form onSubmit={submit} className="mt-3 space-y-3">
          <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((t) => (
                <SelectItem key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea required value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="The question" rows={2} />
          {(type === "multiple_choice" || type === "matching") && (
            <Textarea
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              placeholder={
                type === "multiple_choice"
                  ? "One option per line (e.g. The bridge)"
                  : "One pair per line: left | right"
              }
              rows={4}
            />
          )}
          <Textarea
            required={type !== "matching"}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={
              type === "multiple_choice"
                ? "The exact correct option"
                : type === "true_false"
                  ? "true or false"
                  : type === "identification"
                    ? "The accepted answer"
                    : type === "enumeration"
                      ? "One accepted answer per line"
                      : type === "fill_blank"
                        ? "Accepted answers, one per line"
                        : "Not used - the pairs above define the answers"
            }
            rows={type === "enumeration" || type === "fill_blank" ? 4 : 1}
          />
          <Input
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explanation shown in Review Wrong Answers (optional)"
          />
          <Button type="submit" disabled={busy || !topicId} className="w-full">
            Create question
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/** Users & progress table for the admin panel. */
export function AdminUsersTable() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [snap, setSnap] = useState<{ userId: string; mastered: number; reviewed: number }[]>([]);

  useEffect(() => {
    Promise.all([getAllProfiles(), getAccountProgressSnapshot()])
      .then(([p, s]) => {
        setProfiles(p);
        setSnap(s);
      })
      .catch(() => toast.error("Could not load users"));
  }, []);

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Users &amp; Progress</CardTitle></CardHeader>
      <CardContent>
        {!profiles && <p className="text-sm text-muted-foreground">Loading users…</p>}
        {profiles && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Cards reviewed</th>
                  <th className="py-2">Mastered</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => {
                  const s = snap.find((x) => x.userId === p.id);
                  return (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-2.5 pr-4 font-medium">{p.full_name ?? "—"}</td>
                      <td className="py-2.5 pr-4">
                        <span className="text-xs font-semibold text-primary">{p.role}</span>
                      </td>
                      <td className="py-2.5 pr-4">{s?.reviewed ?? 0}</td>
                      <td className="py-2.5">{s?.mastered ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
