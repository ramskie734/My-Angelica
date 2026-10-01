import type { ContinueState, RecentVisit } from "@/types";
import { LS_CONTINUE_KEY, LS_RECENT_KEY } from "@/constants";

/**
 * Smart Continue helpers. The last studied position is kept in localStorage so
 * the app reopens exactly where the student stopped, even offline.
 */

export function getContinue(): ContinueState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LS_CONTINUE_KEY);
    return raw ? (JSON.parse(raw) as ContinueState) : null;
  } catch {
    return null;
  }
}

export function saveContinue(state: ContinueState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_CONTINUE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private mode) - continue state simply won't persist.
  }
}

export function getRecent(): RecentVisit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_RECENT_KEY);
    return raw ? (JSON.parse(raw) as RecentVisit[]) : [];
  } catch {
    return [];
  }
}

export function pushRecent(visit: RecentVisit): void {
  if (typeof window === "undefined") return;
  try {
    const recent = getRecent().filter((v) => v.topicId !== visit.topicId);
    recent.unshift(visit);
    window.localStorage.setItem(LS_RECENT_KEY, JSON.stringify(recent.slice(0, 8)));
  } catch {
    // Ignore storage errors.
  }
}
