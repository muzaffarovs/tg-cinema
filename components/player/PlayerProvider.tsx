"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { PlayRequest } from "@/types/player";
import { PlayerOverlay } from "./PlayerOverlay";

interface PlayerContextValue {
  play: (request: PlayRequest) => void;
  isOpen: boolean;
}

const PlayerContext = createContext<PlayerContextValue>({ play: () => undefined, isOpen: false });

export const usePlayer = () => useContext(PlayerContext);

export function requestKey(r: PlayRequest): string {
  return r.mediaType === "movie" ? `movie-${r.id}` : `tv-${r.id}-${r.season}-${r.episode}`;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<PlayRequest | null>(null);
  const close = useCallback(() => setRequest(null), []);
  const value = useMemo(() => ({ play: setRequest, isOpen: request !== null }), [request]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {request ? (
        <PlayerOverlay key={requestKey(request)} request={request} onClose={close} onPlay={setRequest} />
      ) : null}
    </PlayerContext.Provider>
  );
}
