import Link from "next/link";
import { HScroll, Section } from "@/components/media/Section";
import { TmdbImage } from "@/components/ui/TmdbImage";
import type { TmdbSeasonSummary } from "@/types/tmdb";

export function SeasonsRow({ tvId, seasons }: { tvId: number; seasons: TmdbSeasonSummary[] }) {
  if (!seasons.length) return null;
  return (
    <Section title="Seasons">
      <HScroll>
        {seasons.map((s) => (
          <Link
            key={s.id}
            href={`/tv/${tvId}/season/${s.season_number}`}
            className="group w-[28vw] max-w-[130px] min-w-[96px] shrink-0 snap-start"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface ring-1 ring-white/5 transition-transform group-active:scale-[0.97]">
              <TmdbImage path={s.poster_path} alt={s.name} fallbackLabel={s.name} fill sizes="130px" className="object-cover" />
            </div>
            <p className="mt-1.5 line-clamp-1 text-xs font-medium">{s.name}</p>
            <p className="text-[11px] text-muted">
              {s.episode_count} ep{s.episode_count === 1 ? "" : "s"}
              {s.air_date ? ` · ${s.air_date.slice(0, 4)}` : ""}
            </p>
          </Link>
        ))}
      </HScroll>
    </Section>
  );
}
