import { formatDate, formatRuntime } from "@/lib/format";
import type {
  EpisodeView,
  MediaItem,
  Person,
  Provider,
  RegionWatchProviders,
  SeasonOption,
  Trailer,
} from "@/types/media";
import type {
  TmdbAggregateCastMember,
  TmdbCastMember,
  TmdbEpisode,
  TmdbMovieSummary,
  TmdbMultiResult,
  TmdbProvider,
  TmdbSeasonSummary,
  TmdbTvSummary,
  TmdbVideo,
  TmdbWatchProviders,
} from "@/types/tmdb";

const year = (date: string | undefined | null) => (date && date.length >= 4 ? date.slice(0, 4) : null);

export function movieToItem(m: TmdbMovieSummary): MediaItem {
  return {
    id: m.id,
    mediaType: "movie",
    title: m.title,
    overview: m.overview,
    posterPath: m.poster_path,
    backdropPath: m.backdrop_path,
    year: year(m.release_date),
    rating: m.vote_average,
    genreIds: m.genre_ids ?? [],
  };
}

export function tvToItem(t: TmdbTvSummary): MediaItem {
  return {
    id: t.id,
    mediaType: "tv",
    title: t.name,
    overview: t.overview,
    posterPath: t.poster_path,
    backdropPath: t.backdrop_path,
    year: year(t.first_air_date),
    rating: t.vote_average,
    genreIds: t.genre_ids ?? [],
  };
}

export function multiToItems(results: TmdbMultiResult[]): MediaItem[] {
  const items: MediaItem[] = [];
  for (const r of results) {
    if (r.media_type === "movie") items.push(movieToItem(r));
    else if (r.media_type === "tv") items.push(tvToItem(r));
  }
  return items;
}

export function castToPeople(cast: TmdbCastMember[], limit = 20): Person[] {
  return cast.slice(0, limit).map((c) => ({
    id: c.id,
    name: c.name,
    role: c.character,
    profilePath: c.profile_path,
  }));
}

export function aggregateCastToPeople(cast: TmdbAggregateCastMember[], limit = 20): Person[] {
  return cast.slice(0, limit).map((c) => ({
    id: c.id,
    name: c.name,
    role: c.roles[0]?.character ?? "",
    profilePath: c.profile_path,
  }));
}

/** YouTube trailers first, then teasers/clips; newest first within a type. */
export function pickTrailers(videos: TmdbVideo[], limit = 10): Trailer[] {
  const rank = (t: string) => ["Trailer", "Teaser", "Clip", "Featurette"].indexOf(t);
  return videos
    .filter((v) => v.site === "YouTube" && /^[A-Za-z0-9_-]{6,20}$/.test(v.key) && rank(v.type) !== -1)
    .sort(
      (a, b) =>
        rank(a.type) - rank(b.type) ||
        Number(b.official) - Number(a.official) ||
        b.published_at.localeCompare(a.published_at),
    )
    .slice(0, limit)
    .map((v) => ({ key: v.key, name: v.name, type: v.type }));
}

const toProviders = (list: TmdbProvider[] | undefined): Provider[] =>
  (list ?? [])
    .slice()
    .sort((a, b) => a.display_priority - b.display_priority)
    .map((p) => ({ id: p.provider_id, name: p.provider_name, logoPath: p.logo_path }));

export function regionProviders(data: TmdbWatchProviders, region: string): RegionWatchProviders | null {
  const r = data.results[region];
  if (!r) return null;
  const result: RegionWatchProviders = {
    region,
    link: r.link ?? null,
    stream: toProviders(r.flatrate),
    free: toProviders([...(r.free ?? []), ...(r.ads ?? [])]),
    rent: toProviders(r.rent),
    buy: toProviders(r.buy),
  };
  const empty = !result.stream.length && !result.free.length && !result.rent.length && !result.buy.length;
  return empty ? null : result;
}

export function dedupeItems(items: MediaItem[]): MediaItem[] {
  const seen = new Set<string>();
  return items.filter((i) => {
    const key = `${i.mediaType}:${i.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Seasons that have episodes, regular seasons first and specials (0) last. */
export function toSeasonOptions(seasons: TmdbSeasonSummary[]): SeasonOption[] {
  return seasons
    .filter((s) => s.episode_count > 0)
    .sort(
      (a, b) =>
        (a.season_number === 0 ? 1 : 0) - (b.season_number === 0 ? 1 : 0) || a.season_number - b.season_number,
    )
    .map((s) => ({ season: s.season_number, name: s.name, episodeCount: s.episode_count }));
}

export function toEpisodeViews(episodes: TmdbEpisode[], today = new Date().toISOString().slice(0, 10)): EpisodeView[] {
  return episodes.map((e) => ({
    id: e.id,
    season: e.season_number,
    episode: e.episode_number,
    name: e.name,
    overview: e.overview,
    stillPath: e.still_path,
    meta: [formatDate(e.air_date) ?? "TBA", formatRuntime(e.runtime)].filter(Boolean).join(" · "),
    released: Boolean(e.air_date && e.air_date <= today),
  }));
}
