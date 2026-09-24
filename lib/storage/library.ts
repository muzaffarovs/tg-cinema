"use client";

import { useSyncExternalStore } from "react";
import type { ProgressEntry, WatchlistEntry } from "@/types/library";
import type { MediaType } from "@/types/media";
import { getKeyValueStore, KEY_PATTERN, MAX_VALUE_LENGTH } from "./kv";

/**
 * Watchlist ("My List") and Continue Watching, persisted one entry per key
 * (`wl_<type>_<id>`, `cw_<type>_<id>`) so updates never rewrite the whole list.
 */

export interface LibraryState {
  ready: boolean;
  watchlist: WatchlistEntry[];
  progress: ProgressEntry[];
}

const WATCHLIST_PREFIX = "wl_";
const PROGRESS_PREFIX = "cw_";
const MAX_PROGRESS_ENTRIES = 40;

const EMPTY: LibraryState = { ready: false, watchlist: [], progress: [] };

let state: LibraryState = EMPTY;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

const watchlistKey = (type: MediaType, id: number) => `${WATCHLIST_PREFIX}${type}_${id}`;
const progressKey = (type: MediaType, id: number) => `${PROGRESS_PREFIX}${type}_${id}`;

function setState(next: LibraryState): void {
  state = next;
  for (const l of listeners) l();
}

function sortWatchlist(list: WatchlistEntry[]): WatchlistEntry[] {
  return [...list].sort((a, b) => b.addedAt - a.addedAt);
}

function sortProgress(list: ProgressEntry[]): ProgressEntry[] {
  return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
}

// ── Parsing (storage content is untrusted) ─────────────────────────────────

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, max = 300): string | null => (typeof v === "string" ? v.slice(0, max) : null);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const imgPath = (v: unknown): string | null =>
  typeof v === "string" && /^\/[A-Za-z0-9_.-]{1,100}$/.test(v) ? v : null;
const mediaType = (v: unknown): MediaType | null => (v === "movie" || v === "tv" ? v : null);

function parseJson(raw: string): Obj | null {
  try {
    const v: unknown = JSON.parse(raw);
    return isObj(v) ? v : null;
  } catch {
    return null;
  }
}

function parseWatchlist(raw: string): WatchlistEntry | null {
  const o = parseJson(raw);
  if (!o) return null;
  const id = num(o.id);
  const type = mediaType(o.mediaType);
  const title = str(o.title);
  if (id === null || !type || !title) return null;
  return {
    id,
    mediaType: type,
    title,
    posterPath: imgPath(o.posterPath),
    backdropPath: imgPath(o.backdropPath),
    year: str(o.year, 4),
    addedAt: num(o.addedAt) ?? 0,
  };
}

function parseProgress(raw: string): ProgressEntry | null {
  const o = parseJson(raw);
  if (!o) return null;
  const id = num(o.id);
  const type = mediaType(o.mediaType);
  const title = str(o.title);
  if (id === null || !type || !title) return null;
  return {
    id,
    mediaType: type,
    title,
    posterPath: imgPath(o.posterPath),
    backdropPath: imgPath(o.backdropPath),
    season: num(o.season),
    episode: num(o.episode),
    episodeName: str(o.episodeName),
    position: Math.max(0, num(o.position) ?? 0),
    duration: Math.max(0, num(o.duration) ?? 0),
    updatedAt: num(o.updatedAt) ?? 0,
  };
}

// ── Loading ─────────────────────────────────────────────────────────────────

function load(): Promise<void> {
  if (loading) return loading;
  loading = (async () => {
    const kv = getKeyValueStore();
    try {
      const keys = (await kv.getKeys()).filter(
        (k) => k.startsWith(WATCHLIST_PREFIX) || k.startsWith(PROGRESS_PREFIX),
      );
      const values = keys.length ? await kv.getItems(keys) : {};
      const watchlist: WatchlistEntry[] = [];
      const progress: ProgressEntry[] = [];
      for (const [key, raw] of Object.entries(values)) {
        if (key.startsWith(WATCHLIST_PREFIX)) {
          const e = parseWatchlist(raw);
          if (e) watchlist.push(e);
        } else {
          const e = parseProgress(raw);
          if (e) progress.push(e);
        }
      }
      // Merge with anything changed in memory before storage finished loading.
      const key = (e: { mediaType: MediaType; id: number }) => `${e.mediaType}:${e.id}`;
      const wl = new Map(watchlist.map((e) => [key(e), e]));
      for (const e of state.watchlist) wl.set(key(e), e);
      const pr = new Map(progress.map((e) => [key(e), e]));
      for (const e of state.progress) pr.set(key(e), e);
      setState({ ready: true, watchlist: sortWatchlist([...wl.values()]), progress: sortProgress([...pr.values()]) });
    } catch (error) {
      console.warn("[library] load failed", error);
      setState({ ...state, ready: true });
    }
  })();
  return loading;
}

async function persist(key: string, value: object | null): Promise<void> {
  if (!KEY_PATTERN.test(key)) return;
  const kv = getKeyValueStore();
  try {
    if (value === null) {
      await kv.removeItem(key);
    } else {
      const json = JSON.stringify(value);
      if (json.length <= MAX_VALUE_LENGTH) await kv.setItem(key, json);
    }
  } catch (error) {
    console.warn("[library] persist failed", error);
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

export function isInWatchlist(s: LibraryState, type: MediaType, id: number): boolean {
  return s.watchlist.some((e) => e.mediaType === type && e.id === id);
}

export function toggleWatchlist(entry: Omit<WatchlistEntry, "addedAt">): boolean {
  const exists = isInWatchlist(state, entry.mediaType, entry.id);
  const key = watchlistKey(entry.mediaType, entry.id);
  if (exists) {
    setState({
      ...state,
      watchlist: state.watchlist.filter((e) => !(e.mediaType === entry.mediaType && e.id === entry.id)),
    });
    void persist(key, null);
    return false;
  }
  const full: WatchlistEntry = { ...entry, addedAt: Date.now() };
  setState({ ...state, watchlist: sortWatchlist([full, ...state.watchlist]) });
  void persist(key, full);
  return true;
}

export function getProgress(type: MediaType, id: number): ProgressEntry | null {
  return state.progress.find((e) => e.mediaType === type && e.id === id) ?? null;
}

export function saveProgress(entry: Omit<ProgressEntry, "updatedAt">): void {
  const full: ProgressEntry = { ...entry, updatedAt: Date.now() };
  const others = state.progress.filter((e) => !(e.mediaType === entry.mediaType && e.id === entry.id));
  const next = sortProgress([full, ...others]);
  const overflow = next.slice(MAX_PROGRESS_ENTRIES);
  setState({ ...state, progress: next.slice(0, MAX_PROGRESS_ENTRIES) });
  void persist(progressKey(entry.mediaType, entry.id), full);
  for (const e of overflow) void persist(progressKey(e.mediaType, e.id), null);
}

export function removeProgress(type: MediaType, id: number): void {
  setState({ ...state, progress: state.progress.filter((e) => !(e.mediaType === type && e.id === id)) });
  void persist(progressKey(type, id), null);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  void load();
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;
const getServerSnapshot = () => EMPTY;

export function useLibrary(): LibraryState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
