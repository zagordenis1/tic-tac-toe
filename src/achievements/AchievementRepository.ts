import { JsonRepository } from "../persistence/JsonRepository";
import type { StorageAdapter } from "../persistence/StorageAdapter";
import type { UnlockedAchievement } from "./Achievement";

/**
 * Сховище розблокованих досягнень. Використовує `JsonRepository`
 * як обгортку над `StorageAdapter`, щоб не дублювати логіку
 * серіалізації/версіювання. Сама бізнес-логіка тут зведена до
 * мінімуму: «додай нове, не дублюй, поверни різницю».
 */
export class AchievementRepository {
  private static readonly STORAGE_KEY = "ttt:achievements";
  private static readonly STORAGE_VERSION = 1;

  private readonly inner: JsonRepository<UnlockedAchievement[]>;

  public constructor(adapter: StorageAdapter) {
    this.inner = new JsonRepository<UnlockedAchievement[]>({
      adapter,
      key: AchievementRepository.STORAGE_KEY,
      defaultValue: [],
      version: AchievementRepository.STORAGE_VERSION,
      migrate: AchievementRepository.normalize,
    });
  }

  /**
   * Повертає всі відкриті досягнення, відсортовані за часом
   * розблокування (найсвіжіші — внизу). UI може перевернути
   * послідовність на свій смак.
   */
  public list(): ReadonlyArray<UnlockedAchievement> {
    return [...this.inner.load()].sort((a, b) => a.unlockedAt - b.unlockedAt);
  }

  /**
   * Перевіряє, чи `id` уже розблоковано. Зручніше у клієнтському коді,
   * ніж робити `list().find(...)`.
   */
  public hasUnlocked(id: string): boolean {
    return this.list().some((entry) => entry.id === id);
  }

  /**
   * Запис: бере новий список «зараз виконані» і повертає лише ті
   * id, які ще не були в сховищі. Це дає змогу UI показати «нові»
   * досягнення з красивою анімацією.
   *
   * Якщо нічого нового не зʼявилось — НЕ записуємо в storage, аби
   * не смикати localStorage.
   */
  public unlockMany(ids: ReadonlyArray<string>, now: number): UnlockedAchievement[] {
    const existing = new Set(this.list().map((entry) => entry.id));
    const fresh: UnlockedAchievement[] = ids
      .filter((id) => !existing.has(id))
      .map((id) => ({ id, unlockedAt: now }));
    if (fresh.length === 0) return [];
    this.inner.save([...this.inner.load(), ...fresh]);
    return fresh;
  }

  /**
   * Гарне «скинути все» — нікому не до вподоби тестувати з
   * вічно розблокованими досягненнями. UI покаже кнопку у налаштуваннях.
   */
  public clear(): void {
    this.inner.clear();
  }

  /**
   * Експорт у JSON-рядок. Дзеркальний до `importJson`, корисний
   * для бекапу прогресу.
   */
  public exportJson(): string {
    return JSON.stringify(this.list());
  }

  /**
   * Імпорт зі строки. Робимо мердж із поточними записами, аби не
   * втратити більш ранні відкриття. Повертає кількість додаваних.
   */
  public importJson(json: string): number {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error("AchievementRepository.importJson: очікувався масив");
    }
    const valid = parsed.filter(
      AchievementRepository.isUnlocked,
    ) as UnlockedAchievement[];
    const seen = new Set(this.list().map((entry) => entry.id));
    const fresh = valid.filter((entry) => !seen.has(entry.id));
    if (fresh.length === 0) return 0;
    this.inner.save([...this.inner.load(), ...fresh]);
    return fresh.length;
  }

  /**
   * Захищає від «битих» записів зі сховища: фільтрує елементи, які
   * не схожі на наш формат, і повертає чистий список.
   */
  private static normalize(raw: unknown): UnlockedAchievement[] | null {
    if (!Array.isArray(raw)) return null;
    return raw.filter(AchievementRepository.isUnlocked) as UnlockedAchievement[];
  }

  private static isUnlocked(value: unknown): value is UnlockedAchievement {
    if (value === null || typeof value !== "object") return false;
    const candidate = value as Partial<UnlockedAchievement>;
    return (
      typeof candidate.id === "string" &&
      typeof candidate.unlockedAt === "number" &&
      Number.isFinite(candidate.unlockedAt)
    );
  }
}
