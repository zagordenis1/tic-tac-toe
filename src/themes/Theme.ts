import type { ThemeMode } from "../persistence/Settings";

/**
 * Узагальнений ID теми. Не плутати з `ThemeMode` («system»/«light»/
 * «dark») — той живе у налаштуваннях і відповідає на запитання «яку
 * тему просить користувач», а `ThemeId` — це фактична тема, яку ми
 * наклали (наприклад, `system` врешті-решт буде або `light`, або `dark`).
 */
export type ThemeId = "light" | "dark";

/**
 * Зовнішній контракт теми: набір CSS-змінних. Ім’я → значення. Імена
 * мають починатися з `--`, аби «лити» їх напряму у `style.setProperty`.
 *
 * Свідомо обмежуємось рядковими CSS-кольорами, без обʼєктних описів.
 * Це сумісно з Tailwind-конфігом, що читає змінні через `var(--ttt-...)`.
 */
export type ThemeTokens = Readonly<Record<string, string>>;

/**
 * Метаінформація про тему та її значення CSS-змінних. Це чиста
 * структура даних — без логіки. Логіка накладання живе у `ThemeApplier`.
 */
export interface Theme {
  readonly id: ThemeId;
  readonly nameKey: "settings.theme.light" | "settings.theme.dark";
  readonly mode: Exclude<ThemeMode, "system">;
  readonly tokens: ThemeTokens;
}
