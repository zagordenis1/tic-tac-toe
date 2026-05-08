/**
 * Перерахування символів, які використовуються гравцями на ігровому полі.
 *
 * Окремий тип-обгортка обрано замість `string` навмисно: це дозволяє системі
 * типів ловити помилки на кшталт спроби порівняти символ з довільним рядком
 * та робить код у решті модулів виразнішим.
 */
export const PlayerSymbol = {
  X: "X",
  O: "O",
} as const;

export type PlayerSymbol = (typeof PlayerSymbol)[keyof typeof PlayerSymbol];

/**
 * Спеціальне значення для порожньої клітинки. Використовуємо `null`, тому що
 * семантично «немає символу» — це саме відсутність значення, а не якийсь
 * окремий тип. Об'єднання з `PlayerSymbol` робить тип клітинки
 * самодокументованим: `CellValue` одразу дає зрозуміти, які варіанти можливі.
 */
export type CellValue = PlayerSymbol | null;

/**
 * Повертає протилежний символ. Використовується в логіці зміни ходу та в
 * алгоритмах AI (наприклад minimax, де ми чергуємо максимізатора та
 * мінімізатора).
 */
export function oppositeSymbol(symbol: PlayerSymbol): PlayerSymbol {
  return symbol === PlayerSymbol.X ? PlayerSymbol.O : PlayerSymbol.X;
}

/**
 * Перевірка, чи переданий рядок є валідним символом гравця. Корисна, коли ми
 * відновлюємо стан гри з зовнішнього джерела (localStorage, JSON-файл) і
 * хочемо переконатися, що дані не пошкоджені.
 */
export function isPlayerSymbol(value: unknown): value is PlayerSymbol {
  return value === PlayerSymbol.X || value === PlayerSymbol.O;
}
