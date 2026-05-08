import { createContext, type ReactNode, useEffect, useMemo, useState } from "react";
import type { Translator, TranslateOptions } from "../../i18n/Translator";
import type { TranslationKey } from "../../i18n/Dictionary";
import type { Locale } from "../../i18n/Locale";

/**
 * Значення контексту i18n: сам перекладач (для випадків, коли
 * потрібен прямий доступ — приклад зі словником у тестах) і
 * стабільна функція `t(key, opts)`, що ре-рендерить компоненти при
 * зміні локалі.
 */
export interface I18nContextValue {
  readonly translator: Translator;
  readonly locale: Locale;
  readonly t: (key: TranslationKey, options?: TranslateOptions) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  readonly translator: Translator;
  readonly children: ReactNode;
}

/**
 * Провайдер i18n. Підписується на події `Translator.subscribe`, щоб
 * при зміні локалі весь UI знав, що треба перерисувати дочірні
 * компоненти. Сама функція `t` стабільна за посиланням всередині
 * одного циклу локалі — це дозволяє користуватись нею в `useMemo`
 * без зайвих перерендерів.
 */
export function I18nProvider({ translator, children }: I18nProviderProps): JSX.Element {
  const [locale, setLocale] = useState<Locale>(translator.getLocale());

  useEffect(() => {
    return translator.subscribe((next) => {
      setLocale(next);
      // Сторінка повинна знати про напрямок/мову — корисно для
      // SEO та доступности (`html lang`).
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("lang", next);
      }
    });
  }, [translator]);

  const value = useMemo<I18nContextValue>(() => {
    return {
      translator,
      locale,
      t: (key, options) => translator.t(key, options),
    };
  }, [translator, locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
