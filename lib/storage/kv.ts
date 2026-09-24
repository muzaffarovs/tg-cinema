"use client";

import { getWebApp } from "@/lib/telegram/webapp";
import type { TelegramCloudStorage } from "@/types/telegram";

/**
 * Async key/value store. Telegram CloudStorage syncs across the user's
 * devices; localStorage is the fallback outside Telegram or on old clients.
 * Keys: 1–128 chars of [A-Za-z0-9_-]; values ≤ 4096 chars (CloudStorage limits).
 */
export interface KeyValueStore {
  readonly kind: "cloud" | "local";
  getKeys(): Promise<string[]>;
  getItems(keys: string[]): Promise<Record<string, string>>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const KEY_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
export const MAX_VALUE_LENGTH = 4096;

class CloudStore implements KeyValueStore {
  readonly kind = "cloud";
  constructor(private readonly cs: TelegramCloudStorage) {}

  getKeys(): Promise<string[]> {
    return new Promise((resolve, reject) =>
      this.cs.getKeys((err, keys) => (err ? reject(new Error(err)) : resolve(keys ?? []))),
    );
  }

  async getItems(keys: string[]): Promise<Record<string, string>> {
    const out: Record<string, string> = {};
    // Keep individual requests small.
    for (let i = 0; i < keys.length; i += 50) {
      const chunk = keys.slice(i, i + 50);
      const values = await new Promise<Record<string, string>>((resolve, reject) =>
        this.cs.getItems(chunk, (err, result) => (err ? reject(new Error(err)) : resolve(result ?? {}))),
      );
      Object.assign(out, values);
    }
    return out;
  }

  setItem(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) =>
      this.cs.setItem(key, value, (err) => (err ? reject(new Error(err)) : resolve())),
    );
  }

  removeItem(key: string): Promise<void> {
    return new Promise((resolve, reject) =>
      this.cs.removeItem(key, (err) => (err ? reject(new Error(err)) : resolve())),
    );
  }
}

const LOCAL_PREFIX = "tgc:";

class LocalStore implements KeyValueStore {
  readonly kind = "local";

  async getKeys(): Promise<string[]> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(LOCAL_PREFIX)) keys.push(k.slice(LOCAL_PREFIX.length));
      }
      return keys;
    } catch {
      return [];
    }
  }

  async getItems(keys: string[]): Promise<Record<string, string>> {
    const out: Record<string, string> = {};
    try {
      for (const k of keys) {
        const v = localStorage.getItem(LOCAL_PREFIX + k);
        if (v !== null) out[k] = v;
      }
    } catch {
      // Storage unavailable (private mode, quota): behave as empty.
    }
    return out;
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(LOCAL_PREFIX + key, value);
    } catch {
      // Ignore quota / privacy-mode failures.
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(LOCAL_PREFIX + key);
    } catch {
      // Ignore.
    }
  }
}

let store: KeyValueStore | null = null;

export function getKeyValueStore(): KeyValueStore {
  if (store) return store;
  const wa = getWebApp();
  store = wa && wa.isVersionAtLeast("6.9") ? new CloudStore(wa.CloudStorage) : new LocalStore();
  return store;
}
