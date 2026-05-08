import type { StorageAdapter } from "../StorageAdapter";

/**
 * Адаптер, який тримає дані в памʼяті процесу. Використовуємо у
 * тестах і як fallback для середовищ без `window` (наприклад, SSR
 * або Node-оточення Vitest).
 *
 * Реалізує найпростіший «контракт» з `StorageAdapter` без зайвих
 * фокусів: одна `Map<string, string>` всередині.
 */
export class InMemoryAdapter implements StorageAdapter {
  private readonly store: Map<string, string>;

  public constructor(initial?: Iterable<[string, string]>) {
    this.store = new Map(initial);
  }

  public read(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  public write(key: string, value: string): void {
    this.store.set(key, value);
  }

  public remove(key: string): void {
    this.store.delete(key);
  }

  public keys(prefix: string): string[] {
    const result: string[] = [];
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) result.push(key);
    }
    return result;
  }

  public clearPrefix(prefix: string): void {
    for (const key of this.keys(prefix)) {
      this.store.delete(key);
    }
  }

  /**
   * Допоміжне: повне очищення сховища. Не входить в інтерфейс, бо в
   * `localStorage` ми зазвичай не хочемо стирати чужі ключі.
   */
  public reset(): void {
    this.store.clear();
  }

  public size(): number {
    return this.store.size;
  }
}
