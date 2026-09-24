/**
 * Minimal, strictly typed surface of the Telegram Web Apps SDK
 * (https://core.telegram.org/bots/webapps) used by this app.
 */

export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  bottom_bar_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramSafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface TelegramBackButton {
  isVisible: boolean;
  show(): TelegramBackButton;
  hide(): TelegramBackButton;
  onClick(cb: () => void): TelegramBackButton;
  offClick(cb: () => void): TelegramBackButton;
}

export interface TelegramMainButtonParams {
  text?: string;
  color?: string;
  text_color?: string;
  has_shine_effect?: boolean;
  is_active?: boolean;
  is_visible?: boolean;
}

export interface TelegramMainButton {
  text: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText(text: string): TelegramMainButton;
  setParams(params: TelegramMainButtonParams): TelegramMainButton;
  onClick(cb: () => void): TelegramMainButton;
  offClick(cb: () => void): TelegramMainButton;
  show(): TelegramMainButton;
  hide(): TelegramMainButton;
  enable(): TelegramMainButton;
  disable(): TelegramMainButton;
  showProgress(leaveActive?: boolean): TelegramMainButton;
  hideProgress(): TelegramMainButton;
}

export type CloudStorageCallback<T> = (error: string | null, result?: T) => void;

export interface TelegramCloudStorage {
  setItem(key: string, value: string, cb?: CloudStorageCallback<boolean>): void;
  getItem(key: string, cb: CloudStorageCallback<string>): void;
  getItems(keys: string[], cb: CloudStorageCallback<Record<string, string>>): void;
  removeItem(key: string, cb?: CloudStorageCallback<boolean>): void;
  removeItems(keys: string[], cb?: CloudStorageCallback<boolean>): void;
  getKeys(cb: CloudStorageCallback<string[]>): void;
}

export interface TelegramHapticFeedback {
  impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): void;
  notificationOccurred(type: "error" | "success" | "warning"): void;
  selectionChanged(): void;
}

export type TelegramEventType =
  | "themeChanged"
  | "viewportChanged"
  | "safeAreaChanged"
  | "contentSafeAreaChanged"
  | "backButtonClicked"
  | "mainButtonClicked"
  | "fullscreenChanged";

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: TelegramWebAppUser; auth_date?: number; hash?: string };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  safeAreaInset?: TelegramSafeAreaInset;
  contentSafeAreaInset?: TelegramSafeAreaInset;
  BackButton: TelegramBackButton;
  MainButton: TelegramMainButton;
  CloudStorage: TelegramCloudStorage;
  HapticFeedback: TelegramHapticFeedback;
  isVersionAtLeast(version: string): boolean;
  ready(): void;
  expand(): void;
  close(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  setBottomBarColor?(color: string): void;
  disableVerticalSwipes?(): void;
  enableClosingConfirmation?(): void;
  disableClosingConfirmation?(): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  onEvent(event: TelegramEventType, cb: () => void): void;
  offEvent(event: TelegramEventType, cb: () => void): void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}
