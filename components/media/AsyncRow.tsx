import type { MediaItem } from "@/types/media";
import { MediaRow } from "./MediaRow";

interface Props {
  title: string;
  href?: string;
  load: () => Promise<MediaItem[]>;
}

/** Server component: fetches one row. A failing row renders nothing instead of breaking the page. */
export async function AsyncRow({ title, href, load }: Props) {
  let items: MediaItem[] = [];
  try {
    items = await load();
  } catch (error) {
    console.error(`[row:${title}]`, error instanceof Error ? error.message : error);
  }
  return <MediaRow title={title} href={href} items={items} />;
}
