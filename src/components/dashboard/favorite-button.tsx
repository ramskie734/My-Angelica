"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "@/components/providers/app-data-provider";
import { toggleFavorite } from "@/services/user-data";
import type { FavoriteType } from "@/types";
import { cn } from "@/lib/utils";

/** Heart toggle used on subjects, lessons, topics and flashcards. */
export function FavoriteButton({
  itemType,
  itemId,
  className
}: {
  itemType: FavoriteType;
  itemId: string;
  className?: string;
}) {
  const { favorites, refresh } = useAppData();
  const isFavorited = favorites.some((f) => f.item_type === itemType && f.item_id === itemId);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFavorite(itemType, itemId, isFavorited);
      await refresh();
      toast.success(isFavorited ? "Removed from favorites" : "Added to favorites 💖");
    } catch {
      toast.error("Could not update favorites");
    }
  };

  return (
    <button
      onClick={onClick}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "rounded-full p-2 transition-colors hover:bg-accent",
        isFavorited ? "text-primary" : "text-muted-foreground",
        className
      )}
    >
      <Heart className={`h-5 w-5 ${isFavorited ? "fill-primary" : ""}`} />
    </button>
  );
}
