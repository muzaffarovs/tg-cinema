# Cinema — private Telegram Mini App

A personal media discovery and playback Mini App for a single Telegram user.
Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS v4 · Telegram Web Apps SDK · TMDB.

No ads, analytics, tracking, accounts, or registration.

## How access control works

1. Every page request goes through `proxy.ts`. Without a valid session it returns a
   **404 gate page**. The gate page contains no app code or data.
2. Inside Telegram, the gate posts `Telegram.WebApp.initData` to `POST /api/auth`.
3. The server verifies the initData HMAC with `TELEGRAM_BOT_TOKEN` and checks that
   `auth_date` is fresh (≤ 24h). It then requires `user.id === ALLOWED_TELEGRAM_USER_ID`.
   Anything else gets a 404.
4. On success the server sets an HttpOnly, signed session cookie (24h,
   `SameSite=None; Secure; Partitioned`, so it also works inside Telegram Web's iframe), and the page reloads.
5. API routes accept the session cookie, or raw initData in `x-telegram-init-data`
   (re-verified on every request) as a fallback when cookies are blocked.
6. Server Components call `requireSession()` again as defense in depth.

The TMDB key, bot token and playback configuration are only read on the server (`lib/env.ts`,
`server-only` modules). The browser talks only to this app and to image/video CDNs.

Rate limits (per IP, per instance): `/api/auth` 10/min, other `/api/*` 120/min, pages 300/min.
`robots.txt` disallows everything. Every response carries `X-Robots-Tag: noindex`, and pages include
`<meta name="robots" content="noindex">`.

## Playback providers

The UI asks `GET /api/playback` for a `PlaybackSource` (`iframe` | `hls` | `mp4`) and never
knows where it comes from. `lib/playback/index.ts` picks an implementation from the environment:

| `PLAYBACK_PROVIDER_URL`                     | Provider                        |
| ------------------------------------------- | ------------------------------- |
| empty                                       | `NullPlaybackProvider` (Play shows "not configured") |
| contains `{tmdbId}` / `{season}` / `{episode}` / `{type}` | `TemplatePlaybackProvider` |
| plain base URL                              | `HttpResolverPlaybackProvider`  |

**Template mode:** URLs are built from templates. Set `PLAYBACK_PROVIDER_URL` for movies
(e.g. `https://media.example.com/movies/{tmdbId}.m3u8`) and `PLAYBACK_PROVIDER_TV_URL` for episodes
(e.g. `https://media.example.com/tv/{tmdbId}/s{season}/e{episode}.m3u8`). The source type is inferred
from the extension (`.m3u8` → hls, `.mp4`/`.webm` → mp4, otherwise iframe), or forced with `PLAYBACK_SOURCE_TYPE`.

**Resolver mode:** the server calls your service and expects JSON
`{ "url": "https://…", "type": "hls" | "mp4" | "iframe", "title": "…" }`. A 404 means "not available".
- `GET {base}/movie/{tmdbId}`
- `GET {base}/tv/{tmdbId}/{season}/{episode}`

If `PLAYBACK_PROVIDER_TOKEN` is set, it is sent as `Authorization: Bearer …`.

Only `https` source URLs are accepted. To add another backend, implement `PlaybackProvider`
in `lib/playback/providers/` and select it in `lib/playback/index.ts`. Only configure sources you are authorized to use.

## Project layout

```
app/                 routes: /, /search, /library, /movie/[id], /tv/[id], /tv/[id]/season/[season]
  api/auth           initData → session cookie
  api/playback       resolves a PlaybackSource
  api/browse         search/discover pagination
components/          UI (media rows, details, player, search, library, telegram)
lib/tmdb/            server-only TMDB client, API functions, normalizers, image loader
lib/telegram/        initData verification, sessions, gate page, client SDK helpers
lib/playback/        PlaybackProvider interface + implementations
lib/storage/         CloudStorage/localStorage key-value store and the watchlist/progress store
types/               TMDB, Telegram SDK, media, library, player types
proxy.ts             auth gate + rate limiting
```

## Local development

```bash
cp .env.example .env.local   # fill in values
npm install
npm run dev
```

Outside Telegram there is no initData. To browse locally, set `DEV_BYPASS_AUTH=true`. This works only
under `next dev` and is ignored in production. `TMDB_API_BASE_URL` (also dev-only) can point TMDB calls at a local mock.

## Deploy (Vercel)

1. Import the repo into Vercel and add the environment variables from `.env.example`.
2. Deploy, then in @BotFather: `/mybots` → your bot → *Bot Settings* → *Configure Mini App* (or *Menu Button*) →
   set the URL to your deployment, e.g. `https://your-app.vercel.app`.
3. Open the Mini App from the bot.

Checks: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
