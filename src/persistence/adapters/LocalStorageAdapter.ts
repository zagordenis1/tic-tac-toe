import type { StorageAdapter } from "../StorageAdapter";

/**
 * Тонка обгортка над `window.localStorage`, що приводить його до
 * нашого внутрішнього інтерфейсу. Уся робота з префіксами та
 * `keys()` робиться вручну, бо `localStorage` не дає такого з
 * коробки.
 *
 * Якщо `localStorage` недоступний (приватне вікно, SSR), сховище
 * мовчки переходить у режим «no-op», щоб додаток продовжував
 * працювати — записи просто не зберігаються між сесіями.
 */
export class LocalStorageAdapter implements StorageAdapter {
  private readonly storage: Storage | null;

  public constructor(storage?: Storage | null) {
    this.storage = storage ?? LocalStorageAdapter.resolveStorage();
  }

  /**
   * Чи реально вдалось підʼєднатись до браузерного localStorage.
   * UI використовує цей метод, щоб показати попередження «дані
   * зберігаються лише на час сесії».
   */
  public isPersistent(): boolean {
    return this.storage !== null;
  }

  public read(key: string): string | null {
    if (this.storage === null) return null;
    try {
      return this.storage.getItem(key);
    } catch {
      return null;
    }
  }

  public write(key: string, value: string): void {
    if (this.storage === null) return;
    try {
      this.storage.setItem(key, value);
    } catch {
      // Кидати помилку «QuotaExceededError» далі немає сенсу — вищий
      // шар нічого не зможе з нею зробити. Записи в історію
      // приречені бути best-effort.
    }
  }

  public remove(key: string): void {
    if (this.storage === null) return;
    try {
      this.storage.removeItem(key);
    } catch {
      /* нічого не вдієш */
    }
  }

  public keys(prefix: string): string[] {
    if (this.storage === null) return [];
    const result: string[] = [];
    for (let index = 0; index < this.storage.length; index += 1) {
      const key = this.storage.key(index);
      if (key !== null && key.startsWith(prefix)) {
        result.push(key);
      }
    }
    return result;
  }

  public clearPrefix(prefix: string): void {
    if (this.storage === null) return;
    for (const key of this.keys(prefix)) {
      try {
        this.storage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
  }

  /**
   * Швидка статична перевірка: чи доступний localStorage у поточному
   * середовищі. Використовується фабрикою сховища, щоб обрати між
   * `LocalStorageAdapter` і `InMemoryAdapter`.
   */
  public static isAvailable(): boolean {
    return LocalStorageAdapter.resolveStorage() !== null;
  }

  private static resolveStorage(): Storage | null {
    if (typeof window === "undefined") return null;
    try {
      const testKey = "__ttt_storage_probe__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch {
      return null;
    }
  }
}
