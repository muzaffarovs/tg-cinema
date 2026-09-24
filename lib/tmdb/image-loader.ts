"use client";

import type { ImageLoaderProps } from "next/image";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/";
const TMDB_WIDTHS = [92, 154, 185, 300, 342, 500, 780, 1280] as const;

/**
 * Maps next/image widths onto TMDB's pre-rendered sizes, so images are served
 * straight from TMDB's CDN (no Vercel image optimization). Absolute URLs
 * (e.g. YouTube thumbnails) pass through untouched.
 */
export default function tmdbImageLoader({ src, width }: ImageLoaderProps): string {
  if (!src.startsWith("/")) return src;
  const size = TMDB_WIDTHS.find((w) => w >= width);
  return `${TMDB_IMAGE_BASE}${size ? `w${size}` : "original"}${src}`;
}
