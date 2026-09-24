export function Bone({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function RowSkeleton({ titleWidth = "w-36" }: { titleWidth?: string }) {
  return (
    <div className="mt-7" aria-hidden>
      <Bone className={`mx-4 mb-3 h-5 ${titleWidth}`} />
      <div className="flex gap-3 overflow-hidden px-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="w-[31vw] max-w-[150px] min-w-[104px] shrink-0">
            <Bone className="aspect-[2/3] w-full" />
            <Bone className="mt-2 h-3 w-3/4" />
            <Bone className="mt-1 h-2.5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative aspect-[4/5] max-h-[72vh] w-full sm:aspect-video" aria-hidden>
      <Bone className="absolute inset-0 rounded-none" />
      <div className="absolute inset-x-4 bottom-6 space-y-3">
        <Bone className="h-8 w-2/3" />
        <Bone className="h-3 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Bone className="h-11 w-32 rounded-full" />
          <Bone className="h-11 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-x-3 gap-y-4 px-4 sm:grid-cols-4 md:grid-cols-5" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Bone className="aspect-[2/3] w-full" />
          <Bone className="mt-2 h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div aria-hidden>
      <div className="relative aspect-video w-full">
        <Bone className="absolute inset-0 rounded-none" />
      </div>
      <div className="-mt-16 flex gap-4 px-4">
        <Bone className="aspect-[2/3] w-28 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2 pt-16">
          <Bone className="h-6 w-4/5" />
          <Bone className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-5 flex gap-2 px-4">
        <Bone className="h-11 flex-1 rounded-full" />
        <Bone className="h-11 w-11 rounded-full" />
        <Bone className="h-11 w-11 rounded-full" />
      </div>
      <div className="mt-5 space-y-2 px-4">
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-2/3" />
      </div>
      <RowSkeleton />
    </div>
  );
}

export function EpisodeListSkeleton() {
  return (
    <div className="space-y-4 px-4" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex gap-3">
          <Bone className="aspect-video w-36 shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <Bone className="h-4 w-3/4" />
            <Bone className="h-3 w-1/3" />
            <Bone className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
