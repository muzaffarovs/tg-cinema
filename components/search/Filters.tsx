import Link from "next/link";
import type { SearchScope } from "@/lib/validation";
import type { TmdbGenre } from "@/types/tmdb";

interface Props {
  query: string;
  scope: SearchScope;
  genre: number | null;
  genres: TmdbGenre[];
}

function href(q: string, type: SearchScope, genre: number | null): string {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (type !== "all") p.set("type", type);
  if (genre) p.set("genre", String(genre));
  const s = p.toString();
  return s ? `/search?${s}` : "/search";
}

const SCOPES: { value: SearchScope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Shows" },
];

export function Filters({ query, scope, genre, genres }: Props) {
  // Genre ids differ between movies and TV; "All" + genre narrows to movies.
  const genreScope: SearchScope = scope === "all" ? "movie" : scope;
  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-xl bg-surface p-1">
        {SCOPES.map((s) => (
          <Link
            key={s.value}
            href={href(query, s.value, s.value === scope ? genre : null)}
            replace
            scroll={false}
            aria-current={s.value === scope ? "page" : undefined}
            className={`flex-1 rounded-lg py-2 text-center text-xs font-semibold transition ${
              s.value === scope ? "bg-surface-2 text-fg shadow" : "text-muted"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>
      {genres.length ? (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {genres.map((g) => {
            const active = g.id === genre;
            return (
              <Link
                key={g.id}
                href={href(query, genreScope, active ? null : g.id)}
                replace
                scroll={false}
                aria-pressed={active}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  active ? "bg-accent text-accent-fg" : "border border-white/10 bg-surface text-fg/85"
                }`}
              >
                {g.name}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
