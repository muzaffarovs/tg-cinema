"use client";

import { removeProgress, useLibrary } from "@/lib/storage/library";
import { buildPlayRequest } from "@/lib/play";
import { haptic } from "@/lib/telegram/webapp";
import { usePlayer } from "@/components/player/PlayerProvider";
import { HScroll, Section } from "@/components/media/Section";
import { RowSkeleton } from "@/components/ui/Skeletons";
import { TmdbImage } from "@/components/ui/TmdbImage";
import { CloseIcon, PlayIcon } from "@/components/ui/icons";

export function ContinueWatchingRow() {
  const { ready, progress } = useLibrary();
  const { play } = usePlayer();

  if (!ready) return <RowSkeleton titleWidth="w-44" />;
  if (!progress.length) return null;

  return (
    <Section title="Continue Watching">
      <HScroll>
        {progress.map((p) => {
          const pct = p.duration > 0 ? Math.min(100, (p.position / p.duration) * 100) : 0;
          return (
            <div key={`${p.mediaType}-${p.id}`} className="relative w-[62vw] max-w-[260px] shrink-0 snap-start">
              <button
                type="button"
                onClick={() => {
                  haptic("medium");
                  play(buildPlayRequest(p, p));
                }}
                className="group block w-full text-left"
              >
                <div className="relative aspect-video overflow-hidden rounded-lg bg-surface ring-1 ring-white/5 transition-transform group-active:scale-[0.97]">
                  <TmdbImage
                    path={p.backdropPath ?? p.posterPath}
                    alt={p.title}
                    fallbackLabel={p.title}
                    fill
                    sizes="260px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/30 backdrop-blur">
                      <PlayIcon size={18} />
                    </span>
                  </div>
                  {pct > 0 ? (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  ) : null}
                </div>
                <p className="mt-1.5 line-clamp-1 text-xs font-medium">{p.title}</p>
                <p className="line-clamp-1 text-[11px] text-muted">
                  {p.season !== null && p.episode !== null
                    ? `S${p.season} · E${p.episode}${p.episodeName ? ` · ${p.episodeName}` : ""}`
                    : "Movie"}
                </p>
              </button>
              <button
                type="button"
                aria-label={`Remove ${p.title} from Continue Watching`}
                onClick={() => {
                  haptic("light");
                  removeProgress(p.mediaType, p.id);
                }}
                className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur"
              >
                <CloseIcon size={14} />
              </button>
            </div>
          );
        })}
      </HScroll>
    </Section>
  );
}
