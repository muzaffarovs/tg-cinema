"use client";

import { useLibrary } from "@/lib/storage/library";
import { haptic } from "@/lib/telegram/webapp";
import { usePlayer } from "@/components/player/PlayerProvider";
import { TmdbImage } from "@/components/ui/TmdbImage";
import { PlayIcon } from "@/components/ui/icons";
import type { EpisodeRef } from "@/types/player";

export interface EpisodeView {
  id: number;
  season: number;
  episode: number;
  name: string;
  overview: string;
  stillPath: string | null;
  meta: string;
  released: boolean;
}

interface Props {
  show: { id: number; title: string; posterPath: string | null; backdropPath: string | null };
  episodes: EpisodeView[];
}

export function EpisodeList({ show, episodes }: Props) {
  const { play } = usePlayer();
  const { progress } = useLibrary();
  const last = progress.find((p) => p.mediaType === "tv" && p.id === show.id) ?? null;

  const start = (index: number) => {
    const ep = episodes[index];
    if (!ep) return;
    haptic("medium");
    const upNext: EpisodeRef[] = episodes
      .slice(index + 1)
      .filter((e) => e.released)
      .map((e) => ({ season: e.season, episode: e.episode, name: e.name }));
    play({
      mediaType: "tv",
      id: show.id,
      title: show.title,
      posterPath: show.posterPath,
      backdropPath: show.backdropPath,
      season: ep.season,
      episode: ep.episode,
      episodeName: ep.name,
      upNext,
    });
  };

  if (!episodes.length) {
    return <p className="px-4 py-10 text-center text-sm text-muted">No episodes announced yet.</p>;
  }

  return (
    <ol className="space-y-4 px-4">
      {episodes.map((ep, i) => {
        const isLast = last?.season === ep.season && last.episode === ep.episode;
        const pct = isLast && last.duration > 0 ? Math.min(100, (last.position / last.duration) * 100) : 0;
        return (
          <li key={ep.id} className="animate-fade-in">
            <button
              type="button"
              disabled={!ep.released}
              onClick={() => start(i)}
              className="group flex w-full gap-3 text-left disabled:opacity-50"
            >
              <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-lg bg-surface ring-1 ring-white/5 transition-transform group-active:scale-[0.97] sm:w-44">
                <TmdbImage path={ep.stillPath} alt="" fill sizes="176px" className="object-cover" />
                {ep.released ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/30">
                      <PlayIcon size={15} />
                    </span>
                  </span>
                ) : null}
                {isLast ? (
                  <span className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                    <span className="block h-full bg-accent" style={{ width: `${Math.max(pct, 4)}%` }} />
                  </span>
                ) : null}
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <p className="line-clamp-2 text-sm font-semibold">
                  {ep.episode}. {ep.name}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {isLast ? <span className="font-semibold text-accent">Last watched · </span> : null}
                  {ep.meta}
                </p>
                <p className="mt-1 line-clamp-3 text-xs text-fg/70">{ep.overview}</p>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
