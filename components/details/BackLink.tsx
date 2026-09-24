"use client";

import { useRouter } from "next/navigation";
import { useTelegram } from "@/components/telegram/TelegramProvider";
import { BackIcon } from "@/components/ui/icons";

/** In-page back arrow for browsers; Telegram uses its native BackButton instead. */
export function BackLink() {
  const { isTelegram } = useTelegram();
  const router = useRouter();
  if (isTelegram) return null;
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
      className="pt-safe absolute top-3 left-3 z-10 mt-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur"
    >
      <BackIcon />
    </button>
  );
}
