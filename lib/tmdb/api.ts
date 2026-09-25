import "server-only";
import { cache } from "react";
import { getTmdbRegion } from "@/lib/env";
import type { SearchScope } from "@/lib/validation";
import type { BrowseResult, MediaItem, MediaType, SeasonPayload } from "@/types/media";
import type {
  TmdbGenre,
  TmdbMovieDetails,
  TmdbMovieSummary,
  TmdbMultiResult,
  TmdbPaged,
  TmdbSeasonDetails,
  TmdbTvDetails,
  TmdbTvSummary,
} from "@/types/tmdb";
import { tmdbFetch, TmdbError } from "./client";
import { dedupeItems, movieToItem, multiToItems, toEpisodeViews, toSeasonOptions, tvToItem } from "./normalize";

const HOUR = 3600;
const LIST_TTL = HOUR;
const DETAILS_TTL = 6 * HOUR;
const GENRES_TTL = 24 * HOUR;
const SEARCH_TTL = 10 * 60;

/** TMDB caps list endpoints at 500 pages. */
const MAX_PAGES = 500;

function paged(items: MediaItem[], page: number, totalPages: number): BrowseResult {
  return { items, page, totalPages: Math.min(totalPages, MAX_PAGES) };
}

const moviesPage = (d: TmdbPaged<TmdbMovieSummary>) => paged(d.results.map(movieToItem), d.page, d.total_pages);
const tvPage = (d: TmdbPaged<TmdbTvSummary>) => paged(d.results.map(tvToItem), d.page, d.total_pages);

// ── Lists ────────────────────────────────────────────────────────────────────

export async function getTrending(type: MediaType | "all", window: "day" | "week" = "week"): Promise<MediaItem[]> {
  const path = `/trending/${type}/${window}`;
  if (type === "movie") {
    return (await tmdbFetch<TmdbPaged<TmdbMovieSummary>>(path, { revalidate: LIST_TTL })).results.map(movieToItem);
  }
  if (type === "tv") {
    return (await tmdbFetch<TmdbPaged<TmdbTvSummary>>(path, { revalidate: LIST_TTL })).results.map(tvToItem);
  }
  return multiToItems((await tmdbFetch<TmdbPaged<TmdbMultiResult>>(path, { revalidate: LIST_TTL })).results);
}

export async function getPopular(type: MediaType, page = 1): Promise<BrowseResult> {
  if (type === "movie") {
    const d = await tmdbFetch<TmdbPaged<TmdbMovieSummary>>("/movie/popular", {
      query: { page, region: getTmdbRegion() },
      revalidate: LIST_TTL,
    });
    return moviesPage(d);
  }
  return tvPage(await tmdbFetch<TmdbPaged<TmdbTvSummary>>("/tv/popular", { query: { page }, revalidate: LIST_TTL }));
}

export async function getTopRated(type: MediaType, page = 1): Promise<BrowseResult> {
  if (type === "movie") {
    const d = await tmdbFetch<TmdbPaged<TmdbMovieSummary>>("/movie/top_rated", {
      query: { page },
      revalidate: LIST_TTL,
    });
    return moviesPage(d);
  }
  return tvPage(await tmdbFetch<TmdbPaged<TmdbTvSummary>>("/tv/top_rated", { query: { page }, revalidate: LIST_TTL }));
}

/** Upcoming movies for the configured region, falling back to worldwide when the region is sparse. */
export async function getUpcoming(page = 1): Promise<BrowseResult> {
  const regional = await tmdbFetch<TmdbPaged<TmdbMovieSummary>>("/movie/upcoming", {
    query: { page, region: getTmdbRegion() },
    revalidate: LIST_TTL,
  });
  if (regional.results.length >= 6) return moviesPage(regional);
  return moviesPage(
    await tmdbFetch<TmdbPaged<TmdbMovieSummary>>("/movie/upcoming", { query: { page }, revalidate: LIST_TTL }),
  );
}

export async function getAnime(page = 1): Promise<BrowseResult> {
  const d = await tmdbFetch<TmdbPaged<TmdbTvSummary>>("/discover/tv", {
    query: {
      page,
      with_genres: 16,
      with_original_language: "ja",
      sort_by: "popularity.desc",
      "vote_count.gte": 50,
    },
    revalidate: LIST_TTL,
  });
  return tvPage(d);
}

