"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, apiGet } from "@/lib/api-client";
import { getProgress, removeProgress, saveProgress } from "@/lib/storage/library";
import { haptic } from "@/lib/telegram/webapp";
import { useBackHandler } from "@/components/telegram/TelegramProvider";
import { CloseIcon, NextIcon } from "@/components/ui/icons";
import type { PlaybackSource } from "@/lib/playback/types";
import type { PlaybackResponse, PlayRequest } from "@/types/player";
import { VideoPlayer } from "./VideoPlayer";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; source: PlaybackSource }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

const SAVE_INTERVAL_MS = 10_000;

interface Props {
  request: PlayRequest;
  onClose: () => void;
  onPlay: (request: PlayRequest) => void;
}

export function PlayerOverlay({ request, onClose, onPlay }: Props) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [ended, setEnded] = useState(false);
  const lastSave = useRef(0);

  useBackHandler(true, onClose);

  // Where to resume: only when the stored entry is for this exact episode.
  const [startAt] = useState(() => {
    const p = getProgress(request.mediaType, request.id);
    if (!p) return 0;
    if (request.mediaType === "tv" && (p.season !== request.season || p.episode !== request.episode)) return 0;
    return p.position;
  });

  const next = request.mediaType === "tv" ? request.upNext?.[0] : undefined;

  const record = useCallback(
    (position: number, duration: number) => {
      saveProgress({
        id: request.id,
        mediaType: request.mediaType,
        title: request.title,
        posterPath: request.posterPath,
        backdropPath: request.backdropPath,
        season: request.mediaType === "tv" ? request.season : null,
        episode: request.mediaType === "tv" ? request.episode : null,
        episodeName: request.mediaType === "tv" ? request.episodeName : null,
        position,
        duration,
      });
    },
    [request],
  );

  // Lock page scroll while the player is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Resolve the source. The component is keyed per episode, so this runs once per title/episode.
  useEffect(() => {
    const controller = new AbortController();
    const params =
      request.mediaType === "movie"
        ? { type: "movie", id: request.id }
        : { type: "tv", id: request.id, season: request.season, episode: request.episode };

    apiGet<PlaybackResponse>("/api/playback", params, controller.signal)
      .then((res) => {
        if (!res.configured) {
          setState({ status: "unavailable", message: "Playback is not configured on this server." });
        } else if (!res.source) {
          setState({ status: "unavailable", message: "This title isn't available from your playback source." });
        } else {
          setState({ status: "ready", source: res.source });
          // Iframe players can't report progress; still record it for Continue Watching.
          if (res.source.type === "iframe") record(startAt, 0);
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          error instanceof ApiError && error.status === 429
            ? "Too many requests. Try again in a minute."
            : "Couldn't load the playback source.";
        setState({ status: "error", message });
      });
    return () => controller.abort();
  }, [request, record, startAt]);

  const onProgress = useCallback(
    (position: number, duration: number, force: boolean) => {
      const now = Date.now();
      if (!force && now - lastSave.current < SAVE_INTERVAL_MS) return;
      lastSave.current = now;
      record(position, duration);
    },
    [record],
  );

  const onEnded = useCallback(() => {
    setEnded(true);
    if (request.mediaType === "movie") removeProgress("movie", request.id);
  }, [request]);

  const playNext = () => {
    if (request.mediaType !== "tv" || !next) return;
    haptic("light");
    onPlay({
      ...request,
      season: next.season,
      episode: next.episode,
      episodeName: next.name,
      upNext: request.upNext?.slice(1),
    });
  };

  const subtitle =
    request.mediaType === "tv"
      ? `S${request.season} · E${request.episode}${request.episodeName ? ` — ${request.episodeName}` : ""}`
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Playing ${request.title}`}
      className="fixed inset-0 z-50 flex animate-slide-up flex-col bg-black text-white"
    >
      <header className="pt-safe flex items-center gap-3 bg-gradient-to-b from-black to-transparent px-3 pb-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close player"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
        >
          <CloseIcon />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{request.title}</p>
          {subtitle ? <p className="truncate text-xs text-white/60">{subtitle}</p> : null}
        </div>
      </header>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {state.status === "loading" ? (
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/15 border-t-accent" />
        ) : null}

        {state.status === "unavailable" || state.status === "error" ? (
          <div className="max-w-xs px-6 text-center">
            <p className="text-sm text-white/80">{state.message}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold active:bg-white/20"
            >
              Close
            </button>
          </div>
        ) : null}

        {state.status === "ready" && state.source.type === "iframe" ? (
          <iframe
            src={state.source.url}
            title={state.source.title || request.title}
            className="h-full w-full border-0"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : null}

        {state.status === "ready" && state.source.type !== "iframe" ? (
          <VideoPlayer
            src={state.source.url}
            type={state.source.type}
            startAt={startAt}
            onProgress={onProgress}
            onEnded={onEnded}
            onError={() => setState({ status: "error", message: "Playback failed for this source." })}
          />
        ) : null}
      </div>

      {next ? (
        <footer
          className="flex justify-end px-4 pt-2"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom), var(--tg-safe-bottom))" }}
        >
          <button
            type="button"
            onClick={playNext}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
              ended ? "bg-accent text-accent-fg" : "bg-white/10 active:bg-white/20"
            }`}
          >
            <NextIcon size={16} />
            Next: E{next.episode}
            {next.name ? <span className="max-w-[40vw] truncate font-normal opacity-80">{next.name}</span> : null}
          </button>
        </footer>
      ) : null}
    </div>
  );
}
