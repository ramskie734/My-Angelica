"use client";

import { useEffect, useRef } from "react";
import { useAppData } from "@/components/providers/app-data-provider";
import { ensurePermission, minutesUntil, showNotification } from "@/services/notifications";

/**
 * Daily reminder scheduler. While the app is open (or installed in the
 * background on supporting devices) it fires the configured study reminder.
 */
export function ReminderScheduler() {
  const { settings, user, progress } = useAppData();
  const scheduledRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFiredRef = useRef<string>("");

  useEffect(() => {
    if (!user || !settings.reminder_enabled) {
      if (scheduledRef.current) clearTimeout(scheduledRef.current);
      return;
    }

    const fire = () => {
      const today = new Date().toDateString();
      if (lastFiredRef.current === today) return;
      const remaining = progress.filter((p) => p.status !== "mastered").length;
      showNotification(
        "Time to study 💖",
        remaining > 0
          ? `You still have ${remaining} flashcards to master. Keep your streak alive!`
          : "Keep your streak alive with a quick review session!"
      );
      lastFiredRef.current = today;
    };

    ensurePermission();
    const delayMs = minutesUntil(settings.reminder_time) * 60 * 1000;
    scheduledRef.current = setTimeout(fire, Math.min(delayMs, 2 ** 31 - 1));

    return () => {
      if (scheduledRef.current) clearTimeout(scheduledRef.current);
    };
  }, [user, settings.reminder_enabled, settings.reminder_time, progress]);

  return null;
}
