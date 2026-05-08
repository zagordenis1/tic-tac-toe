/**
 * Генератор ідентифікаторів. Покладатися на `crypto.randomUUID` ми не можемо,
 * бо у деяких старих браузерах його немає; тому реалізовуємо просту
 * детерміновану схему `<prefix>-<timestamp>-<counter>`.
 */
let counter = 0;

export function generateId(prefix = "id"): string {
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;
  const time = Date.now().toString(36);
  const sequence = counter.toString(36).padStart(4, "0");
  return `${prefix}-${time}-${sequence}`;
}

/**
 * Хелпер для тестів: дозволяє «перезапустити» лічильник.
 */
export function resetIdCounter(): void {
  counter = 0;
}
