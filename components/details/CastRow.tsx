import { HScroll, Section } from "@/components/media/Section";
import { TmdbImage } from "@/components/ui/TmdbImage";
import type { Person } from "@/types/media";

export function CastRow({ people }: { people: Person[] }) {
  if (!people.length) return null;
  return (
    <Section title="Cast">
      <HScroll>
        {people.map((p) => (
          <div key={`${p.id}-${p.role}`} className="w-20 shrink-0 snap-start text-center">
            <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full bg-surface ring-1 ring-white/5">
              <TmdbImage path={p.profilePath} alt={p.name} fill sizes="80px" className="object-cover" />
            </div>
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-tight font-medium">{p.name}</p>
            {p.role ? <p className="mt-0.5 line-clamp-1 text-[10px] text-muted">{p.role}</p> : null}
          </div>
        ))}
      </HScroll>
    </Section>
  );
}
