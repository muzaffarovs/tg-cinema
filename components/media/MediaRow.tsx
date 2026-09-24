import type { MediaItem } from "@/types/media";
import { MediaCard } from "./MediaCard";
import { HScroll, Section } from "./Section";

interface Props {
  title: string;
  items: MediaItem[];
  href?: string;
}

export function MediaRow({ title, items, href }: Props) {
  if (!items.length) return null;
  return (
    <Section title={title} href={href}>
      <HScroll>
        {items.map((item) => (
          <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
        ))}
      </HScroll>
    </Section>
  );
}
