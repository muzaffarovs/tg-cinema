"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getWebApp } from "@/lib/telegram/webapp";
import type { TelegramThemeParams, TelegramWebApp } from "@/types/telegram";

interface TelegramContextValue {
  isTelegram: boolean;
  /** Registers an override for the Back button (modals, player). Returns an unregister fn. */
  pushBackHandler: (handler: () => void) => () => void;
}

const TelegramContext = createContext<TelegramContextValue>({
  isTelegram: false,
  pushBackHandler: () => () => undefined,
});

export const useTelegram = () => useContext(TelegramContext);

const HEX = /^#[0-9a-fA-F]{6}$/;
const FALLBACK_BG = "#0b0b0f";

function applyTheme(wa: TelegramWebApp): void {
  const t: TelegramThemeParams = wa.themeParams;
  const root = document.documentElement.style;
  const set = (name: string, value: string | undefined) => {
    if (value && HEX.test(value)) root.setProperty(name, value);
  };

  // The UI is a dark streaming theme; adopt Telegram's palette when the user's
  // Telegram theme is dark, and always adopt the accent (button) colors.
  if (wa.colorScheme === "dark") {
    set("--bg", t.bg_color);
    set("--surface", t.secondary_bg_color);
    set("--fg", t.text_color);
    set("--muted", t.hint_color);
  }
  set("--accent", t.button_color);
  set("--accent-fg", t.button_text_color);
  set("--link", t.link_color);

  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || FALLBACK_BG;
  try {
    if (HEX.test(bg)) {
      wa.setHeaderColor(bg);
      wa.setBackgroundColor(bg);
      if (wa.isVersionAtLeast("7.10")) wa.setBottomBarColor?.(bg);
    }
  } catch {
    // Older clients reject some color calls.
  }
}

function applySafeArea(wa: TelegramWebApp): void {
  const root = document.documentElement.style;
  const top = (wa.safeAreaInset?.top ?? 0) + (wa.contentSafeAreaInset?.top ?? 0);
  const bottom = (wa.safeAreaInset?.bottom ?? 0) + (wa.contentSafeAreaInset?.bottom ?? 0);
  root.setProperty("--tg-safe-top", `${top}px`);
  root.setProperty("--tg-safe-bottom", `${bottom}px`);
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const handlers = useRef<(() => void)[]>([]);
  const [handlerCount, setHandlerCount] = useState(0);

  // One-time SDK setup.
  useEffect(() => {
    const wa = getWebApp();
    if (!wa) return;
    wa.ready();
    wa.expand();
    if (wa.isVersionAtLeast("7.7")) wa.disableVerticalSwipes?.();
    document.documentElement.dataset.telegram = "true";
    applyTheme(wa);
    applySafeArea(wa);

    const onTheme = () => applyTheme(wa);
    const onSafeArea = () => applySafeArea(wa);
    wa.onEvent("themeChanged", onTheme);
    wa.onEvent("safeAreaChanged", onSafeArea);
    wa.onEvent("contentSafeAreaChanged", onSafeArea);
    // Deferred so the SDK is ready before consumers read `isTelegram`.
    queueMicrotask(() => setWebApp(wa));
    return () => {
      wa.offEvent("themeChanged", onTheme);
      wa.offEvent("safeAreaChanged", onSafeArea);
      wa.offEvent("contentSafeAreaChanged", onSafeArea);
    };
  }, []);

  const pushBackHandler = useCallback((handler: () => void) => {
    handlers.current = [...handlers.current, handler];
    setHandlerCount(handlers.current.length);
    return () => {
      handlers.current = handlers.current.filter((h) => h !== handler);
      setHandlerCount(handlers.current.length);
    };
  }, []);

  // Native Back button: visible on sub-pages or while an overlay is open.
  useEffect(() => {
    if (!webApp) return;
    const back = webApp.BackButton;
    const visible = pathname !== "/" || handlerCount > 0;
    const onClick = () => {
      const top = handlers.current.at(-1);
      if (top) top();
      else if (window.history.length > 1) router.back();
      else router.push("/");
    };
    if (visible) back.show();
    else back.hide();
    back.onClick(onClick);
    return () => {
      back.offClick(onClick);
    };
  }, [webApp, pathname, handlerCount, router]);

  const value = useMemo(
    () => ({ isTelegram: webApp !== null, pushBackHandler }),
    [webApp, pushBackHandler],
  );

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}

/** Routes the Telegram Back button (and Escape key) to `onBack` while `active`. */
export function useBackHandler(active: boolean, onBack: () => void): void {
  const { pushBackHandler } = useTelegram();
  const latest = useRef(onBack);
  useEffect(() => {
    latest.current = onBack;
  });
  useEffect(() => {
    if (!active) return;
    const unregister = pushBackHandler(() => latest.current());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") latest.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unregister();
      window.removeEventListener("keydown", onKey);
    };
  }, [active, pushBackHandler]);
}
