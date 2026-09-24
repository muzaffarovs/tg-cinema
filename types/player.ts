import type { PlaybackSource } from "@/lib/playback/types";

export interface EpisodeRef {
  season: number;
  episode: number;
  name: string | null;
}

interface PlayBase {
  id: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
}

export type PlayRequest =
  | (PlayBase & { mediaType: "movie" })
  | (PlayBase & {
      mediaType: "tv";
      season: number;
      episode: number;
      episodeName: string | null;
      /** Episodes that follow this one, for "Next episode". */
      upNext?: EpisodeRef[];
    });

export interface PlaybackResponse {
  configured: boolean;
  source: PlaybackSource | null;
}
