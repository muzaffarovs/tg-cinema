"use client";

import { useState } from "react";
import { primeSeason, useSeason } from "@/lib/use-season";
import { haptic } from "@/lib/telegram/webapp";
import { Section } from "@/components/media/Section";
import { EpisodeListSkeleton } from "@/components/ui/Skeletons";
import type { SeasonPayload } from "@/types/media";
import { EpisodeList } from "./EpisodeList";

interface Props {
  show: { id: number; title: string; posterPath: string | null; backdropPath: string | null };
  /** Server-rendered default season (also carries the season list). */
  initial: SeasonPayload;
}

/** Season tabs + episode list on the TV details page. Other seasons load on demand. */
export function SeasonEpisodes({ show, initial }: Props) {
  const [season, setSeason] = useState(initial.season);
  primeSeason(show.id, initial); // idempotent: server data for the default season
  const { data, error } = useSeason(show.id, season);

  return (
    <Section title="Episodes" href={`/tv/${show.id}/season/${season}`}>
      {initial.seasons.length > 1 ? (
        <div role="tablist" aria-label="Seasons" className="no-scrollbar mb-4 flex gap-2 overflow-x-auto px-4">
          {initial.seasons.map((s) => {
            const active = s.season === season;
            return (
              <button
                key={s.season}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  haptic("selection");
                  setSeason(s.season);
                }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  active ? "bg-fg text-bg" : "border border-white/10 bg-surface text-fg/85"
                }`}
              >
                {s.season === 0 ? "Specials" : `Season ${s.season}`}
                <span className={`ml-1.5 ${active ? "text-bg/60" : "text-muted"}`}>{s.episodeCount}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      {data ? (
        <EpisodeList show={show} episodes={data.episodes} />
      ) : error ? (
        <p className="px-4 py-8 text-center text-sm text-muted">Couldn&apos;t load this season.</p>
      ) : (
        <EpisodeListSkeleton />
      )}
    </Section>
  );
}
