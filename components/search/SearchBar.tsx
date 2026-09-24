"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { MAX_QUERY_LENGTH } from "@/lib/validation";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";

const DEBOUNCE_MS = 400;

/** Debounced, URL-driven search: results are server-rendered from the query string. */
export function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [pending, startTransition] = useTransition();
  const lastPushed = useRef(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = value.trim();
    if (q === lastPushed.current) return;
    const timer = window.setTimeout(() => {
      lastPushed.current = q;
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("q", q);
      else params.delete("q");
      params.delete("page");
      startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [value, pathname, router, searchParams]);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        inputRef.current?.blur();
      }}
      className="relative"
    >
      <SearchIcon size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        maxLength={MAX_QUERY_LENGTH}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Movies, shows, anime…"
        aria-label="Search"
        className="h-12 w-full rounded-xl bg-surface pr-11 pl-10 text-[15px] text-fg ring-1 ring-white/5 outline-none placeholder:text-muted focus:ring-2 focus:ring-accent/70 [&::-webkit-search-cancel-button]:hidden"
      />
      {pending ? (
        <span className="absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-muted/40 border-t-fg" />
      ) : value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
          className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted"
        >
          <CloseIcon size={16} />
        </button>
      ) : null}
    </form>
  );
}
