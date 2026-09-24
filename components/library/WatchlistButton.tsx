"use client";

import { isInWatchlist, toggleWatchlist, useLibrary } from "@/lib/storage/library";
import { haptic } from "@/lib/telegram/webapp";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";
import type { MediaItem } from "@/types/media";

type Props = {
  item: Pick<MediaItem, "id" | "mediaType" | "title" | "posterPath" | "backdropPath" | "year">;
  variant?: "icon" | "pill";
};

export function WatchlistButton({ item, variant = "icon" }: Props) {
  const library = useLibrary();
  const saved = isInWatchlist(library, item.mediaType, item.id);

  const onClick = () => {
    const added = toggleWatchlist({
      id: item.id,
      mediaType: item.mediaType,
      title: item.title,
      posterPath: item.posterPath,
      backdropPath: item.backdropPath,
      year: item.year,
    });
    haptic(added ? "success" : "light");
  };

  const label = saved ? "Remove from My List" : "Add to My List";
  const Icon = saved ? CheckIcon : PlusIcon;

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        disabled={!library.ready}
        className="flex h-11 items-center gap-2 rounded-full bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur transition active:scale-95 disabled:opacity-60"
      >
        <Icon size={18} />
        My List
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={saved}
      disabled={!library.ready}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition active:scale-90 disabled:opacity-60 ${
        saved ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg"
      }`}
    >
      <Icon size={20} />
    </button>
  );
}
