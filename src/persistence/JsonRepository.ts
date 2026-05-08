import type { StorageAdapter } from "./StorageAdapter";

/**
 * Загальний JSON-репозиторій: бере на себе серіалізацію через
 * `JSON.stringify`/`JSON.parse` і обробку «битих» значень. Шар вище
 * (`MatchRepository`, `SettingsRepository`) використовує його як
 * базу і нічого не знає про конкретний адаптер.
 *
 * Generic-параметр `T` фіксує типобезпеку: репозиторій не дозволить
 * випадково записати інший тип.
 */
export class JsonRepository<T> {
  private readonly adapter: StorageAdapter;
  private readonly key: string;
  private readonly defaultValue: T;
  private readonly version: number;
  private readonly migrate: (raw: unknown, version: number | null) => T | null;

  public constructor(options: {
    adapter: StorageAdapter;
    key: string;
    defaultValue: T;
    version?: number;
    migrate?: (raw: unknown, version: number | null) => T | null;
  }) {
    this.adapter = options.adapter;
    this.key = options.key;
    this.defaultValue = options.defaultValue;
    this.version = options.version ?? 1;
    this.migrate = options.migrate ?? ((raw) => raw as T);
  }

  /**
   * Читає значення зі сховища. Якщо запис відсутній або пошкоджений,
   * повертається `defaultValue` — це робить виклик тривіальним для
   * сторони, що читає.
   */
  public load(): T {
    const raw = this.adapter.read(this.key);
    if (raw === null) return this.defaultValue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return this.defaultValue;
    }
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "version" in parsed &&
      "data" in parsed
    ) {
      const wrapper = parsed as { version: number; data: unknown };
      const migrated = this.migrate(wrapper.data, wrapper.version);
      return migrated ?? this.defaultValue;
    }
    // Підтримка «старого» формату — без обгортки `{ version, data }`.
    const migrated = this.migrate(parsed, null);
    return migrated ?? this.defaultValue;
  }

  /**
   * Записує нове значення. Загортає його в обʼєкт `{ version, data }`,
   * щоб у майбутньому можна було робити міграції без втрати даних.
   */
  public save(value: T): void {
    const payload = JSON.stringify({ version: this.version, data: value });
    this.adapter.write(this.key, payload);
  }

  /**
   * Стирає значення зі сховища.
   */
  public clear(): void {
    this.adapter.remove(this.key);
  }

  public getKey(): string {
    return this.key;
  }
}
