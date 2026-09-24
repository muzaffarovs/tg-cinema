import Link from "next/link";
import { TmdbImage } from "@/components/ui/TmdbImage";
import { StarIcon } from "@/components/ui/icons";
import type { MediaItem } from "@/types/media";

export const hrefFor = (item: Pick<MediaItem, "mediaType" | "id">) => `/${item.mediaType}/${item.id}`;

interface Props {
  item: MediaItem;
  /** Fixed width inside horizontal rows; fluid inside grids. */
  variant?: "row" | "grid";
}

export function MediaCard({ item, variant = "row" }: Props) {
  return (
    <Link
      href={hrefFor(item)}
      className={`group block shrink-0 snap-start ${variant === "row" ? "w-[31vw] max-w-[150px] min-w-[104px]" : "w-full"}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface ring-1 ring-white/5 transition-transform duration-200 group-active:scale-[0.97]">
        <TmdbImage
          path={item.posterPath}
          alt={item.title}
          fallbackLabel={item.title}
          fill
          sizes="(max-width: 768px) 33vw, 150px"
          className="object-cover"
        />
        {item.rating > 0 ? (
          <span className="absolute top-1.5 left-1.5 flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
            <StarIcon size={10} className="text-yellow-400" />
            {item.rating.toFixed(1)}
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 line-clamp-1 text-xs font-medium text-fg/90">{item.title}</p>
      <p className="text-[11px] text-muted">
        {item.year ?? "—"} · {item.mediaType === "tv" ? "Series" : "Movie"}
      </p>
    </Link>
  );
}
