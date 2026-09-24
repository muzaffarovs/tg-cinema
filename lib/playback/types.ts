export type PlaybackSourceType = "iframe" | "hls" | "mp4";

export type PlaybackSource = {
  url: string;
  type: PlaybackSourceType;
  title: string;
};

/**
 * Resolves a TMDB title to a playable source. Implementations must only
 * return sources the operator is authorized to use. The UI never knows
 * which implementation is active.
 */
export interface PlaybackProvider {
  getMovieSource(tmdbId: number): Promise<PlaybackSource | null>;
  getEpisodeSource(tmdbId: number, season: number, episode: number): Promise<PlaybackSource | null>;
}

export const PLAYBACK_SOURCE_TYPES: readonly PlaybackSourceType[] = ["iframe", "hls", "mp4"];

export function isPlaybackSourceType(value: unknown): value is PlaybackSourceType {
  return typeof value === "string" && (PLAYBACK_SOURCE_TYPES as readonly string[]).includes(value);
}

/** Only absolute https URLs (http allowed for localhost during development). */
export function isSafeSourceUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return true;
    return (
      process.env.NODE_ENV === "development" &&
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}
