"use client";

import { useEffect, useRef } from "react";
import { getWebApp } from "@/lib/telegram/webapp";
import { useTelegram } from "./TelegramProvider";

interface MainButtonOptions {
  text: string;
  visible: boolean;
  onClick: () => void;
}

/** Drives Telegram's native MainButton; no-op outside Telegram. */
export function useMainButton({ text, visible, onClick }: MainButtonOptions): void {
  const { isTelegram } = useTelegram();
  const latest = useRef(onClick);
  useEffect(() => {
    latest.current = onClick;
  });

  useEffect(() => {
    const wa = getWebApp();
    if (!isTelegram || !wa) return;
    const button = wa.MainButton;
    const handler = () => latest.current();
    if (!visible) {
      button.hide();
      return;
    }
    button.setParams({ text, is_active: true, is_visible: true });
    button.onClick(handler);
    return () => {
      button.offClick(handler);
      button.hide();
    };
  }, [isTelegram, text, visible]);
}
