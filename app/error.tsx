"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
      <p className="text-lg font-bold">Something went wrong</p>
      <p className="mt-2 text-sm text-muted">TMDB may be unreachable. Please try again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg"
      >
        Retry
      </button>
    </main>
  );
}
