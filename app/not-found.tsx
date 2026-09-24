import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl font-black text-accent">404</p>
      <p className="mt-3 text-sm text-muted">This page doesn&apos;t exist.</p>
      <Link href="/" className="mt-6 rounded-full bg-surface-2 px-5 py-2.5 text-sm font-semibold">
        Go home
      </Link>
    </main>
  );
}
