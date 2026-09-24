import "server-only";
import { getPlaybackEnv } from "@/lib/env";
import { HttpResolverPlaybackProvider } from "./providers/http-resolver-provider";
import { NullPlaybackProvider } from "./providers/null-provider";
import { TemplatePlaybackProvider } from "./providers/template-provider";
import type { PlaybackProvider } from "./types";

export type { PlaybackProvider, PlaybackSource, PlaybackSourceType } from "./types";

const PLACEHOLDER = /\{(type|tmdbId|season|episode)\}/;

let instance: PlaybackProvider | null = null;

/** Selects the provider implementation from environment configuration. */
export function getPlaybackProvider(): PlaybackProvider {
  if (instance) return instance;
  const env = getPlaybackEnv();

  if (!env.url) {
    instance = new NullPlaybackProvider();
  } else if (PLACEHOLDER.test(env.url) || (env.tvUrl && PLACEHOLDER.test(env.tvUrl))) {
    instance = new TemplatePlaybackProvider({
      movieTemplate: env.url,
      tvTemplate: env.tvUrl ?? env.url,
      forcedType: env.forcedType,
    });
  } else {
    instance = new HttpResolverPlaybackProvider({ baseUrl: env.url, token: env.token });
  }
  return instance;
}

export function isPlaybackConfigured(): boolean {
  return Boolean(getPlaybackEnv().url);
}
