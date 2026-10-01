"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { getMyNote, saveMyNote } from "@/services/user-data";
import { toast } from "sonner";
import { fadeUp } from "@/animations";
import type { Topic } from "@/types";

/**
 * Notes tab: personal notes (auto-saved per topic), the teacher's tips, and the
 * topic's important reminders - all in one place.
 */
export function TopicNotes({ topic }: { topic: Topic }) {
  const [content, setContent] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const debounced = useDebounce(content, 700);
  const lastSaved = useRef("");

  useEffect(() => {
    getMyNote(topic.id).then((note) => {
      setContent(note);
      lastSaved.current = note;
      setLoaded(true);
    });
  }, [topic.id]);

  useEffect(() => {
    if (!loaded || debounced === lastSaved.current) return;
    saveMyNote(topic.id, debounced)
      .then(() => {
        lastSaved.current = debounced;
      })
      .catch(() => toast.error("Could not save your note"));
  }, [debounced, loaded, topic.id]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">✏️ My Notes</h2>
            <Badge variant="soft">Auto-saved</Badge>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your own notes for this topic…"
            className="min-h-[140px]"
          />
        </CardContent>
      </Card>

      {topic.teacher_notes && (
        <Card className="border-secondary/40">
          <CardContent className="p-6">
            <h2 className="mb-2 font-semibold">🍎 Teacher Tips</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {topic.teacher_notes}
            </p>
          </CardContent>
        </Card>
      )}

      {topic.important_reminders && (
        <Card className="border-primary/30">
          <CardContent className="p-6">
            <h2 className="mb-2 font-semibold">⭐ Important Reminders</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {topic.important_reminders}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
