import { JsonRepository } from "../JsonRepository";
import type { StorageAdapter } from "../StorageAdapter";
import type { SaveSlot } from "../SaveSlot";

/**
 * Сховище одного «активного» слоту збереження. Тримаємо саме слот, а
 * не повну історію партій — це прискорює завантаження UI: при старті
 * нам треба знати лише, чи є зкуди продовжити, і одне читання дешевше
 * за обхід усієї історії.
 */
export class SaveSlotRepository {
  public static readonly STORAGE_KEY = "ttt:save-slot";
  private static readonly VERSION = 1;

  private readonly inner: JsonRepository<SaveSlot | null>;

  public constructor(adapter: StorageAdapter) {
    this.inner = new JsonRepository<SaveSlot | null>({
      adapter,
      key: SaveSlotRepository.STORAGE_KEY,
      defaultValue: null,
      version: SaveSlotRepository.VERSION,
      migrate: (raw) => SaveSlotRepository.coerce(raw),
    });
  }

  /**
   * Повертає поточний слот, якщо він валідний, інакше `null`.
   */
  public load(): SaveSlot | null {
    return this.inner.load();
  }

  public save(slot: SaveSlot): void {
    this.inner.save(slot);
  }

  /**
   * Стирає поточний слот (наприклад, після завершення партії).
   */
  public clear(): void {
    this.inner.clear();
  }

  public hasSavedGame(): boolean {
    return this.inner.load() !== null;
  }

  /**
   * Базова перевірка форми. Якщо щось не сходиться — повертаємо `null`,
   * щоб «битий» localStorage не зруйнував UI.
   */
  private static coerce(raw: unknown): SaveSlot | null {
    if (raw === null || typeof raw !== "object") return null;
    const candidate = raw as Partial<SaveSlot>;
    if (
      typeof candidate.slotName !== "string" ||
      typeof candidate.savedAt !== "number" ||
      typeof candidate.boardSize !== "number" ||
      typeof candidate.winLength !== "number" ||
      !candidate.playerX ||
      !candidate.playerO ||
      !Array.isArray(candidate.moves)
    ) {
      return null;
    }
    return candidate as SaveSlot;
  }
}
