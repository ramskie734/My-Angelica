import { supabase } from "@/lib/supabase/client";
import type { Favorite, FavoriteType, Note, Profile, UserAchievement } from "@/types";

/** Favorites, notes, achievements and profile - all owned by the signed-in user. */

export async function getMyFavorites(): Promise<Favorite[]> {
  const { data } = await supabase.from("favorites").select("*");
  return (data ?? []) as Favorite[];
}

export async function toggleFavorite(
  itemType: FavoriteType,
  itemId: string,
  isFavorited: boolean
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (isFavorited) {
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("item_type", itemType)
      .eq("item_id", itemId);
  } else {
    await supabase.from("favorites").insert({ user_id: user.id, item_type: itemType, item_id: itemId });
  }
}

export async function getMyNote(topicId: string): Promise<string> {
  const { data } = await supabase
    .from("notes")
    .select("content")
    .eq("topic_id", topicId)
    .maybeSingle();
  return data?.content ?? "";
}

export async function saveMyNote(topicId: string, content: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from("notes")
    .upsert({ user_id: user.id, topic_id: topicId, content }, { onConflict: "user_id,topic_id" });
  if (error) throw new Error(error.message);
}

export async function getMyNotes(): Promise<Note[]> {
  const { data } = await supabase.from("notes").select("*");
  return (data ?? []) as Note[];
}

export async function getMyAchievements(): Promise<UserAchievement[]> {
  const { data } = await supabase.from("user_achievements").select("*");
  return (data ?? []) as UserAchievement[];
}

/** Insert any newly unlocked achievement ids; returns the ids that were just unlocked. */
export async function unlockAchievements(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase.from("user_achievements").select("achievement_id");
  const existing = new Set(((data ?? []) as UserAchievement[]).map((a) => a.achievement_id));
  const fresh = ids.filter((id) => !existing.has(id));
  if (fresh.length === 0) return [];

  const { error } = await supabase
    .from("user_achievements")
    .insert(fresh.map((achievement_id) => ({ user_id: user.id, achievement_id })));
  if (error) return [];
  return fresh;
}

export async function getMyProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile) ?? null;
}

export async function updateMyProfile(fullName: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
}
