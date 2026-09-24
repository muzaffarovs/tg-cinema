import {
  isPlaybackSourceType,
  isSafeSourceUrl,
  type PlaybackProvider,
  type PlaybackSource,
} from "../types";

export interface HttpResolverConfig {
  baseUrl: string;
  token?: string;
  timeoutMs?: number;
}

/**
 * Asks an operator-run resolver service for a source:
 *   GET {base}/movie/{tmdbId}
 *   GET {base}/tv/{tmdbId}/{season}/{episode}
 * Expected JSON: { url: string, type: "iframe" | "hls" | "mp4", title?: string }.
 * 404 means "not available".
 */
export class HttpResolverPlaybackProvider implements PlaybackProvider {
  private readonly base: string;

  constructor(private readonly config: HttpResolverConfig) {
    this.base = config.baseUrl.replace(/\/+$/, "");
  }

  getMovieSource(tmdbId: number): Promise<PlaybackSource | null> {
    return this.resolve(`/movie/${tmdbId}`);
  }

  getEpisodeSource(tmdbId: number, season: number, episode: number): Promise<PlaybackSource | null> {
    return this.resolve(`/tv/${tmdbId}/${season}/${episode}`);
  }

  private async resolve(path: string): Promise<PlaybackSource | null> {
    const headers: HeadersInit = { accept: "application/json" };
    if (this.config.token) headers.authorization = `Bearer ${this.config.token}`;

    const res = await fetch(this.base + path, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(this.config.timeoutMs ?? 8000),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Playback resolver responded ${res.status}`);

    const body: unknown = await res.json();
    return parseSource(body);
  }
}

function parseSource(body: unknown): PlaybackSource | null {
  if (typeof body !== "object" || body === null) return null;
  const url = "url" in body ? body.url : undefined;
  const type = "type" in body ? body.type : undefined;
  const title = "title" in body ? body.title : undefined;
  if (!isSafeSourceUrl(url) || !isPlaybackSourceType(type)) return null;
  return { url, type, title: typeof title === "string" ? title.slice(0, 200) : "" };
}
