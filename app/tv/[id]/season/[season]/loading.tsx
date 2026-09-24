import { Bone, EpisodeListSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div aria-hidden>
      <Bone className="aspect-[21/9] max-h-[36vh] w-full rounded-none" />
      <div className="-mt-6 mb-6 space-y-2 px-4">
        <Bone className="h-3 w-24" />
        <Bone className="h-7 w-40" />
      </div>
      <EpisodeListSkeleton />
    </div>
  );
}
