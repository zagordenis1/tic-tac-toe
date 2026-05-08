/**
 * Рівні складності AI. Конкретні стратегії, що відповідають кожному
 * рівню, реєструються у фабриці AI-гравців (див. /ai/AIPlayerFactory.ts).
 *
 * Ми обираємо чотири рівні, тому що:
 *   - Easy   — випадковий хід для нових гравців;
 *   - Medium — спрощена евристика;
 *   - Hard   — minimax;
 *   - Insane — minimax з alpha-beta pruning та глибоким аналізом.
 */
export const Difficulty = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
  Insane: "insane",
} as const;

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

/**
 * Список усіх рівнів. Використовується для відображення селектора
 * складності в UI без хардкоду рядків.
 */
export const ALL_DIFFICULTIES: ReadonlyArray<Difficulty> = [
  Difficulty.Easy,
  Difficulty.Medium,
  Difficulty.Hard,
  Difficulty.Insane,
];

/**
 * Числова оцінка складності — стане в нагоді, якщо ми захочемо порахувати
 * середню силу противника гравця (для статистики чи досягнень).
 */
export function difficultyToWeight(difficulty: Difficulty): number {
  switch (difficulty) {
    case Difficulty.Easy:
      return 1;
    case Difficulty.Medium:
      return 2;
    case Difficulty.Hard:
      return 3;
    case Difficulty.Insane:
      return 4;
    default:
      return 0;
  }
}
