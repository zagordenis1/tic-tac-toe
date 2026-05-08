import type { SupportedLocale } from "../persistence/Settings";

/**
 * Реекспорт типу локалі. Пропоную користувачам цього модуля імпортувати
 * локаль саме з `i18n`, а не з `persistence/Settings` — так межа між
 * шарами стає відчутнішою: `persistence` тільки зберігає, `i18n`
 * відповідає за саму семантику локалі.
 */
export type Locale = SupportedLocale;

/**
 * Перелік підтримуваних локалей у порядку, придатному для UI-перемикача.
 * Винесено окремо, щоб уникати «магічного» масиву по коду.
 */
export const SUPPORTED_LOCALES: ReadonlyArray<Locale> = ["uk", "en"];

/**
 * Локаль за замовчуванням. Збігається з `DEFAULT_USER_SETTINGS.locale`,
 * але оголошуємо її ще раз тут — той модуль про неї не знає, а нам
 * незручно тягнути зворотну залежність.
 */
export const DEFAULT_LOCALE: Locale = "uk";

/**
 * Узгоджена назва локалі для відображення в UI. Локалізуємо саме її —
 * не додаємо синонімів у словнику, бо ці значення просто розкривають
 * сам код локалі читачеві.
 */
export const LOCALE_NATIVE_NAMES: Readonly<Record<Locale, string>> = {
  uk: "Українська",
  en: "English",
};

/**
 * Перевіряє, чи рядок — допустима локаль. Корисно при відновленні з
 * `localStorage`, де значення приходить як `unknown`.
 */
export function isLocale(value: unknown): value is Locale {
  return value === "uk" || value === "en";
}

/**
 * Повертає локаль, найближчу до браузерної. Без сюрпризів: якщо
 * `navigator.language` починається з «uk» — повертаємо «uk», інакше
 * «en». У середовищі без `navigator` (наприклад, у тестах) повертаємо
 * `DEFAULT_LOCALE`.
 */
export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const tag = navigator.language?.toLowerCase() ?? "";
  if (tag.startsWith("uk") || tag.startsWith("ru")) return "uk";
  return "en";
}
