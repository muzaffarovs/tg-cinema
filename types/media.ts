import type { TmdbMediaType } from "./tmdb";

export type MediaType = TmdbMediaType;

/** Normalized title used by cards, rows and the library. */
export interface MediaItem {
  id: number;
  mediaType: MediaType;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  year: string | null;
  rating: number;
  genreIds: number[];
}

export interface Person {
  id: number;
  name: string;
  role: string;
  profilePath: string | null;
}

export interface Trailer {
  key: string;
  name: string;
  type: string;
}

export interface Provider {
  id: number;
  name: string;
  logoPath: string | null;
}

export interface RegionWatchProviders {
  region: string;
  link: string | null;
  stream: Provider[];
  free: Provider[];
  rent: Provider[];
  buy: Provider[];
}

export interface BrowseResult {
  items: MediaItem[];
  page: number;
  totalPages: number;
}

export interface SeasonOption {
  season: number;
  name: string;
  episodeCount: number;
}

export interface EpisodeView {
  id: number;
  season: number;
  episode: number;
  name: string;
  overview: string;
  stillPath: string | null;
  meta: string;
  released: boolean;
}

/** One season's episodes plus the show's season list (for pickers). */
export interface SeasonPayload {
  season: number;
  seasons: SeasonOption[];
  episodes: EpisodeView[];
}
