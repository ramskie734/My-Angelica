"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  DEFAULT_SETTINGS,
  getMyAttempts,
  getMySessions,
  getMySettings,
  getMyProgress
} from "@/services/progress";
import {
  getFlashcards,
  getLessons,
  getSubjects,
  getTopics,
  getUnits
} from "@/services/content";
import {
  getMyAchievements,
  getMyFavorites,
  getMyNotes,
  getMyProfile
} from "@/services/user-data";
import type {
  AppUser,
  Favorite,
  Flashcard,
  FlashcardProgress,
  Lesson,
  Note,
  Profile,
  QuizAttempt,
  StudySession,
  Subject,
  Topic,
  Unit,
  UserSettings
} from "@/types";

/**
 * Central client-side data provider. Loads the user's account (profile,
 * settings, content tree, progress, attempts, favorites, notes, sessions,
 * achievements) once per session and exposes helpers to refresh it. Every
 * page consumes this context instead of issuing its own queries.
 */

interface AppDataValue {
  user: AppUser | null;
  profile: Profile | null;
  isAdmin: boolean;
  settings: UserSettings;
  subjects: Subject[];
  units: Unit[];
  lessons: Lesson[];
  topics: Topic[];
  flashcards: Flashcard[];
  progress: FlashcardProgress[];
  attempts: QuizAttempt[];
  favorites: Favorite[];
  notes: Note[];
  sessions: StudySession[];
  achievements: string[];
  loading: boolean;
  refresh: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  setSettings: (next: UserSettings) => void;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [progress, setProgress] = useState<FlashcardProgress[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const loadRef = useRef(0);

  const load = useCallback(async () => {
    const ticket = ++loadRef.current;
    setLoading(true);
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);

    if (!u) {
      setProfile(null);
      setSubjects([]);
      setUnits([]);
      setLessons([]);
      setTopics([]);
      setFlashcards([]);
      setProgress([]);
      setAttempts([]);
      setFavorites([]);
      setNotes([]);
      setSessions([]);
      setAchievements([]);
      setLoading(false);
      return;
    }

    try {
      const [p, s, un, les, top, cards, prog, att, fav, not, sess, set, ach] = await Promise.all([
        getMyProfile(),
        getSubjects(),
        getUnits(),
        getLessons(),
        getTopics(),
        getFlashcards(),
        getMyProgress(),
        getMyAttempts(),
        getMyFavorites(),
        getMyNotes(),
        getMySessions(),
        getMySettings(),
        getMyAchievements()
      ]);
      if (ticket !== loadRef.current) return;
      setProfile(p);
      setSubjects(s);
      setUnits(un);
      setLessons(les);
      setTopics(top);
      setFlashcards(cards);
      setProgress(prog);
      setAttempts(att);
      setFavorites(fav);
      setNotes(not);
      setSessions(sess);
      setSettings(set);
      setAchievements(ach.map((a) => a.achievement_id));
    } finally {
      if (ticket === loadRef.current) setLoading(false);
    }
  }, []);

  const refreshProgress = useCallback(async () => {
    const [prog, att, ach, sess] = await Promise.all([
      getMyProgress(),
      getMyAttempts(),
      getMyAchievements(),
      getMySessions()
    ]);
    setProgress(prog);
    setAttempts(att);
    setAchievements(ach.map((a) => a.achievement_id));
    setSessions(sess);
  }, []);

  const refresh = useCallback(async () => {
    const [s, un, les, top, cards] = await Promise.all([
      getSubjects(),
      getUnits(),
      getLessons(),
      getTopics(),
      getFlashcards()
    ]);
    setSubjects(s);
    setUnits(un);
    setLessons(les);
    setTopics(top);
    setFlashcards(cards);
    await refreshProgress();
    const [fav, not] = await Promise.all([getMyFavorites(), getMyNotes()]);
    setFavorites(fav);
    setNotes(not);
  }, [refreshProgress]);

  useEffect(() => {
    load();
  }, [load]);

  // React to sign-in / sign-out from any tab or the auth pages.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        router.replace("/auth/login");
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        load();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [load, router]);

  // Reload when returning to the app via the browser back button (ensures
  // progress made in another tab appears).
  useEffect(() => {
    const onFocus = () => refreshProgress();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshProgress]);

  const value = useMemo<AppDataValue>(
    () => ({
      user,
      profile,
      isAdmin: profile?.role === "admin",
      settings,
      subjects,
      units,
      lessons,
      topics,
      flashcards,
      progress,
      attempts,
      favorites,
      notes,
      sessions,
      achievements,
      loading,
      refresh,
      refreshProgress,
      setSettings
    }),
    [
      user, profile, settings, subjects, units, lessons, topics, flashcards,
      progress, attempts, favorites, notes, sessions, achievements, loading,
      refresh, refreshProgress
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
