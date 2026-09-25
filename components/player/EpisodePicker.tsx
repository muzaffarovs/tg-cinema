"use client";

import { useState } from "react";
import { useSeason } from "@/lib/use-season";
import { haptic } from "@/lib/telegram/webapp";
import { useBackHandler } from "@/components/telegram/TelegramProvider";
import { TmdbImage } from "@/components/ui/TmdbImage";
import { CloseIcon } from "@/components/ui/icons";
import type { EpisodeView } from "@/types/media";

interface Props {
  tvId: number;
  currentSeason: number;
  currentEpisode: number;
  onSelect: (episode: EpisodeView) => void;
  onClose: () => void;
}

/** Bottom sheet inside the player for switching season/episode. */
export function EpisodePicker({ tvId, currentSeason, currentEpisode, onSelect, onClose }: Props) {
  const [season, setSeason] = useState(currentSeason);
  const { data, error } = useSeason(tvId, season);
  // Keep showing the season list while another season loads.
  const { data: current } = useSeason(tvId, currentSeason);
  const seasons = data?.seasons ?? current?.seasons ?? [];

  useBackHandler(true, onClose);

  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-end bg-black/60" onClick={onClose}>
      <div
        className="flex max-h-[75%] animate-slide-up flex-col rounded-t-2xl bg-[#141418] pt-3"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom), var(--tg-safe-bottom))" }}
      >
        <div className="flex items-center justify-between px-4 pb-3">
          <p className="text-sm font-semibold">Episodes</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close episode list"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {seasons.length > 1 ? (
          <div role="tablist" aria-label="Seasons" className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto px-4 pb-3">
            {seasons.map((s) => (
              <button
                key={s.season}
                type="button"
                role="tab"
                aria-selected={s.season === season}
                onClick={() => {
                  haptic("selection");
                  setSeason(s.season);
                }}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                  s.season === season ? "bg-white text-black" : "bg-white/10 text-white/85"
                }`}
              >
                {s.season === 0 ? "Specials" : `Season ${s.season}`}
              </button>
            ))}
          </div>
        ) : null}

        <ol className="min-h-40 flex-1 space-y-1 overflow-y-auto overscroll-contain px-2">
          {data ? (
            data.episodes.map((ep) => {
              const playing = ep.season === currentSeason && ep.episode === currentEpisode;
              return (
                <li key={ep.id}>
                  <button
                    type="button"
                    disabled={!ep.released || playing}
                    onClick={() => onSelect(ep)}
                    className={`flex w-full items-center gap-3 rounded-xl p-2 text-left disabled:cursor-default ${
                      playing ? "bg-white/10" : "active:bg-white/5"
                    } ${ep.released ? "" : "opacity-40"}`}
                  >
                    <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-white/5">
                      <TmdbImage path={ep.stillPath} alt="" fill sizes="112px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-medium">
                        {ep.episode}. {ep.name}
                      </p>
                      <p className="text-[11px] text-white/50">
                        {playing ? <span className="font-semibold text-accent">Now playing · </span> : null}
                        {ep.released ? ep.meta : `Airs ${ep.meta}`}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })
          ) : error ? (
            <li className="py-8 text-center text-sm text-white/60">Couldn&apos;t load episodes.</li>
          ) : (
            <li className="flex justify-center py-10">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-white" />
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}
