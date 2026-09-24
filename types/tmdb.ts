/** Raw TMDB API response shapes (only the fields this app reads). */

export type TmdbMediaType = "movie" | "tv";

export interface TmdbPaged<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbTitleBase {
  id: number;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  original_language: string;
  genre_ids?: number[];
  adult?: boolean;
}

export interface TmdbMovieSummary extends TmdbTitleBase {
  media_type?: "movie";
  title: string;
  original_title: string;
  release_date?: string;
}

export interface TmdbTvSummary extends TmdbTitleBase {
  media_type?: "tv";
  name: string;
  original_name: string;
  first_air_date?: string;
  origin_country?: string[];
}

export interface TmdbPersonSummary {
  media_type: "person";
  id: number;
  name: string;
  profile_path: string | null;
}

export type TmdbMultiResult =
  | (TmdbMovieSummary & { media_type: "movie" })
  | (TmdbTvSummary & { media_type: "tv" })
  | TmdbPersonSummary;

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TmdbCredits {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbAggregateCastMember {
  id: number;
  name: string;
  profile_path: string | null;
  order: number;
  total_episode_count: number;
  roles: { character: string; episode_count: number }[];
}

export interface TmdbAggregateCredits {
  cast: TmdbAggregateCastMember[];
}

export interface TmdbImage {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
  iso_639_1: string | null;
  vote_average: number;
}

export interface TmdbImages {
  backdrops: TmdbImage[];
  posters: TmdbImage[];
  logos: TmdbImage[];
}

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  iso_639_1: string;
  published_at: string;
}

export interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

export interface TmdbRegionProviders {
  link?: string;
  flatrate?: TmdbProvider[];
  free?: TmdbProvider[];
  ads?: TmdbProvider[];
  rent?: TmdbProvider[];
  buy?: TmdbProvider[];
}

export interface TmdbWatchProviders {
  results: Partial<Record<string, TmdbRegionProviders>>;
}

export interface TmdbReleaseDates {
  results: {
    iso_3166_1: string;
    release_dates: { certification: string; type: number; release_date: string }[];
  }[];
}

export interface TmdbContentRatings {
  results: { iso_3166_1: string; rating: string }[];
}

export interface TmdbMovieDetails extends TmdbMovieSummary {
  genres: TmdbGenre[];
  runtime: number | null;
  tagline: string | null;
  status: string;
  imdb_id: string | null;
  credits: TmdbCredits;
  similar: TmdbPaged<TmdbMovieSummary>;
  images: TmdbImages;
  videos: { results: TmdbVideo[] };
  "watch/providers": TmdbWatchProviders;
  release_dates: TmdbReleaseDates;
}

export interface TmdbSeasonSummary {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
}

export interface TmdbEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
  vote_average: number;
}

export interface TmdbTvDetails extends TmdbTvSummary {
  genres: TmdbGenre[];
  tagline: string | null;
  status: string;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  seasons: TmdbSeasonSummary[];
  networks: { id: number; name: string; logo_path: string | null }[];
  created_by: { id: number; name: string }[];
  last_episode_to_air: TmdbEpisode | null;
  next_episode_to_air: TmdbEpisode | null;
  aggregate_credits: TmdbAggregateCredits;
  similar: TmdbPaged<TmdbTvSummary>;
  images: TmdbImages;
  videos: { results: TmdbVideo[] };
  "watch/providers": TmdbWatchProviders;
  content_ratings: TmdbContentRatings;
}

export interface TmdbSeasonDetails {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  poster_path: string | null;
  air_date: string | null;
  episodes: TmdbEpisode[];
}
