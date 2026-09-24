import Link from "next/link";
import { Suspense } from "react";
import { ContinueWatchingRow } from "@/components/library/ContinueWatchingRow";
import { MyListRow } from "@/components/library/MyListRow";
import { AsyncRow } from "@/components/media/AsyncRow";
import { Hero } from "@/components/media/Hero";
import { Section } from "@/components/media/Section";
import { HeroSkeleton, RowSkeleton } from "@/components/ui/Skeletons";
import { requireSession } from "@/lib/auth";
import {
  getAnime,
  getGenres,
  getPopular,
  getTopRated,
  getTrending,
  getUpcoming,
} from "@/lib/tmdb/api";

async function HeroSection() {
  const trending = await getTrending("all", "day").catch(() => []);
  const items = trending.filter((i) => i.backdropPath && i.overview).slice(0, 6);
  return <Hero items={items} />;
}

async function GenreChips() {
  const genres = await getGenres("movie").catch(() => []);
  if (!genres.length) return null;
  return (
    <Section title="Browse by Genre">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
        {genres.map((g) => (
          <Link
            key={g.id}
            href={`/search?type=movie&genre=${g.id}`}
            className="shrink-0 rounded-full border border-white/10 bg-surface px-4 py-2 text-xs font-medium text-fg/90 transition active:scale-95 active:bg-surface-2"
          >
            {g.name}
          </Link>
        ))}
      </div>
    </Section>
  );
}

export default async function HomePage() {
  await requireSession();

  return (
    <main>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <ContinueWatchingRow />
      <MyListRow />

      <Suspense fallback={<RowSkeleton />}>
        <AsyncRow title="Trending This Week" load={() => getTrending("all", "week")} />
      </Suspense>
      <Suspense fallback={<RowSkeleton />}>
        <AsyncRow title="Popular Movies" href="/search?type=movie" load={async () => (await getPopular("movie")).items} />
      </Suspense>
      <Suspense fallback={<RowSkeleton />}>
        <AsyncRow title="Popular TV" href="/search?type=tv" load={async () => (await getPopular("tv")).items} />
      </Suspense>
      <Suspense fallback={<RowSkeleton />}>
        <AsyncRow title="Anime" href="/search?type=tv&genre=16" load={async () => (await getAnime()).items} />
      </Suspense>
      <Suspense fallback={<RowSkeleton />}>
        <GenreChips />
      </Suspense>
      <Suspense fallback={<RowSkeleton />}>
        <AsyncRow title="Top Rated Movies" load={async () => (await getTopRated("movie")).items} />
      </Suspense>
      <Suspense fallback={<RowSkeleton />}>
        <AsyncRow title="Upcoming" load={async () => (await getUpcoming()).items} />
      </Suspense>
      <Suspense fallback={<RowSkeleton />}>
        <AsyncRow title="Top Rated TV" load={async () => (await getTopRated("tv")).items} />
      </Suspense>
    </main>
  );
}
