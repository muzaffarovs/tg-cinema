"use client";

import Image from "next/image";
import { useState } from "react";
import { HScroll, Section } from "@/components/media/Section";
import { Modal } from "@/components/ui/Modal";
import { PlayIcon } from "@/components/ui/icons";
import type { Trailer } from "@/types/media";

export function TrailersRow({ trailers }: { trailers: Trailer[] }) {
  const [active, setActive] = useState<Trailer | null>(null);
  if (!trailers.length) return null;

  return (
    <Section title="Trailers & Videos">
      <HScroll>
        {trailers.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t)}
            className="group w-[62vw] max-w-[280px] shrink-0 snap-start text-left"
          >
            <div className="relative aspect-video overflow-hidden rounded-lg bg-surface ring-1 ring-white/5 transition-transform group-active:scale-[0.97]">
              <Image
                src={`https://i.ytimg.com/vi/${t.key}/hqdefault.jpg`}
                alt=""
                fill
                sizes="280px"
                unoptimized
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/30">
                  <PlayIcon size={18} />
                </span>
              </div>
            </div>
            <p className="mt-1.5 line-clamp-1 text-xs font-medium">{t.name}</p>
            <p className="text-[11px] text-muted">{t.type}</p>
          </button>
        ))}
      </HScroll>
      <Modal open={active !== null} onClose={() => setActive(null)} label={active?.name ?? "Trailer"}>
        {active ? (
          <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${active.key}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
              title={active.name}
              className="h-full w-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : null}
      </Modal>
    </Section>
  );
}
