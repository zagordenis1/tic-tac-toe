/**
 * Barrel-export модуля локалізації. Імпортуйте `Translator`, `Locale`,
 * та допоміжні функції з `./i18n`, не звертаючись напряму до підпапок —
 * це утримує межу модуля акуратною.
 */
export type { Dictionary, DictionaryEntry, TranslationKey } from "./Dictionary";
export type { PluralForm } from "./pluralRules";
export type { Locale } from "./Locale";
export type { TranslateOptions } from "./Translator";

export {
  DEFAULT_LOCALE,
  LOCALE_NATIVE_NAMES,
  SUPPORTED_LOCALES,
  detectLocale,
  isLocale,
} from "./Locale";
export { pickPlural, selectPluralForm } from "./pluralRules";
export { Translator } from "./Translator";
export { ukDictionary } from "./dictionaries/uk";
export { enDictionary } from "./dictionaries/en";
