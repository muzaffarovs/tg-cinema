import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { BottomNav } from "@/components/ui/BottomNav";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import { TelegramProvider } from "@/components/telegram/TelegramProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Cinema", template: "%s · Cinema" },
  description: "Private media library",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  referrer: "same-origin",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0b0b0f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // telegram-web-app.js writes CSS variables onto <html> before hydration.
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <TelegramProvider>
          <PlayerProvider>
            <div className="pb-nav mx-auto min-h-dvh max-w-3xl">{children}</div>
            <BottomNav />
          </PlayerProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}
