import { JsonRepository } from "../JsonRepository";
import type { StorageAdapter } from "../StorageAdapter";
import type { MatchRecord } from "../Match";

/**
 * Сховище історії партій. Тримає масив `MatchRecord` під єдиним
 * ключем `ttt:matches`. Розмір списку обмежено зверху, щоб уникнути
 * необмеженого зростання у localStorage.
 */
export class MatchRepository {
  public static readonly STORAGE_KEY = "ttt:matches";
  public static readonly DEFAULT_LIMIT = 100;
  private static readonly VERSION = 1;

  private readonly inner: JsonRepository<MatchRecord[]>;
  private readonly limit: number;

  public constructor(adapter: StorageAdapter, limit: number = MatchRepository.DEFAULT_LIMIT) {
    this.limit = limit;
    this.inner = new JsonRepository<MatchRecord[]>({
      adapter,
      key: MatchRepository.STORAGE_KEY,
      defaultValue: [],
      version: MatchRepository.VERSION,
      migrate: MatchRepository.migrate,
    });
  }

  /**
   * Повертає копію всіх записів. Зовнішній код не повинен мутувати
   * масив, тому ми його клонуємо й заморожуємо у JsonRepository.
   */
  public listAll(): MatchRecord[] {
    return [...this.inner.load()];
  }

  /**
   * Повертає `count` останніх записів — наприклад, для віджету
   * «останні партії» у головному екрані.
   */
  public listRecent(count: number): MatchRecord[] {
    const all = this.inner.load();
    if (count >= all.length) return [...all];
    return all.slice(all.length - count);
  }

  /**
   * Знаходить запис за id. Повертає `null`, якщо такого нема.
   */
  public findById(id: string): MatchRecord | null {
    return this.inner.load().find((record) => record.id === id) ?? null;
  }

  /**
   * Додає новий запис у кінець списку. Якщо запис із таким id уже є,
   * перезаписує його (UI може зберегти партію проміжно).
   */
  public save(record: MatchRecord): void {
    const all = this.inner.load();
    const without = all.filter((existing) => existing.id !== record.id);
    without.push(record);
    while (without.length > this.limit) without.shift();
    this.inner.save(without);
  }

  /**
   * Видаляє один запис за id.
   */
  public delete(id: string): void {
    const all = this.inner.load();
    const without = all.filter((existing) => existing.id !== id);
    this.inner.save(without);
  }

  public deleteAll(): void {
    this.inner.clear();
  }

  /**
   * Експортує всі записи у JSON-рядок. Корисно для функції
   * «завантажити архів партій» у налаштуваннях.
   */
  public exportJson(): string {
    return JSON.stringify(this.inner.load(), null, 2);
  }

  /**
   * Імпортує записи з JSON-рядка. Якщо JSON битий — кидає помилку.
   */
  public importJson(json: string): number {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error("MatchRepository.importJson: очікувався масив записів");
    }
    const valid = parsed.filter(MatchRepository.isMatchRecord);
    this.inner.save(valid as MatchRecord[]);
    return valid.length;
  }

  public count(): number {
    return this.inner.load().length;
  }

  /**
   * Базова валідація запису. Перевіряє лише наявність полів — повну
   * валідацію за конкретною формою payload робить `MatchRecord` тип.
   */
  private static isMatchRecord(value: unknown): value is MatchRecord {
    if (value === null || typeof value !== "object") return false;
    const candidate = value as Partial<MatchRecord>;
    return (
      typeof candidate.id === "string" &&
      typeof candidate.playedAt === "number" &&
      typeof candidate.boardSize === "number" &&
      typeof candidate.winLength === "number" &&
      Array.isArray(candidate.moves)
    );
  }

  /**
   * Міграція з попередніх версій. Поки лише одна версія, тож просто
   * приймаємо існуючий формат.
   */
  private static migrate(raw: unknown): MatchRecord[] | null {
    if (!Array.isArray(raw)) return null;
    return raw.filter(MatchRepository.isMatchRecord) as MatchRecord[];
  }
}
