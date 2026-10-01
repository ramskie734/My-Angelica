import { BookOpen, BookPlus, Heart, Home, Search, BarChart3, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Primary navigation shared by the header and the mobile bottom bar. */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Subjects", href: "/subjects", icon: BookOpen },
  { label: "Favorites", href: "/favorites", icon: Heart },
  { label: "Progress", href: "/progress", icon: BarChart3 },
  { label: "Search", href: "/search", icon: Search },
  { label: "Create", href: "/admin", icon: BookPlus }
];

export const SETTINGS_NAV: NavItem = { label: "Settings", href: "/settings", icon: Settings };

export const APP_NAME = "My Angelica";

/**
 * The app's one fixed account. The login form accepts any typing style for
 * this account (with or without @ or domain) and resolves it to this email,
 * since Supabase requires a valid email internally.
 */
export const FIXED_ACCOUNT_EMAIL = "rhiannekenrama@gmail.com";

/** Human labels for the four mastery levels. */
export const MASTERY_LABELS: Record<string, string> = {
  new: "New",
  learning: "Learning",
  almost_mastered: "Almost Mastered",
  mastered: "Mastered"
};

/** Soft color accents used for mastery chips. */
export const MASTERY_COLORS: Record<string, string> = {
  new: "bg-muted text-muted-foreground",
  learning: "bg-lavender-soft text-lavender-deep",
  almost_mastered: "bg-blush text-pink-600",
  mastered: "bg-emerald-50 text-emerald-600"
};

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  true_false: "True or False",
  identification: "Identification",
  enumeration: "Enumeration",
  fill_blank: "Fill in the Blank",
  matching: "Matching Type"
};

/** Local storage keys used for Smart Continue and history. */
export const LS_CONTINUE_KEY = "angelica:continue";
export const LS_RECENT_KEY = "angelica:recent";
export const LS_REMEMBER_KEY = "angelica:remember-email";
