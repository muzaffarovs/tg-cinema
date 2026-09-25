import type { NextRequest } from "next/server";
import { isRequestAuthorized } from "@/lib/auth";
import { jsonBadRequest, jsonError, jsonNotFound, jsonPrivate } from "@/lib/http/responses";
import { getSeasonPayload } from "@/lib/tmdb/api";
import { parseSeason, parseTmdbId } from "@/lib/validation";
import type { SeasonPayload } from "@/types/media";

export const dynamic = "force-dynamic";

/** Episodes for the season pickers: GET /api/season?id=1399&season=2 */
export async function GET(request: NextRequest) {
  if (!(await isRequestAuthorized(request))) return jsonNotFound();

  const params = request.nextUrl.searchParams;
  const id = parseTmdbId(params.get("id"));
  const season = parseSeason(params.get("season"));
  if (id === null || season === null) return jsonBadRequest();

  try {
    const payload = await getSeasonPayload(id, season);
    return payload ? jsonPrivate<SeasonPayload>(payload, 600) : jsonNotFound();
  } catch (error) {
    console.error("[season]", error instanceof Error ? error.message : "unknown error");
    return jsonError();
  }
}
