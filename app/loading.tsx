import { HeroSkeleton, RowSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div>
      <HeroSkeleton />
      <RowSkeleton />
      <RowSkeleton />
    </div>
  );
}
