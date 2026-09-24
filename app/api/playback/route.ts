import type { NextRequest } from "next/server";
import { isRequestAuthorized } from "@/lib/auth";
import { jsonBadRequest, jsonError, jsonNotFound, jsonPrivate } from "@/lib/http/responses";
import { getPlaybackProvider, isPlaybackConfigured } from "@/lib/playback";
import type { PlaybackResponse } from "@/types/player";
import { parseEpisode, parseMediaType, parseSeason, parseTmdbId } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** GET /api/playback?type=movie&id=1  |  ?type=tv&id=1&season=1&episode=2 */
export async function GET(request: NextRequest) {
  if (!(await isRequestAuthorized(request))) return jsonNotFound();

  const params = request.nextUrl.searchParams;
  const type = parseMediaType(params.get("type"));
  const id = parseTmdbId(params.get("id"));
  if (!type || id === null) return jsonBadRequest();

  if (!isPlaybackConfigured()) return jsonPrivate<PlaybackResponse>({ configured: false, source: null });

  const provider = getPlaybackProvider();
  try {
    if (type === "movie") {
      return jsonPrivate<PlaybackResponse>({ configured: true, source: await provider.getMovieSource(id) });
    }
    const season = parseSeason(params.get("season"));
    const episode = parseEpisode(params.get("episode"));
    if (season === null || episode === null) return jsonBadRequest();
    return jsonPrivate<PlaybackResponse>({
      configured: true,
      source: await provider.getEpisodeSource(id, season, episode),
    });
  } catch (error) {
    console.error("[playback]", error instanceof Error ? error.message : "unknown error");
    return jsonError();
  }
}
