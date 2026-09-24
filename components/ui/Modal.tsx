"use client";

import { useEffect, type ReactNode } from "react";
import { useBackHandler } from "@/components/telegram/TelegramProvider";
import { CloseIcon } from "./icons";

interface Props {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}

/** Full-screen dark overlay wired to Telegram's Back button and Escape. */
export function Modal({ open, onClose, label, children }: Props) {
  useBackHandler(open, onClose);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-black/95 backdrop-blur"
      onClick={onClose}
    >
      <div className="pt-safe flex justify-end px-3 pb-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center p-3" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
