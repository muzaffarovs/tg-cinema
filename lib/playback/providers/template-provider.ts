import {
  isPlaybackSourceType,
  isSafeSourceUrl,
  type PlaybackProvider,
  type PlaybackSource,
  type PlaybackSourceType,
} from "../types";

export interface TemplateProviderConfig {
  movieTemplate: string;
  tvTemplate: string;
  forcedType?: string;
}

type Vars = Record<"type" | "tmdbId" | "season" | "episode", string>;

/**
 * Builds source URLs from operator-configured templates, e.g. a personal
 * media server: `https://media.example.com/{type}/{tmdbId}/{season}/{episode}.m3u8`.
 */
export class TemplatePlaybackProvider implements PlaybackProvider {
  constructor(private readonly config: TemplateProviderConfig) {}

  async getMovieSource(tmdbId: number): Promise<PlaybackSource | null> {
    return this.build(this.config.movieTemplate, { type: "movie", tmdbId: String(tmdbId), season: "", episode: "" });
  }

  async getEpisodeSource(tmdbId: number, season: number, episode: number): Promise<PlaybackSource | null> {
    return this.build(this.config.tvTemplate, {
      type: "tv",
      tmdbId: String(tmdbId),
      season: String(season),
      episode: String(episode),
    });
  }

  private build(template: string, vars: Vars): PlaybackSource | null {
    const url = template.replace(/\{(type|tmdbId|season|episode)\}/g, (_, name: keyof Vars) =>
      encodeURIComponent(vars[name]),
    );
    if (!isSafeSourceUrl(url)) return null;
    const title =
      vars.type === "movie" ? `Movie ${vars.tmdbId}` : `S${vars.season} · E${vars.episode}`;
    return { url, type: this.inferType(url), title };
  }

  private inferType(url: string): PlaybackSourceType {
    if (isPlaybackSourceType(this.config.forcedType)) return this.config.forcedType;
    const path = new URL(url).pathname.toLowerCase();
    if (path.endsWith(".m3u8")) return "hls";
    if (path.endsWith(".mp4") || path.endsWith(".webm")) return "mp4";
    return "iframe";
  }
}
