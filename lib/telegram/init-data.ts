import { hmacSha256, timingSafeEqual, toHex } from "./crypto";

/** initData older than this is rejected (replay window). */
export const INIT_DATA_MAX_AGE_SECONDS = 24 * 60 * 60;
const MAX_INIT_DATA_LENGTH = 4096;

export interface VerifiedInitData {
  userId: number;
  authDate: number;
}

/**
 * Validates Telegram Web App initData per
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 *   secret_key = HMAC_SHA256(key = "WebAppData", msg = bot_token)
 *   hash       = hex(HMAC_SHA256(key = secret_key, msg = data_check_string))
 */
export async function verifyInitData(
  initData: string,
  botToken: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<VerifiedInitData | null> {
  if (!initData || initData.length > MAX_INIT_DATA_LENGTH) return null;

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(initData);
  } catch {
    return null;
  }

  const hash = params.get("hash");
  if (!hash || !/^[a-f0-9]{64}$/.test(hash)) return null;

  const pairs: string[] = [];
  for (const [key, value] of params) {
    if (key !== "hash") pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  const secretKey = await hmacSha256("WebAppData", botToken);
  const expected = toHex(await hmacSha256(secretKey, dataCheckString));
  if (!timingSafeEqual(expected, hash)) return null;

  const authDate = Number(params.get("auth_date"));
  if (!Number.isSafeInteger(authDate) || authDate <= 0) return null;
  if (nowSeconds - authDate > INIT_DATA_MAX_AGE_SECONDS || authDate - nowSeconds > 60) return null;

  const userId = parseUserId(params.get("user"));
  if (userId === null) return null;

  return { userId, authDate };
}

function parseUserId(rawUser: string | null): number | null {
  if (!rawUser) return null;
  try {
    const parsed: unknown = JSON.parse(rawUser);
    if (typeof parsed !== "object" || parsed === null || !("id" in parsed)) return null;
    const id = parsed.id;
    return typeof id === "number" && Number.isSafeInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}
