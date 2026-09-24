import type { MediaType } from "./media";

export interface WatchlistEntry {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  year: string | null;
  addedAt: number;
}

export interface ProgressEntry {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  season: number | null;
  episode: number | null;
  episodeName: string | null;
  /** Seconds. 0 when the source cannot report progress (iframe). */
  position: number;
  duration: number;
  updatedAt: number;
}
