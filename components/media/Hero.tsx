"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getProgress } from "@/lib/storage/library";
import { buildPlayRequest } from "@/lib/play";
import { haptic } from "@/lib/telegram/webapp";
import { usePlayer } from "@/components/player/PlayerProvider";
import { WatchlistButton } from "@/components/library/WatchlistButton";
import { TmdbImage } from "@/components/ui/TmdbImage";
import { PlayIcon, StarIcon } from "@/components/ui/icons";
import type { MediaItem } from "@/types/media";
import { hrefFor } from "./MediaCard";

const AUTO_ADVANCE_MS = 7000;

export function Hero({ items }: { items: MediaItem[] }) {
  const { play, isOpen } = usePlayer();
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (paused || isOpen || items.length < 2) return;
    const timer = window.setInterval(() => {
      const el = scroller.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % items.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [paused, isOpen, items.length]);

  if (!items.length) return null;

  return (
    <div className="relative" onTouchStart={() => setPaused(true)} onMouseEnter={() => setPaused(true)}>
      <div ref={scroller} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
        {items.map((item, i) => (
          <article key={`${item.mediaType}-${item.id}`} className="relative w-full shrink-0 snap-center">
            <div className="relative aspect-[4/5] max-h-[72vh] w-full sm:aspect-video">
              <TmdbImage
                path={item.backdropPath ?? item.posterPath}
                alt=""
                fill
                sizes="100vw"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-bg/70 via-transparent to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 px-4 pb-8">
              <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-widest text-white/70 uppercase">
                <span className="rounded bg-accent px-1.5 py-0.5 text-accent-fg">Trending</span>
                {item.mediaType === "tv" ? "Series" : "Movie"}
                {item.year ? ` · ${item.year}` : ""}
                {item.rating > 0 ? (
                  <span className="flex items-center gap-0.5 normal-case">
                    · <StarIcon size={11} className="text-yellow-400" /> {item.rating.toFixed(1)}
                  </span>
                ) : null}
              </p>
              <h1 className="text-balance text-3xl leading-tight font-extrabold tracking-tight drop-shadow-lg sm:text-4xl">
                {item.title}
              </h1>
              <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/75">{item.overview}</p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    haptic("medium");
                    play(buildPlayRequest(item, getProgress(item.mediaType, item.id)));
                  }}
                  className="flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-black transition active:scale-95"
                >
                  <PlayIcon size={18} /> Play
                </button>
                <WatchlistButton item={item} variant="pill" />
                <Link
                  href={hrefFor(item)}
                  className="flex h-11 items-center rounded-full px-4 text-sm font-semibold text-white/85 active:text-white"
                >
                  Details
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      {items.length > 1 ? (
        <div className="absolute right-4 bottom-3 flex gap-1.5" aria-hidden>
          {items.map((item, i) => (
            <span
              key={item.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/35"}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
