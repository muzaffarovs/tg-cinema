export { INIT_DATA_HEADER, SESSION_COOKIE } from "./constants";
import { fromBase64UrlToString, hmacSha256, timingSafeEqual, toBase64Url } from "./crypto";

export const SESSION_TTL_SECONDS = 24 * 60 * 60;

const SESSION_KEY_LABEL = "tg-cinema/session/v1";

interface SessionPayload {
  uid: number;
  exp: number;
}

async function sign(payload: string, botToken: string): Promise<string> {
  // Derive a dedicated key so the raw bot token is never used directly as a MAC key.
  const key = await hmacSha256(botToken, SESSION_KEY_LABEL);
  return toBase64Url(await hmacSha256(key, payload));
}

export async function createSessionToken(
  userId: number,
  botToken: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<string> {
  const payload = toBase64Url(JSON.stringify({ uid: userId, exp: nowSeconds + SESSION_TTL_SECONDS }));
  return `${payload}.${await sign(payload, botToken)}`;
}

/** Returns the session's user id if the token is authentic and unexpired. */
export async function verifySessionToken(
  token: string | undefined,
  botToken: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<number | null> {
  if (!token || token.length > 512) return null;
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0) return null;

  const expected = await sign(payload, botToken);
  if (!timingSafeEqual(expected, signature)) return null;

  const json = fromBase64UrlToString(payload);
  if (!json) return null;
  const session = parsePayload(json);
  if (!session || session.exp <= nowSeconds) return null;
  return session.uid;
}

function parsePayload(json: string): SessionPayload | null {
  try {
    const value: unknown = JSON.parse(json);
    if (typeof value !== "object" || value === null) return null;
    if (!("uid" in value) || !("exp" in value)) return null;
    const { uid, exp } = value;
    if (typeof uid !== "number" || typeof exp !== "number") return null;
    return { uid, exp };
  } catch {
    return null;
  }
}
