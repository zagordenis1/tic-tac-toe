import type { Difficulty } from "../types/Difficulty";

/**
 * Категорія досягнення. Категорії — суто косметика для UI,
 * але виокремлення в тип робить можливою компіляційну перевірку
 * на всіх місцях, де ми відображаємо іконки/кольори.
 */
export type AchievementCategory =
  | "milestones"
  | "skill"
  | "streak"
  | "speed"
  | "exploration";

/**
 * Декларативний опис одного досягнення. Сама перевірка винесена в
 * предикат `isUnlocked`: ми не зашиваємо логіку у репозиторій,
 * а реалізуємо «правила» як набір невеликих обʼєктів — це класичний
 * Rules / Strategy патерн.
 */
export interface Achievement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: AchievementCategory;
  readonly icon: string;

  /**
   * Опційний натяк UI: якщо досягнення «гадко складне», ми можемо
   * показати золоту рамку. UI не зобовʼязаний це використовувати.
   */
  readonly tier: "bronze" | "silver" | "gold";

  /**
   * Чисте правило: дивиться на агрегат і контекст останньої партії
   * та повертає bool. Хочемо, щоб правила НЕ читали зовнішніх
   * сховищ — у цьому й сила підходу: тести тривіальні, побічних
   * ефектів немає.
   */
  readonly isUnlocked: (input: AchievementInput) => boolean;
}

/**
 * Контекст, у якому правило приймає рішення. Включає лише потрібні
 * поля — навіть якщо ми пізніше додамо більше «знань» (наприклад,
 * повну історію), нинішні правила не зламаються.
 */
export interface AchievementInput {
  readonly games: number;
  readonly wins: number;
  readonly losses: number;
  readonly draws: number;
  readonly currentWinStreak: number;
  readonly bestWinStreak: number;
  readonly lastMatch: AchievementMatchSummary | null;
}

/**
 * Стиснута форма останньої партії — ми навмисно не передаємо весь
 * `MatchRecord`, бо більшість його полів не потрібні правилам.
 */
export interface AchievementMatchSummary {
  readonly result: "win" | "loss" | "draw";
  readonly opponentType: "human" | "ai";
  readonly opponentDifficulty: Difficulty | null;
  readonly moveCount: number;
  readonly durationMs: number;
  readonly boardSize: number;
}

/**
 * Запис про відкриття досягнення. Зберігаємо момент розблокування
 * та ID — UI відрізняє «нове» (за останні 24 години) від «старого».
 */
export interface UnlockedAchievement {
  readonly id: string;
  readonly unlockedAt: number;
}