// ── Genres / discover / search ───────────────────────────────────────────────

export const getGenres = cache(async (type: MediaType): Promise<TmdbGenre[]> => {
  const d = await tmdbFetch<{ genres: TmdbGenre[] }>(`/genre/${type}/list`, { revalidate: GENRES_TTL });
  return d.genres;
});

export async function discover(type: MediaType, genreId: number | null, page = 1): Promise<BrowseResult> {
  const query = {
    page,
    with_genres: genreId ?? undefined,
    sort_by: "popularity.desc",
    "vote_count.gte": 20,
    include_adult: false,
  };
  if (type === "movie") {
    return moviesPage(await tmdbFetch<TmdbPaged<TmdbMovieSummary>>("/discover/movie", { query, revalidate: LIST_TTL }));
  }
  return tvPage(await tmdbFetch<TmdbPaged<TmdbTvSummary>>("/discover/tv", { query, revalidate: LIST_TTL }));
}

export async function search(query: string, scope: SearchScope, page = 1): Promise<BrowseResult> {
  const q = { query, page, include_adult: false };
  if (scope === "movie") {
    return moviesPage(await tmdbFetch<TmdbPaged<TmdbMovieSummary>>("/search/movie", { query: q, revalidate: SEARCH_TTL }));
  }
  if (scope === "tv") {
    return tvPage(await tmdbFetch<TmdbPaged<TmdbTvSummary>>("/search/tv", { query: q, revalidate: SEARCH_TTL }));
  }
  const d = await tmdbFetch<TmdbPaged<TmdbMultiResult>>("/search/multi", { query: q, revalidate: SEARCH_TTL });
  return paged(dedupeItems(multiToItems(d.results)), d.page, d.total_pages);
}

/**
 * Unified browse used by /search and /api/browse: text search (optionally
 * narrowed by genre client-side, since TMDB search has no genre filter) or
 * genre discovery.
 */
export async function browse(params: {
  query: string;
  scope: SearchScope;
  genre: number | null;
  page: number;
}): Promise<BrowseResult> {
  const { query, scope, genre, page } = params;
  if (query) {
    const result = await search(query, scope, page);
    return genre ? { ...result, items: result.items.filter((i) => i.genreIds.includes(genre)) } : result;
  }
  return discover(scope === "tv" ? "tv" : "movie", genre, page);
}

// ── Details ──────────────────────────────────────────────────────────────────

const IMAGE_LANGS = "en,null";

/** Returns null for unknown ids so pages can 404 cleanly. */
async function orNull<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (e) {
    if (e instanceof TmdbError && e.status === 404) return null;
    throw e;
  }
}

export const getMovieDetails = cache((id: number) =>
  orNull(
    tmdbFetch<TmdbMovieDetails>(`/movie/${id}`, {
      query: {
        append_to_response: "credits,similar,images,videos,watch/providers,release_dates",
        include_image_language: IMAGE_LANGS,
        include_video_language: "en,null",
      },
      revalidate: DETAILS_TTL,
    }),
  ),
);

export const getTvDetails = cache((id: number) =>
  orNull(
    tmdbFetch<TmdbTvDetails>(`/tv/${id}`, {
      query: {
        append_to_response: "aggregate_credits,similar,images,videos,watch/providers,content_ratings",
        include_image_language: IMAGE_LANGS,
        include_video_language: "en,null",
      },
      revalidate: DETAILS_TTL,
    }),
  ),
);

export const getSeasonDetails = cache((id: number, season: number) =>
  orNull(tmdbFetch<TmdbSeasonDetails>(`/tv/${id}/season/${season}`, { revalidate: DETAILS_TTL })),
);

/** A season's episodes plus the show's season list; null if either doesn't exist. */
export async function getSeasonPayload(id: number, season: number): Promise<SeasonPayload | null> {
  const [show, details] = await Promise.all([getTvDetails(id), getSeasonDetails(id, season)]);
  if (!show || !details) return null;
  return { season, seasons: toSeasonOptions(show.seasons), episodes: toEpisodeViews(details.episodes) };
}
