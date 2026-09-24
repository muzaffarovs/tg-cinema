import type { PlaybackProvider, PlaybackSource } from "../types";

/** Used when no playback provider is configured. */
export class NullPlaybackProvider implements PlaybackProvider {
  async getMovieSource(): Promise<PlaybackSource | null> {
    return null;
  }

  async getEpisodeSource(): Promise<PlaybackSource | null> {
    return null;
  }
}
