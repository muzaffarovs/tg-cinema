import { Bone, GridSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div className="pt-safe" aria-hidden>
      <div className="space-y-3 px-4 pt-4 pb-3">
        <Bone className="h-8 w-28" />
        <Bone className="h-12 w-full rounded-xl" />
        <Bone className="h-9 w-full rounded-xl" />
      </div>
      <GridSkeleton />
    </div>
  );
}
