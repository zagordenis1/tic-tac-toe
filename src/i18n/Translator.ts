import type { Dictionary, TranslationKey } from "./Dictionary";
import { enDictionary } from "./dictionaries/en";
import { ukDictionary } from "./dictionaries/uk";
import type { Locale } from "./Locale";
import { DEFAULT_LOCALE, isLocale } from "./Locale";
import { pickPlural } from "./pluralRules";

/**
 * Опції форматування одного перекладу. Підтримуємо два кейси:
 *   1. Звичайна підстановка змінних `{name}` → `params.name`.
 *   2. Множина: якщо передано `count`, перекладач шукає в словнику
 *      обʼєкт із формами `one/few/many/other` і вибирає правильну,
 *      потім підставляє решту параметрів.
 */
export interface TranslateOptions {
  readonly count?: number;
  readonly params?: Readonly<Record<string, string | number>>;
}

/**
 * Реєстр словників. Тримаємо його локально, аби не плодити окремі
 * сінглтони — `Translator` сам адресує словник за локаллю.
 */
const DICTIONARIES: Readonly<Record<Locale, Dictionary>> = {
  uk: ukDictionary,
  en: enDictionary,
};

/**
 * Чистий, тестопридатний перекладач. Зберігає поточну локаль і
 * розкриває API:
 *
 *   - `t(key, options?)` — переклад з підстановкою змінних та множиною.
 *   - `setLocale(locale)` — змінює локаль; викликати з UI/Settings.
 *   - `subscribe(listener)` — підписка на зміну локалі (Observer);
 *     повертає функцію відписки. Це робить React-компонент
 *     заміною лише словника, без додаткового глобального стану.
 *
 * Сам Translator не торкає `localStorage` — це справа `SettingsRepository`.
 */
export class Translator {
  private currentLocale: Locale;
  private readonly listeners = new Set<(locale: Locale) => void>();

  public constructor(initialLocale: Locale = DEFAULT_LOCALE) {
    this.currentLocale = initialLocale;
  }

  public getLocale(): Locale {
    return this.currentLocale;
  }

  public setLocale(locale: Locale): void {
    if (!isLocale(locale)) return;
    if (locale === this.currentLocale) return;
    this.currentLocale = locale;
    for (const listener of this.listeners) {
      listener(locale);
    }
  }

  public subscribe(listener: (locale: Locale) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Власне переклад. Алгоритм:
   *
   *   1. Беремо словник для поточної локалі. Якщо ключ відсутній (мав
   *      би ловитись TS, але буває в рантаймі при «битих» імпортах),
   *      повертаємо сам ключ — це робить пропуск перекладу видимим.
   *   2. Якщо значення — обʼєкт із формами множини, обираємо форму
   *      залежно від `options.count`.
   *   3. Підставляємо змінні. Невикористані плейсхолдери лишаємо
   *      як є — щоб баги локалізації було видно.
   */
  public t(key: TranslationKey, options?: TranslateOptions): string {
    const dictionary = DICTIONARIES[this.currentLocale];
    const entry = dictionary[key];
    if (entry === undefined) return key;

    const params = options?.params ?? {};
    const merged: Record<string, string | number> = { ...params };
    if (options?.count !== undefined && merged.count === undefined) {
      merged.count = options.count;
    }

    let template: string;
    if (typeof entry === "string") {
      template = entry;
    } else if (options?.count !== undefined) {
      template = pickPlural(this.currentLocale, options.count, entry);
    } else {
      // Якщо запис множинний, але `count` не передали — беремо
      // дефолтний варіант. Так уникнемо `undefined` у UI.
      template = entry.other ?? entry.many ?? entry.one ?? key;
    }

    return Translator.applyParams(template, merged);
  }

  /**
   * Підстановка `{name}` → значень. Винесено окремо, щоб логіку
   * пошуку плейсхолдерів можна було тестувати без створення
   * Translator.
   */
  public static applyParams(
    template: string,
    params: Readonly<Record<string, string | number>>,
  ): string {
    return template.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (_match, name: string) => {
      const value = params[name];
      if (value === undefined) return `{${name}}`;
      return String(value);
    });
  }

  /**
   * Зручний хелпер для тестів і дебагу: повертає дамп словника
   * поточної локалі. Свідомо без `JSON.stringify`, щоб не приховати
   * структуру множинних записів.
   */
  public dictionary(): Dictionary {
    return DICTIONARIES[this.currentLocale];
  }
}
