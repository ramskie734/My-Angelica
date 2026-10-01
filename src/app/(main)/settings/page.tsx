"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BellRing, Download, Gauge, User } from "lucide-react";
import { useAppData } from "@/components/providers/app-data-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ensurePermission } from "@/services/notifications";
import { updateMyProfile, unlockAchievements } from "@/services/user-data";
import { updateMySettings } from "@/services/progress";
import { fadeUp } from "@/animations";
import { ACHIEVEMENTS } from "@/constants/achievements";

/** Settings: profile, daily goals, reminders, motion preference, install. */
export default function SettingsPage() {
  const { profile, settings, setSettings, achievements, refresh, refreshProgress } = useAppData();
  const [name, setName] = useState("");
  const [goalMinutes, setGoalMinutes] = useState(20);
  const [goalCards, setGoalCards] = useState(10);
  const [reminderTime, setReminderTime] = useState("19:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setName(profile.full_name ?? "");
    setGoalMinutes(settings.daily_goal_minutes);
    setGoalCards(settings.daily_goal_cards);
    setReminderTime(settings.reminder_time);
  }, [profile, settings]);

  const saveAll = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateMyProfile(name),
        updateMySettings({
          daily_goal_minutes: goalMinutes,
          daily_goal_cards: goalCards,
          reminder_time: reminderTime
        })
      ]);
      setSettings({ ...settings, daily_goal_minutes: goalMinutes, daily_goal_cards: goalCards, reminder_time: reminderTime });
      await refresh();
      toast.success("Settings saved 💖");
    } catch {
      toast.error("Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleReminders = async (enabled: boolean) => {
    if (enabled) {
      const granted = await ensurePermission();
      if (!granted) {
        toast.error("Notification permission is needed for reminders");
        return;
      }
    }
    await updateMySettings({ reminder_enabled: enabled });
    setSettings({ ...settings, reminder_enabled: enabled });
    toast.success(enabled ? "Daily reminders on 🔔" : "Reminders off");
  };

  const toggleMotion = async (reduced: boolean) => {
    await updateMySettings({ reduce_motion: reduced });
    setSettings({ ...settings, reduce_motion: reduced });
  };

  const installApp = async () => {
    const deferred = (window as unknown as { angelicaInstallPrompt?: { prompt: () => Promise<void> } }).angelicaInstallPrompt;
    if (deferred) {
      await deferred.prompt();
    } else {
      toast.info("Use your browser menu → 'Add to Home screen' / 'Install app'.");
    }
  };

  const checkAchievementsNow = async () => {
    const unlocked = await unlockAchievements(
      ACHIEVEMENTS.map((a) => a.id).filter((id) => !achievements.includes(id))
    );
    await refreshProgress();
    toast.success(unlocked.length > 0 ? `Unlocked ${unlocked.length} new achievement${unlocked.length > 1 ? "s" : ""}! 🏆` : "No new achievements yet - keep studying!");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Make Angelica yours.</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="flex items-center gap-2 font-semibold"><User className="h-4 w-4 text-primary" /> Profile</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              Signed in as {profile?.id ? "verified user" : "guest"} · role: {profile?.role ?? "user"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="flex items-center gap-2 font-semibold"><Gauge className="h-4 w-4 text-primary" /> Daily Goal</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="goal-min">Minutes per day</Label>
              <Input
                id="goal-min"
                type="number"
                min={5}
                max={480}
                value={goalMinutes}
                onChange={(e) => setGoalMinutes(parseInt(e.target.value, 10) || 20)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-cards">Flashcards per day</Label>
              <Input
                id="goal-cards"
                type="number"
                min={1}
                max={200}
                value={goalCards}
                onChange={(e) => setGoalCards(parseInt(e.target.value, 10) || 10)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="flex items-center gap-2 font-semibold"><BellRing className="h-4 w-4 text-primary" /> Notifications</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Daily study reminder</p>
              <p className="text-xs text-muted-foreground">A gentle nudge to keep your streak</p>
            </div>
            <Switch checked={settings.reminder_enabled} onCheckedChange={toggleReminders} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder-time">Reminder time</Label>
            <Input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Reduce motion</p>
              <p className="text-xs text-muted-foreground">Calmer animations</p>
            </div>
            <Switch checked={settings.reduce_motion} onCheckedChange={toggleMotion} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="flex items-center gap-2 font-semibold"><Download className="h-4 w-4 text-primary" /> App</h2>
          <p className="text-sm text-muted-foreground">
            Install My Angelica as an app for offline access and a home-screen icon.
          </p>
          <Button variant="outline" onClick={installApp}>Install as app</Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={checkAchievementsNow}>Check achievements</Button>
        <Button onClick={saveAll} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </motion.div>
  );
}
