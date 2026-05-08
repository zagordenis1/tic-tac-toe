/**
 * Просте глибоке клонування для структур, які нам потрібні: об'єкти, масиви
 * та примітиви. Окрема утиліта замість `structuredClone`, бо ми хочемо
 * обмежити поверхню і чітко знати, що працює, а що ні (наприклад, ми не
 * клонуємо `Map`/`Set` — вони і не потрібні в нашій моделі даних).
 */
export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as unknown as T;
  }
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(value as Record<string, unknown>)) {
    result[key] = deepClone((value as Record<string, unknown>)[key]);
  }
  return result as T;
}
