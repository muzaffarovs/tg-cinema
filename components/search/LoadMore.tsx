"use client";

import { useState } from "react";
import { apiGet } from "@/lib/api-client";
import { MediaGrid } from "@/components/media/MediaGrid";
import { dedupeItems } from "@/lib/tmdb/normalize";
import type { BrowseResult, MediaItem } from "@/types/media";

interface Props {
  query: string;
  scope: string;
  genre: number | null;
  startPage: number;
  totalPages: number;
  /** Items already rendered by the server, to avoid duplicates across pages. */
  seenKeys: string[];
}

export function LoadMore({ query, scope, genre, startPage, totalPages, seenKeys }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(startPage);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  if (page >= totalPages && !items.length) return null;

  const loadNext = async () => {
    setStatus("loading");
    try {
      const res = await apiGet<BrowseResult>("/api/browse", {
        q: query,
        type: scope,
        genre: genre ?? undefined,
        page: page + 1,
      });
      const seen = new Set(seenKeys);
      setItems((prev) =>
        dedupeItems([...prev, ...res.items]).filter((i) => !seen.has(`${i.mediaType}:${i.id}`)),
      );
      setPage(res.page);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      {items.length ? (
        <div className="mt-4">
          <MediaGrid items={items} />
        </div>
      ) : null}
      {page < totalPages ? (
        <div className="mt-6 flex justify-center px-4">
          <button
            type="button"
            onClick={loadNext}
            disabled={status === "loading"}
            className="h-11 w-full max-w-xs rounded-full bg-surface-2 text-sm font-semibold disabled:opacity-60"
          >
            {status === "loading" ? "Loading…" : status === "error" ? "Retry" : "Load more"}
          </button>
        </div>
      ) : null}
    </>
  );
}
