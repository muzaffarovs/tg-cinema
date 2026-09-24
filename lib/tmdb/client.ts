import "server-only";
import { getTmdbApiKey, getTmdbLanguage } from "@/lib/env";

const TMDB_BASE =
  process.env.NODE_ENV === "development" && process.env.TMDB_API_BASE_URL
    ? process.env.TMDB_API_BASE_URL // local mocks only; ignored in production
    : "https://api.themoviedb.org/3";

export class TmdbError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`TMDB ${status} for ${path}`);
  }
}

export type QueryValue = string | number | boolean | undefined;

export interface TmdbFetchOptions {
  query?: Record<string, QueryValue>;
  /** Seconds to keep the response in Next's data cache. */
  revalidate: number;
}

/**
 * Server-only TMDB request. Supports both a v3 API key (query param) and a
 * v4 read access token (Bearer). Responses are cached in the Next data cache
 * so repeated renders don't hit TMDB.
 */
export async function tmdbFetch<T>(path: string, { query = {}, revalidate }: TmdbFetchOptions): Promise<T> {
  const key = getTmdbApiKey();
  const isBearer = key.startsWith("eyJ");

  const url = new URL(TMDB_BASE + path);
  url.searchParams.set("language", getTmdbLanguage());
  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") url.searchParams.set(name, String(value));
  }
  if (!isBearer) url.searchParams.set("api_key", key);

  const headers: HeadersInit = { accept: "application/json" };
  if (isBearer) headers.authorization = `Bearer ${key}`;

  const res = await fetch(url, { headers, next: { revalidate, tags: ["tmdb"] } });
  if (!res.ok) throw new TmdbError(res.status, path);
  const data: unknown = await res.json();
  return data as T;
}
