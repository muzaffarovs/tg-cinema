import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/details/BackLink";
import { EpisodeList, type EpisodeView } from "@/components/details/EpisodeList";
import { Overview } from "@/components/details/Overview";
import { TmdbImage } from "@/components/ui/TmdbImage";
import { requireSession } from "@/lib/auth";
import { formatDate, formatRuntime } from "@/lib/format";
import { getSeasonDetails, getTvDetails } from "@/lib/tmdb/api";
import { parseSeason, parseTmdbId } from "@/lib/validation";

type Params = Promise<{ id: string; season: string }>;

async function load(params: Params) {
  const raw = await params;
  const id = parseTmdbId(raw.id);
  const seasonNumber = parseSeason(raw.season);
  if (id === null || seasonNumber === null) notFound();
  const [show, season] = await Promise.all([getTvDetails(id), getSeasonDetails(id, seasonNumber)]);
  if (!show || !season) notFound();
  return { show, season };
}

export async function generateMetadata({ params }: PageProps<"/tv/[id]/season/[season]">): Promise<Metadata> {
  await requireSession();
  const { show, season } = await load(params);
  return { title: `${show.name} — ${season.name}` };
}

export default async function SeasonPage({ params }: PageProps<"/tv/[id]/season/[season]">) {
  await requireSession();
  const { show, season } = await load(params);
  const today = new Date().toISOString().slice(0, 10);

  const episodes: EpisodeView[] = season.episodes.map((e) => ({
    id: e.id,
    season: e.season_number,
    episode: e.episode_number,
    name: e.name,
    overview: e.overview,
    stillPath: e.still_path,
    meta: [formatDate(e.air_date) ?? "TBA", formatRuntime(e.runtime)].filter(Boolean).join(" · "),
    released: Boolean(e.air_date && e.air_date <= today),
  }));

  const seasons = show.seasons.filter((s) => s.episode_count > 0);

  return (
    <main>
      <header className="relative">
        <div className="relative aspect-[21/9] max-h-[36vh] w-full overflow-hidden">
          <TmdbImage
            path={show.backdrop_path ?? season.poster_path}
            alt=""
            fill
            sizes="100vw"
            loading="eager"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
          <BackLink />
        </div>
        <div className="relative -mt-12 px-4">
          <Link href={`/tv/${show.id}`} className="text-xs font-semibold text-muted">
            {show.name}
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">{season.name}</h1>
          <p className="mt-0.5 text-xs text-muted">
            {season.episodes.length} episodes{season.air_date ? ` · ${season.air_date.slice(0, 4)}` : ""}
          </p>
        </div>
      </header>

      {seasons.length > 1 ? (
        <nav aria-label="Seasons" className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-4">
          {seasons.map((s) => {
            const active = s.season_number === season.season_number;
            return (
              <Link
                key={s.id}
                href={`/tv/${show.id}/season/${s.season_number}`}
                replace
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  active ? "bg-fg text-bg" : "border border-white/10 bg-surface text-fg/85"
                }`}
              >
                {s.season_number === 0 ? "Specials" : `Season ${s.season_number}`}
              </Link>
            );
          })}
        </nav>
      ) : null}

      <Overview text={season.overview} />

      <div className="mt-6">
        <EpisodeList
          show={{ id: show.id, title: show.name, posterPath: show.poster_path, backdropPath: show.backdrop_path }}
          episodes={episodes}
        />
      </div>
    </main>
  );
}
