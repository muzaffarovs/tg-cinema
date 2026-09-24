import type { Metadata } from "next";
import { LibraryView } from "@/components/library/LibraryView";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = { title: "My List" };

export default async function LibraryPage() {
  await requireSession();
  return (
    <main className="pt-safe">
      <h1 className="px-4 pt-4 text-2xl font-extrabold tracking-tight">My List</h1>
      <LibraryView />
    </main>
  );
}
