import { NextResponse } from "next/server";

export const jsonNotFound = () =>
  NextResponse.json({ error: "Not found" }, { status: 404, headers: { "cache-control": "no-store" } });

export const jsonBadRequest = (message = "Invalid parameters") =>
  NextResponse.json({ error: message }, { status: 400, headers: { "cache-control": "no-store" } });

export const jsonError = (status = 502) =>
  NextResponse.json({ error: "Upstream error" }, { status, headers: { "cache-control": "no-store" } });

export const jsonPrivate = <T,>(body: T, maxAgeSeconds = 0) =>
  NextResponse.json(body, {
    headers: {
      "cache-control": maxAgeSeconds > 0 ? `private, max-age=${maxAgeSeconds}` : "no-store",
    },
  });
