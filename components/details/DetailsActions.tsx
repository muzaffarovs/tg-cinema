"use client";

import { useEffect, useRef, useState } from "react";
import { getProgress, useLibrary } from "@/lib/storage/library";
import { buildPlayRequest, playLabel } from "@/lib/play";
import { haptic } from "@/lib/telegram/webapp";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useMainButton } from "@/components/telegram/useMainButton";
import { WatchlistButton } from "@/components/library/WatchlistButton";
import { Modal } from "@/components/ui/Modal";
import { FilmIcon, PlayIcon } from "@/components/ui/icons";
import type { MediaItem, Trailer } from "@/types/media";
import type { EpisodeRef } from "@/types/player";

interface Props {
  item: MediaItem;
  trailer: Trailer | null;
  /** TV only: episode to start from when nothing has been watched yet. */
  firstEpisode?: EpisodeRef;
}

export function DetailsActions({ item, trailer, firstEpisode }: Props) {
  const { play, isOpen } = usePlayer();
  const library = useLibrary();
  const progress = library.progress.find((p) => p.mediaType === item.mediaType && p.id === item.id) ?? null;
  const [showTrailer, setShowTrailer] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(true);
  const playRef = useRef<HTMLButtonElement>(null);

  const label = playLabel(item.mediaType, progress);
  const start = () => {
    haptic("medium");
    play(buildPlayRequest(item, getProgress(item.mediaType, item.id), firstEpisode));
  };

  // Show Telegram's MainButton once the in-page Play button scrolls away.
  useEffect(() => {
    const el = playRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setButtonVisible(entry?.isIntersecting ?? true));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useMainButton({ text: `▶ ${label}`, visible: !buttonVisible && !isOpen && !showTrailer, onClick: start });

  return (
    <>
      <div className="mt-5 flex items-center gap-2 px-4">
        <button
          ref={playRef}
          type="button"
          onClick={start}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-sm font-bold text-accent-fg transition active:scale-[0.97]"
        >
          <PlayIcon size={18} />
          {label}
        </button>
        {trailer ? (
          <button
            type="button"
            onClick={() => setShowTrailer(true)}
            aria-label="Watch trailer"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2 text-fg transition active:scale-90"
          >
            <FilmIcon size={20} />
          </button>
        ) : null}
        <WatchlistButton item={item} />
      </div>
      {trailer ? (
        <Modal open={showTrailer} onClose={() => setShowTrailer(false)} label={trailer.name}>
          <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&playsinline=1&rel=0`}
              title={trailer.name}
              className="h-full w-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </Modal>
      ) : null}
    </>
  );
}
