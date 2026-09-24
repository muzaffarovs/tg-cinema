"use client";

import { useLibrary } from "@/lib/storage/library";
import { MediaCard } from "@/components/media/MediaCard";
import { HScroll, Section } from "@/components/media/Section";
import { RowSkeleton } from "@/components/ui/Skeletons";
import type { WatchlistEntry } from "@/types/library";
import type { MediaItem } from "@/types/media";

export function entryToItem(e: WatchlistEntry): MediaItem {
  return {
    id: e.id,
    mediaType: e.mediaType,
    title: e.title,
    overview: "",
    posterPath: e.posterPath,
    backdropPath: e.backdropPath,
    year: e.year,
    rating: 0,
    genreIds: [],
  };
}

export function MyListRow() {
  const { ready, watchlist } = useLibrary();
  if (!ready) return <RowSkeleton titleWidth="w-24" />;
  if (!watchlist.length) return null;
  return (
    <Section title="My List" href="/library">
      <HScroll>
        {watchlist.map((e) => (
          <MediaCard key={`${e.mediaType}-${e.id}`} item={entryToItem(e)} />
        ))}
      </HScroll>
    </Section>
  );
}
