import "server-only";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { isAuthorized } from "@/lib/telegram/authorize";
import { INIT_DATA_HEADER, SESSION_COOKIE } from "@/lib/telegram/session";

/** Defense in depth for Server Components: the Proxy gates first, this re-checks. */
export async function requireSession(): Promise<void> {
  const store = await cookies();
  const ok = await isAuthorized({ sessionToken: store.get(SESSION_COOKIE)?.value, initData: null });
  if (!ok) notFound();
}

/** Route handler check: cookie or initData header. */
export async function isRequestAuthorized(request: Request): Promise<boolean> {
  const store = await cookies();
  return isAuthorized({
    sessionToken: store.get(SESSION_COOKIE)?.value,
    initData: request.headers.get(INIT_DATA_HEADER),
  });
}
