"use client";

import type Hls from "hls.js";
import { useEffect, useRef } from "react";

interface Props {
  src: string;
  type: "hls" | "mp4";
  startAt: number;
  onProgress: (position: number, duration: number, force: boolean) => void;
  onEnded: () => void;
  onError: () => void;
}

/** Native <video>, with hls.js loaded on demand where HLS isn't native (Android/desktop). */
export function VideoPlayer({ src, type, startAt, onProgress, onEnded, onError }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const callbacks = useRef({ onProgress, onEnded, onError });
  useEffect(() => {
    callbacks.current = { onProgress, onEnded, onError };
  });

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let hls: Hls | null = null;
    let cancelled = false;

    const seek = () => {
      if (startAt > 0 && Number.isFinite(video.duration) && startAt < video.duration - 30) {
        video.currentTime = startAt;
      }
    };
    video.addEventListener("loadedmetadata", seek, { once: true });

    if (type === "hls" && !video.canPlayType("application/vnd.apple.mpegurl")) {
      void import("hls.js").then(({ default: HlsCtor }) => {
        if (cancelled) return;
        if (!HlsCtor.isSupported()) {
          callbacks.current.onError();
          return;
        }
        hls = new HlsCtor({ enableWorker: true, capLevelToPlayerSize: true });
        hls.on(HlsCtor.Events.ERROR, (_event, data) => {
          if (data.fatal) callbacks.current.onError();
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      });
    } else {
      video.src = src;
    }

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", seek);
      if (video.currentTime > 0) callbacks.current.onProgress(video.currentTime, video.duration || 0, true);
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, type, startAt]);

  return (
    <video
      ref={ref}
      className="h-full w-full bg-black object-contain"
      controls
      autoPlay
      playsInline
      preload="metadata"
      onTimeUpdate={(e) => onProgress(e.currentTarget.currentTime, e.currentTarget.duration || 0, false)}
      onPause={(e) => onProgress(e.currentTarget.currentTime, e.currentTarget.duration || 0, true)}
      onEnded={() => onEnded()}
      onError={() => onError()}
    />
  );
}
