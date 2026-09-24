import type { Metadata } from "next";
import { Suspense } from "react";
import { MediaGrid } from "@/components/media/MediaGrid";
import { Filters } from "@/components/search/Filters";
import { LoadMore } from "@/components/search/LoadMore";
import { SearchBar } from "@/components/search/SearchBar";
import { GridSkeleton } from "@/components/ui/Skeletons";
import { requireSession } from "@/lib/auth";
import { browse, getGenres, getTrending } from "@/lib/tmdb/api";
import { parseGenre, parseQuery, parseSearchScope, type SearchScope } from "@/lib/validation";
import type { BrowseResult } from "@/types/media";

export const metadata: Metadata = { title: "Search" };

interface Criteria {
  query: string;
  scope: SearchScope;
  genre: number | null;
}

async function Results({ query, scope, genre }: Criteria) {
  const landing = !query && !genre && scope === "all";
  let result: BrowseResult;
  try {
    result = landing
      ? { items: await getTrending("all", "day"), page: 1, totalPages: 1 }
      : await browse({ query, scope, genre, page: 1 });
  } catch {
    return <p className="px-4 py-16 text-center text-sm text-muted">Search is unavailable right now.</p>;
  }

  if (!result.items.length) {
    return (
      <p className="px-4 py-16 text-center text-sm text-muted">
        {query ? `No results for “${query}”.` : "Nothing found."}
      </p>
    );
  }

  const heading = landing ? "Trending Now" : query ? "Results" : "Popular";
  return (
    <section className="animate-fade-in">
      <h2 className="mb-3 px-4 text-[17px] font-bold">{heading}</h2>
      <MediaGrid items={result.items} />
      {!landing ? (
        <LoadMore
          key={`${query}|${scope}|${genre ?? ""}`}
          query={query}
          scope={scope}
          genre={genre}
          startPage={result.page}
          totalPages={result.totalPages}
          seenKeys={result.items.map((i) => `${i.mediaType}:${i.id}`)}
        />
      ) : null}
    </section>
  );
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  await requireSession();
  const sp = await searchParams;
  const query = parseQuery(sp.q);
  const scope = parseSearchScope(sp.type);
  const genre = parseGenre(sp.genre);
  const genres = await getGenres(scope === "tv" ? "tv" : "movie").catch(() => []);

  return (
    <main className="pt-safe">
      <div className="sticky top-0 z-20 space-y-3 bg-bg/90 px-4 pt-4 pb-3 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold tracking-tight">Search</h1>
        <SearchBar initialQuery={query} />
        <Filters query={query} scope={scope} genre={genre} genres={genres} />
      </div>
      <div className="mt-2">
        <Suspense key={`${query}|${scope}|${genre ?? ""}`} fallback={<GridSkeleton />}>
          <Results query={query} scope={scope} genre={genre} />
        </Suspense>
      </div>
    </main>
  );
}
