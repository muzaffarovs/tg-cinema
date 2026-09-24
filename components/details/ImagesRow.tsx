"use client";

import { useState } from "react";
import { HScroll, Section } from "@/components/media/Section";
import { Modal } from "@/components/ui/Modal";
import { TmdbImage } from "@/components/ui/TmdbImage";

export function ImagesRow({ paths, title }: { paths: string[]; title: string }) {
  const [active, setActive] = useState<string | null>(null);
  if (!paths.length) return null;

  return (
    <Section title="Images">
      <HScroll>
        {paths.map((path) => (
          <button
            key={path}
            type="button"
            onClick={() => setActive(path)}
            className="relative aspect-video w-[62vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-lg bg-surface ring-1 ring-white/5 transition-transform active:scale-[0.97]"
            aria-label={`Open image from ${title}`}
          >
            <TmdbImage path={path} alt="" fill sizes="280px" className="object-cover" />
          </button>
        ))}
      </HScroll>
      <Modal open={active !== null} onClose={() => setActive(null)} label={`${title} image`}>
        {active ? (
          <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl">
            <TmdbImage path={active} alt={title} fill sizes="100vw" className="object-contain" />
          </div>
        ) : null}
      </Modal>
    </Section>
  );
}
