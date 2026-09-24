import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CastRow } from "@/components/details/CastRow";
import { DetailsActions } from "@/components/details/DetailsActions";
import { DetailsHero } from "@/components/details/DetailsHero";
import { ImagesRow } from "@/components/details/ImagesRow";
import { Overview } from "@/components/details/Overview";
import { SeasonsRow } from "@/components/details/SeasonsRow";
import { TrailersRow } from "@/components/details/TrailersRow";
import { WatchProviders } from "@/components/details/WatchProviders";
import { MediaRow } from "@/components/media/MediaRow";
import { requireSession } from "@/lib/auth";
import { getTmdbRegion } from "@/lib/env";
import { formatDate, formatRuntime } from "@/lib/format";
import { getTvDetails } from "@/lib/tmdb/api";
import { aggregateCastToPeople, pickTrailers, regionProviders, tvToItem } from "@/lib/tmdb/normalize";
import { parseTmdbId } from "@/lib/validation";
import type { TmdbTvDetails } from "@/types/tmdb";

async function load(params: Promise<{ id: string }>): Promise<TmdbTvDetails> {
  const id = parseTmdbId((await params).id);
  if (id === null) notFound();
  const show = await getTvDetails(id);
  if (!show) notFound();
  return show;
}

export async function generateMetadata({ params }: PageProps<"/tv/[id]">): Promise<Metadata> {
  await requireSession();
  return { title: (await load(params)).name };
}

function contentRating(show: TmdbTvDetails, region: string): string | null {
  for (const code of [region, "US"]) {
    const rating = show.content_ratings.results.find((r) => r.iso_3166_1 === code)?.rating;
    if (rating) return rating;
  }
  return null;
}

export default async function TvPage({ params }: PageProps<"/tv/[id]">) {
  await requireSession();
  const show = await load(params);
  const region = getTmdbRegion();
  const item = tvToItem(show);
  const trailers = pickTrailers(show.videos.results);

  // Specials (season 0) go last; the first regular season is the default start.
  const seasons = [...show.seasons].sort(
    (a, b) => (a.season_number === 0 ? 1 : 0) - (b.season_number === 0 ? 1 : 0) || a.season_number - b.season_number,
  );
  const firstSeason = seasons.find((s) => s.season_number > 0 && s.episode_count > 0) ?? seasons[0];
  const next = show.next_episode_to_air;

  return (
    <main>
      <DetailsHero
        mediaType="tv"
        title={show.name}
        tagline={show.tagline}
        posterPath={show.poster_path}
        backdropPath={show.backdrop_path}
        meta={[
          item.year,
          `${show.number_of_seasons} season${show.number_of_seasons === 1 ? "" : "s"}`,
          formatRuntime(show.episode_run_time[0]),
          contentRating(show, region),
        ]}
        rating={show.vote_average}
        voteCount={show.vote_count}
        genres={show.genres}
      />
      <DetailsActions
        item={item}
        trailer={trailers[0] ?? null}
        firstEpisode={firstSeason ? { season: firstSeason.season_number, episode: 1, name: null } : undefined}
      />
      <Overview text={show.overview} />
      <div className="mt-3 space-y-1 px-4 text-xs text-muted">
        {show.created_by.length ? (
          <p>
            Created by <span className="text-fg/90">{show.created_by.map((c) => c.name).join(", ")}</span>
          </p>
        ) : null}
        {show.networks.length ? (
          <p>
            Network <span className="text-fg/90">{show.networks.map((n) => n.name).join(", ")}</span>
          </p>
        ) : null}
        {next ? (
          <p>
            Next episode{" "}
            <span className="text-fg/90">
              S{next.season_number}·E{next.episode_number} — {formatDate(next.air_date) ?? "TBA"}
            </span>
          </p>
        ) : (
          <p>
            Status <span className="text-fg/90">{show.status}</span>
          </p>
        )}
      </div>
      <SeasonsRow tvId={show.id} seasons={seasons} />
      <CastRow people={aggregateCastToPeople(show.aggregate_credits.cast)} />
      <TrailersRow trailers={trailers} />
      <ImagesRow title={show.name} paths={show.images.backdrops.slice(0, 12).map((i) => i.file_path)} />
      <WatchProviders data={regionProviders(show["watch/providers"], region)} region={region} />
      <MediaRow title="Similar Shows" items={show.similar.results.slice(0, 20).map(tvToItem)} />
    </main>
  );
}
