import { NextResponse } from "next/server";
import { getAllowedUserId, getTelegramBotToken, isUserAllowed } from "@/lib/env";
import { verifyInitData } from "@/lib/telegram/init-data";
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/telegram/session";

export const dynamic = "force-dynamic";

const notFound = () =>
  NextResponse.json({ error: "Not found" }, { status: 404, headers: { "cache-control": "no-store" } });

/** Exchanges verified Telegram initData for an HttpOnly session cookie. */
export async function POST(request: Request): Promise<NextResponse> {
  const botToken = getTelegramBotToken();
  const allowedId = getAllowedUserId();
  if (!botToken || allowedId === null) return notFound();

  if (!request.headers.get("content-type")?.includes("application/json")) return notFound();
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 8192) return notFound();

  let initData: string | null = null;
  try {
    const body: unknown = await request.json();
    if (typeof body === "object" && body !== null && "initData" in body && typeof body.initData === "string") {
      initData = body.initData;
    }
  } catch {
    return notFound();
  }
  if (!initData) return notFound();

  const verified = await verifyInitData(initData, botToken);
  if (!verified || !isUserAllowed(verified.userId, allowedId)) return notFound();

  const response = NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set({
    name: SESSION_COOKIE,
    value: await createSessionToken(verified.userId, botToken),
    httpOnly: true,
    secure,
    // Telegram Web loads Mini Apps in a cross-site iframe; a partitioned
    // SameSite=None cookie keeps working there. Native clients are first-party.
    sameSite: secure ? "none" : "lax",
    partitioned: secure,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}
