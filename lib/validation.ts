import type { MediaType } from "@/types/media";

/** Parses a strictly positive integer within [min, max]; anything else is null. */
export function parseIntParam(
  value: string | string[] | null | undefined,
  min: number,
  max: number,
): number | null {
  if (typeof value !== "string" || !/^\d{1,10}$/.test(value)) return null;
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= min && n <= max ? n : null;
}

export const parseTmdbId = (v: string | string[] | null | undefined) =>
  parseIntParam(v, 1, 99_999_999);
export const parseSeason = (v: string | string[] | null | undefined) => parseIntParam(v, 0, 500);
export const parseEpisode = (v: string | string[] | null | undefined) => parseIntParam(v, 1, 20_000);
export const parsePage = (v: string | string[] | null | undefined) => parseIntParam(v, 1, 500) ?? 1;
export const parseGenre = (v: string | string[] | null | undefined) => parseIntParam(v, 1, 999_999);

export function parseMediaType(value: string | string[] | null | undefined): MediaType | null {
  return value === "movie" || value === "tv" ? value : null;
}

export type SearchScope = MediaType | "all";

export function parseSearchScope(value: string | string[] | null | undefined): SearchScope {
  return value === "movie" || value === "tv" ? value : "all";
}

export const MAX_QUERY_LENGTH = 100;

/** Trims, strips control characters and caps length. */
export function parseQuery(value: string | string[] | null | undefined): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, MAX_QUERY_LENGTH);
}
