import type { AIContext, AIStrategy } from "./AIStrategy";
import type { Position } from "../types/Position";
import { ensure } from "../utils/assert";
import { shuffle } from "../utils/array";

/**
 * Найпростіша стратегія: повертає випадкову вільну клітинку. Призначена
 * для рівня Easy і для початківців — людина може спокійно вигравати.
 *
 * Чому окремий клас, а не просто функція? Тому що Strategy-патерн вимагає
 * однакового інтерфейсу для всіх рівнів — це робить виклик одностайним
 * (`strategy.decide(...)`) і допомагає при заміні в runtime, наприклад
 * якщо користувач у налаштуваннях змінив рівень посеред гри.
 */
export class RandomStrategy implements AIStrategy {
  public readonly name = "RandomStrategy";

  public decide(context: AIContext): Position {
    const empty = context.board.emptyPositions();
    ensure(empty.length > 0, "RandomStrategy: немає вільних клітинок");
    const shuffled = shuffle(empty);
    return shuffled[0];
  }
}
