import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CastRow } from "@/components/details/CastRow";
import { DetailsActions } from "@/components/details/DetailsActions";
import { DetailsHero } from "@/components/details/DetailsHero";
import { ImagesRow } from "@/components/details/ImagesRow";
import { Overview } from "@/components/details/Overview";
import { TrailersRow } from "@/components/details/TrailersRow";
import { WatchProviders } from "@/components/details/WatchProviders";
import { MediaRow } from "@/components/media/MediaRow";
import { requireSession } from "@/lib/auth";
import { getTmdbRegion } from "@/lib/env";
import { formatRuntime } from "@/lib/format";
import { getMovieDetails } from "@/lib/tmdb/api";
import { castToPeople, movieToItem, pickTrailers, regionProviders } from "@/lib/tmdb/normalize";
import { parseTmdbId } from "@/lib/validation";
import type { TmdbMovieDetails } from "@/types/tmdb";

async function load(params: Promise<{ id: string }>): Promise<TmdbMovieDetails> {
  const id = parseTmdbId((await params).id);
  if (id === null) notFound();
  const movie = await getMovieDetails(id);
  if (!movie) notFound();
  return movie;
}

export async function generateMetadata({ params }: PageProps<"/movie/[id]">): Promise<Metadata> {
  await requireSession();
  return { title: (await load(params)).title };
}

function certification(movie: TmdbMovieDetails, region: string): string | null {
  for (const code of [region, "US"]) {
    const entry = movie.release_dates.results.find((r) => r.iso_3166_1 === code);
    const cert = entry?.release_dates.find((d) => d.certification)?.certification;
    if (cert) return cert;
  }
  return null;
}

export default async function MoviePage({ params }: PageProps<"/movie/[id]">) {
  await requireSession();
  const movie = await load(params);
  const region = getTmdbRegion();
  const item = movieToItem(movie);
  const trailers = pickTrailers(movie.videos.results);
  const director = movie.credits.crew.find((c) => c.job === "Director");

  return (
    <main>
      <DetailsHero
        mediaType="movie"
        title={movie.title}
        tagline={movie.tagline}
        posterPath={movie.poster_path}
        backdropPath={movie.backdrop_path}
        meta={[item.year, formatRuntime(movie.runtime), certification(movie, region)]}
        rating={movie.vote_average}
        voteCount={movie.vote_count}
        genres={movie.genres}
      />
      <DetailsActions item={item} trailer={trailers[0] ?? null} />
      <Overview text={movie.overview} />
      {director ? (
        <p className="mt-3 px-4 text-xs text-muted">
          Directed by <span className="text-fg/90">{director.name}</span>
        </p>
      ) : null}
      <CastRow people={castToPeople(movie.credits.cast)} />
      <TrailersRow trailers={trailers} />
      <ImagesRow title={movie.title} paths={movie.images.backdrops.slice(0, 12).map((i) => i.file_path)} />
      <WatchProviders data={regionProviders(movie["watch/providers"], region)} region={region} />
      <MediaRow title="Similar Movies" items={movie.similar.results.slice(0, 20).map(movieToItem)} />
    </main>
  );
}
