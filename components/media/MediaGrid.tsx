import type { MediaItem } from "@/types/media";
import { MediaCard } from "./MediaCard";

export function MediaGrid({ items }: { items: MediaItem[] }) {
  return (
    <div className="grid grid-cols-3 gap-x-3 gap-y-4 px-4 sm:grid-cols-4 md:grid-cols-5">
      {items.map((item) => (
        <MediaCard key={`${item.mediaType}-${item.id}`} item={item} variant="grid" />
      ))}
    </div>
  );
}
