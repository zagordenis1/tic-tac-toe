import type { Difficulty } from "../types/Difficulty";
import type { PlayerSymbol } from "../types/Symbol";

/**
 * Користувацькі налаштування, що лежать у `localStorage`. Тримаємо їх
 * у стабільному, плоскому вигляді, щоб міграції в майбутньому не
 * перетворили список властивостей на «перехресно повʼязану плутанину».
 */
export interface UserSettings {
  readonly boardSize: number;
  readonly winLength: number;
  readonly humanSymbol: PlayerSymbol;
  readonly aiDifficulty: Difficulty;
  readonly theme: ThemeMode;
  readonly locale: SupportedLocale;
  readonly enableSounds: boolean;
  readonly enableAnimations: boolean;
  readonly enableHints: boolean;
  readonly aiThinkingDelayMs: number;
  readonly highlightLastMove: boolean;
  readonly autosave: boolean;
}

export type ThemeMode = "system" | "light" | "dark";

export type SupportedLocale = "uk" | "en";

/**
 * Базові налаштування. Виносимо у константу, щоб не плодити «магічні»
 * значення в коді UI і щоб тести могли посилатись на одну й ту ж саму
 * базу.
 */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  boardSize: 3,
  winLength: 3,
  humanSymbol: "X",
  aiDifficulty: "hard",
  theme: "system",
  locale: "uk",
  enableSounds: false,
  enableAnimations: true,
  enableHints: true,
  aiThinkingDelayMs: 350,
  highlightLastMove: true,
  autosave: true,
};

/**
 * Чистий помічник: повертає нові налаштування з певним полем
 * заміненим. Імутабельно. Уникає десятків методів-сетерів.
 */
export function withSettingChange<K extends keyof UserSettings>(
  settings: UserSettings,
  key: K,
  value: UserSettings[K],
): UserSettings {
  return { ...settings, [key]: value };
}
