"use client";

import type { TelegramWebApp } from "@/types/telegram";

/** The Telegram WebApp object, or null when not running inside Telegram. */
export function getWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  const wa = window.Telegram?.WebApp;
  return wa && wa.initData ? wa : null;
}

export function supports(version: string): boolean {
  const wa = getWebApp();
  return wa ? wa.isVersionAtLeast(version) : false;
}

export function haptic(kind: "light" | "medium" | "selection" | "success" | "error" = "light"): void {
  const wa = getWebApp();
  if (!wa || !wa.isVersionAtLeast("6.1")) return;
  try {
    if (kind === "selection") wa.HapticFeedback.selectionChanged();
    else if (kind === "success" || kind === "error") wa.HapticFeedback.notificationOccurred(kind);
    else wa.HapticFeedback.impactOccurred(kind);
  } catch {
    // Haptics are best effort.
  }
}

export function openExternal(url: string): void {
  const wa = getWebApp();
  if (wa) wa.openLink(url);
  else window.open(url, "_blank", "noopener,noreferrer");
}
