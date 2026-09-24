import { getAllowedUserId, getTelegramBotToken, isDevAuthBypass, isUserAllowed } from "@/lib/env";
import { verifyInitData } from "./init-data";
import { verifySessionToken } from "./session";

export interface AuthInput {
  sessionToken: string | undefined;
  initData: string | null;
}

/**
 * Single source of truth for "is this request from the allowed user?".
 * Accepts a signed session cookie, or raw initData (header fallback for
 * clients where the cookie is blocked).
 */
export async function isAuthorized({ sessionToken, initData }: AuthInput): Promise<boolean> {
  if (isDevAuthBypass()) return true;

  const botToken = getTelegramBotToken();
  const allowedId = getAllowedUserId();
  if (!botToken || allowedId === null) return false;

  if (sessionToken) {
    const uid = await verifySessionToken(sessionToken, botToken);
    if (uid !== null && isUserAllowed(uid, allowedId)) return true;
  }
  if (initData) {
    const verified = await verifyInitData(initData, botToken);
    if (verified && isUserAllowed(verified.userId, allowedId)) return true;
  }
  return false;
}
