import { NextResponse, type NextRequest } from "next/server";
import { clientIp, rateLimit, type RateLimitRule } from "@/lib/rate-limit";
import { isAuthorized } from "@/lib/telegram/authorize";
import { gateResponse } from "@/lib/telegram/gate";
import { INIT_DATA_HEADER, SESSION_COOKIE } from "@/lib/telegram/session";

const AUTH_RULE: RateLimitRule = { limit: 10, windowMs: 60_000 };
const API_RULE: RateLimitRule = { limit: 120, windowMs: 60_000 };
const PAGE_RULE: RateLimitRule = { limit: 300, windowMs: 60_000 };

function notFoundJson(): NextResponse {
  return NextResponse.json(
    { error: "Not found" },
    { status: 404, headers: { "cache-control": "no-store" } },
  );
}

function tooManyRequests(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests" },
    { status: 429, headers: { "retry-after": String(retryAfter), "cache-control": "no-store" } },
  );
}

export async function proxy(request: NextRequest): Promise<Response> {
  const { pathname } = request.nextUrl;
  const ip = clientIp(request.headers);
  const isApi = pathname.startsWith("/api/");
  const isAuthRoute = pathname === "/api/auth";

  const rule = isAuthRoute ? AUTH_RULE : isApi ? API_RULE : PAGE_RULE;
  const bucket = isAuthRoute ? "auth" : isApi ? "api" : "page";
  const limited = rateLimit(`${bucket}:${ip}`, rule);
  if (!limited.ok) return tooManyRequests(limited.retryAfterSeconds);

  // The auth endpoint performs its own initData verification.
  if (isAuthRoute) return NextResponse.next();

  const authorized = await isAuthorized({
    sessionToken: request.cookies.get(SESSION_COOKIE)?.value,
    initData: isApi ? request.headers.get(INIT_DATA_HEADER) : null,
  });
  if (authorized) return NextResponse.next();

  if (isApi) return notFoundJson();
  if (request.method === "GET" || request.method === "HEAD") return gateResponse();
  return new Response(null, { status: 404 });
}

export const config = {
  matcher: [
    // Everything except build assets and the public robots/icon files.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt).*)",
  ],
};
