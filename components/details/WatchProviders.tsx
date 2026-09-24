import { Section } from "@/components/media/Section";
import { TmdbImage } from "@/components/ui/TmdbImage";
import type { Provider, RegionWatchProviders } from "@/types/media";

function Group({ label, providers }: { label: string; providers: Provider[] }) {
  if (!providers.length) return null;
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold tracking-wider text-muted uppercase">{label}</p>
      <div className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <div key={p.id} className="flex items-center gap-2 rounded-lg bg-surface py-1 pr-3 pl-1 ring-1 ring-white/5">
            <div className="relative h-7 w-7 overflow-hidden rounded-md">
              <TmdbImage path={p.logoPath} alt="" fill sizes="28px" className="object-cover" />
            </div>
            <span className="text-xs">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WatchProviders({ data, region }: { data: RegionWatchProviders | null; region: string }) {
  return (
    <Section title={`Where to Watch · ${region}`}>
      <div className="space-y-4 px-4">
        {data ? (
          <>
            <Group label="Stream" providers={data.stream} />
            <Group label="Free" providers={data.free} />
            <Group label="Rent" providers={data.rent} />
            <Group label="Buy" providers={data.buy} />
            <p className="text-[10px] text-muted">Availability data provided by JustWatch via TMDB.</p>
          </>
        ) : (
          <p className="text-sm text-muted">No provider information for this region.</p>
        )}
      </div>
    </Section>
  );
}
