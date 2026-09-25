"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import type { SeasonPayload } from "@/types/media";

const cache = new Map<string, SeasonPayload>();
const keyOf = (tvId: number, season: number) => `${tvId}:${season}`;

/** Seeds the client cache with server-rendered data so the first render needs no request. */
export function primeSeason(tvId: number, payload: SeasonPayload): void {
  cache.set(keyOf(tvId, payload.season), payload);
}

type SeasonState = { data: SeasonPayload | null; error: boolean };

/** Loads one season's episodes (cached per session). */
export function useSeason(tvId: number, season: number | null): SeasonState & { loading: boolean } {
  const key = season === null ? null : keyOf(tvId, season);
  const [result, setResult] = useState<{ key: string; error: boolean } | null>(null);

  useEffect(() => {
    if (key === null || season === null || cache.has(key)) return;
    const controller = new AbortController();
    apiGet<SeasonPayload>("/api/season", { id: tvId, season }, controller.signal)
      .then((payload) => {
        cache.set(key, payload);
        setResult({ key, error: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ key, error: true });
      });
    return () => controller.abort();
  }, [key, tvId, season]);

  const data = key ? (cache.get(key) ?? null) : null;
  const error = !data && result?.key === key && result.error;
  return { data, error, loading: key !== null && !data && !error };
}
