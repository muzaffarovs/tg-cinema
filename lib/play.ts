import type { ProgressEntry } from "@/types/library";
import type { MediaType } from "@/types/media";
import type { EpisodeRef, PlayRequest } from "@/types/player";

export interface Playable {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
}

/** Builds a play request, resuming TV from the last watched episode (or a given default). */
export function buildPlayRequest(
  item: Playable,
  progress: ProgressEntry | null,
  fallbackEpisode: EpisodeRef = { season: 1, episode: 1, name: null },
): PlayRequest {
  const base = {
    id: item.id,
    title: item.title,
    posterPath: item.posterPath,
    backdropPath: item.backdropPath,
  };
  if (item.mediaType === "movie") return { ...base, mediaType: "movie" };
  const resume = progress && progress.season !== null && progress.episode !== null;
  return {
    ...base,
    mediaType: "tv",
    season: resume ? (progress.season ?? 1) : fallbackEpisode.season,
    episode: resume ? (progress.episode ?? 1) : fallbackEpisode.episode,
    episodeName: resume ? progress.episodeName : fallbackEpisode.name,
  };
}

export function playLabel(mediaType: MediaType, progress: ProgressEntry | null): string {
  if (!progress) return "Play";
  if (mediaType === "tv" && progress.season !== null && progress.episode !== null) {
    return `Resume S${progress.season}·E${progress.episode}`;
  }
  return progress.position > 30 ? "Resume" : "Play";
}
