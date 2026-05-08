import type { Locale } from "./Locale";

/**
 * Форма множини, на яку перемикається перекладач залежно від
 * аргумента `count`. Імена форм збігаються з категоріями CLDR, аби
 * словник читався однаково для перекладача-людини й для коду.
 */
export type PluralForm = "one" | "few" | "many" | "other";

/**
 * Повертає форму множини для конкретної локалі. Тримаємо це у простому
 * `if-else`, без зовнішніх бібліотек: правил мало, інтерпретатор кешу
 * (`Intl.PluralRules`) важчий за саму гру.
 *
 * Українська повторює CLDR: 1 — «one», 2-4 крім 12-14 — «few»,
 * решта — «many». Англійська спрощена: 1 — «one», все інше — «other».
 */
export function selectPluralForm(locale: Locale, count: number): PluralForm {
  const abs = Math.abs(Math.trunc(count));
  if (locale === "en") {
    return abs === 1 ? "one" : "other";
  }
  // locale === "uk"
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return "one";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
  return "many";
}

/**
 * Спрощений маппінг для словників, де переклад уже містить три
 * варіанти. Якщо форма відсутня (наприклад, англомовний словник без
 * «few»/«many») — падаємо до «other», інакше до «one».
 */
export function pickPlural(
  locale: Locale,
  count: number,
  forms: Partial<Record<PluralForm, string>>,
): string {
  const form = selectPluralForm(locale, count);
  if (forms[form] !== undefined) return forms[form] as string;
  if (forms.other !== undefined) return forms.other;
  if (forms.one !== undefined) return forms.one;
  // Цей випадок означає, що словник зовсім порожній — повертаємо
  // самий лічильник, аби читач принаймні бачив значення.
  return String(count);
}
