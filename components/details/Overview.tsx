"use client";

import { useState } from "react";

export function Overview({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const long = text.length > 220;
  return (
    <div className="mt-5 px-4">
      <p className={`text-sm leading-relaxed text-fg/85 ${!expanded && long ? "line-clamp-4" : ""}`}>{text}</p>
      {long ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-semibold text-muted"
        >
          {expanded ? "Show less" : "More"}
        </button>
      ) : null}
    </div>
  );
}
