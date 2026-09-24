"use client";

import Link from "next/link";
import { useLibrary } from "@/lib/storage/library";
import { MediaGrid } from "@/components/media/MediaGrid";
import { GridSkeleton } from "@/components/ui/Skeletons";
import { BookmarkIcon } from "@/components/ui/icons";
import { ContinueWatchingRow } from "./ContinueWatchingRow";
import { entryToItem } from "./MyListRow";

export function LibraryView() {
  const { ready, watchlist } = useLibrary();
  return (
    <>
      <ContinueWatchingRow />
      <section className="mt-7">
        <h2 className="mb-3 px-4 text-[17px] font-bold">My List</h2>
        {!ready ? (
          <GridSkeleton count={6} />
        ) : watchlist.length ? (
          <MediaGrid items={watchlist.map(entryToItem)} />
        ) : (
          <div className="mx-4 flex flex-col items-center rounded-2xl bg-surface px-6 py-12 text-center">
            <BookmarkIcon size={28} className="text-muted" />
            <p className="mt-3 text-sm font-semibold">Your list is empty</p>
            <p className="mt-1 text-xs text-muted">Tap + on any movie or show to save it here.</p>
            <Link href="/search" className="mt-5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg">
              Find something
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
