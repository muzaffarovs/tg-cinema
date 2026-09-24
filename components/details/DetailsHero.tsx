import Link from "next/link";
import { TmdbImage } from "@/components/ui/TmdbImage";
import { StarIcon } from "@/components/ui/icons";
import type { MediaType } from "@/types/media";
import type { TmdbGenre } from "@/types/tmdb";
import { BackLink } from "./BackLink";

interface Props {
  mediaType: MediaType;
  title: string;
  tagline: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  meta: (string | null)[];
  rating: number;
  voteCount: number;
  genres: TmdbGenre[];
}

export function DetailsHero(p: Props) {
  const meta = p.meta.filter((m): m is string => Boolean(m));
  return (
    <header className="relative">
      <div className="relative aspect-video max-h-[50vh] w-full overflow-hidden">
        <TmdbImage
          path={p.backdropPath ?? p.posterPath}
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-bg/10" />
        <BackLink />
      </div>
      <div className="relative -mt-20 flex items-end gap-4 px-4">
        <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-xl bg-surface shadow-2xl ring-1 ring-white/10 sm:w-36">
          <TmdbImage path={p.posterPath} alt={p.title} fill sizes="144px" loading="eager" className="object-cover" />
        </div>
        <div className="min-w-0 pb-1">
          <h1 className="text-balance text-2xl leading-tight font-extrabold tracking-tight">{p.title}</h1>
          <p className="mt-1 text-xs text-muted">{meta.join(" · ")}</p>
          {p.rating > 0 ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs">
              <StarIcon size={13} className="text-yellow-400" />
              <span className="font-semibold">{p.rating.toFixed(1)}</span>
              <span className="text-muted">({p.voteCount.toLocaleString("en-US")})</span>
            </p>
          ) : null}
        </div>
      </div>
      {p.genres.length ? (
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-4">
          {p.genres.map((g) => (
            <Link
              key={g.id}
              href={`/search?type=${p.mediaType}&genre=${g.id}`}
              className="shrink-0 rounded-full border border-white/10 bg-surface px-3 py-1 text-xs text-fg/85 active:bg-surface-2"
            >
              {g.name}
            </Link>
          ))}
        </div>
      ) : null}
      {p.tagline ? <p className="mt-4 px-4 text-sm text-fg/70 italic">“{p.tagline}”</p> : null}
    </header>
  );
}
