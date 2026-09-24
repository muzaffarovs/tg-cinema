"use client";

import { INIT_DATA_HEADER } from "@/lib/telegram/constants";
import { getWebApp } from "@/lib/telegram/webapp";

export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`Request failed with status ${status}`);
  }
}

/**
 * GET a same-origin API route. Sends initData as a header in addition to the
 * session cookie, for Telegram clients that block the (partitioned) cookie.
 */
export async function apiGet<T>(
  path: `/api/${string}`,
  params: Record<string, string | number | undefined>,
  signal?: AbortSignal,
): Promise<T> {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") search.set(k, String(v));

  const headers: HeadersInit = { accept: "application/json" };
  const initData = getWebApp()?.initData;
  if (initData) headers[INIT_DATA_HEADER] = initData;

  const res = await fetch(`${path}?${search.toString()}`, { headers, credentials: "same-origin", signal });
  if (!res.ok) throw new ApiError(res.status);
  const data: unknown = await res.json();
  return data as T;
}
