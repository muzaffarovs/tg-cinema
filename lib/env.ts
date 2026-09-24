/**
 * Server-side environment access. Never import from client components —
 * none of these values may reach the browser bundle.
 */

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function required(name: string): string {
  const value = read(name);
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

export function getTelegramBotToken(): string | undefined {
  return read("TELEGRAM_BOT_TOKEN");
}

/**
 * Who may use the app: a numeric Telegram user id, "any" (any Telegram user
 * with valid signed initData, set via `*`), or null if misconfigured.
 */
export type AllowedUsers = number | "any";

export function getAllowedUserId(): AllowedUsers | null {
  const raw = read("ALLOWED_TELEGRAM_USER_ID");
  if (raw === "*") return "any";
  if (!raw || !/^\d{1,20}$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function isDevAuthBypass(): boolean {
  return process.env.NODE_ENV === "development" && read("DEV_BYPASS_AUTH") === "true";
}

export function getTmdbApiKey(): string {
  return required("TMDB_API_KEY");
}

export function getTmdbRegion(): string {
  const region = read("TMDB_REGION")?.toUpperCase();
  return region && /^[A-Z]{2}$/.test(region) ? region : "UZ";
}

export function getTmdbLanguage(): string {
  const lang = read("TMDB_LANGUAGE");
  return lang && /^[a-z]{2}(-[A-Z]{2})?$/.test(lang) ? lang : "en-US";
}

export interface PlaybackEnv {
  url: string | undefined;
  tvUrl: string | undefined;
  token: string | undefined;
  forcedType: string | undefined;
}

export function getPlaybackEnv(): PlaybackEnv {
  return {
    url: read("PLAYBACK_PROVIDER_URL"),
    tvUrl: read("PLAYBACK_PROVIDER_TV_URL"),
    token: read("PLAYBACK_PROVIDER_TOKEN"),
    forcedType: read("PLAYBACK_SOURCE_TYPE"),
  };
}

export function isUserAllowed(userId: number, allowed: AllowedUsers): boolean {
  return allowed === "any" ? Number.isSafeInteger(userId) && userId > 0 : userId === allowed;
}
