import type { NextRequest } from "next/server";
import { isRequestAuthorized } from "@/lib/auth";
import { jsonBadRequest, jsonError, jsonNotFound, jsonPrivate } from "@/lib/http/responses";
import { browse } from "@/lib/tmdb/api";
import { parseGenre, parsePage, parseQuery, parseSearchScope } from "@/lib/validation";
import type { BrowseResult } from "@/types/media";

export const dynamic = "force-dynamic";

/** Pagination for /search: GET /api/browse?q=&type=all|movie|tv&genre=&page= */
export async function GET(request: NextRequest) {
  if (!(await isRequestAuthorized(request))) return jsonNotFound();

  const params = request.nextUrl.searchParams;
  const rawGenre = params.get("genre");
  const genre = parseGenre(rawGenre);
  if (rawGenre && genre === null) return jsonBadRequest();

  try {
    const result = await browse({
      query: parseQuery(params.get("q")),
      scope: parseSearchScope(params.get("type")),
      genre,
      page: parsePage(params.get("page")),
    });
    return jsonPrivate<BrowseResult>(result, 300);
  } catch (error) {
    console.error("[browse]", error instanceof Error ? error.message : "unknown error");
    return jsonError();
  }
}
