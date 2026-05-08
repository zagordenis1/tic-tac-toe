import type { AIStrategy } from "./AIStrategy";
import type { Game } from "../core/Game";
import type { Position } from "../types/Position";
import { ensure } from "../utils/assert";
import { AI_THINKING_DELAY_MS } from "../utils/constants";

/**
 * Контролер виконання ходу AI. Йому передають поточну партію (`Game`) і
 * стратегію — а він повертає або готовий хід, або Promise з затримкою,
 * щоб людина встигла побачити «думання» бота. Це невелика, але важлива
 * абстракція: вона дозволяє UI бути «дурним» і не знати, як саме AI
 * приймає рішення.
 *
 * Окремий клас для цього сценарію корисний з кількох причин:
 *   - тести можуть передати `delayMs = 0`, щоб не чекати в реальному часі;
 *   - ми зосереджуємо в одному місці питання обробки помилок (наприклад
 *     якщо стратегія повернула невалідну позицію — ловимо це тут);
 *   - можна легко додати фіче-флаги (наприклад «логувати кожен хід AI»)
 *     без розповзання логіки по UI.
 */
export class AIController {
  private readonly delayMs: number;

  public constructor(options: { delayMs?: number } = {}) {
    this.delayMs = options.delayMs ?? AI_THINKING_DELAY_MS;
  }

  /**
   * Синхронно обчислює хід AI. Використовується там, де нам не треба
   * показувати «думання» (наприклад у тестах або в самовідтворенні
   * партій).
   */
  public chooseMove(strategy: AIStrategy, game: Game): Position {
    ensure(!game.isOver(), "AIController: гра вже закінчена");
    const board = game.getBoard();
    const winLength = game.getWinLength();
    const forSymbol = game.getCurrentSymbol();
    const position = strategy.decide({ board, winLength, forSymbol });
    ensure(
      board.isEmpty(position),
      `AIController: стратегія повернула зайняту клітинку ${position.row},${position.col}`,
    );
    return position;
  }

  /**
   * Асинхронний варіант: повертає Promise, який резолвиться через
   * налаштовану затримку (стандартно — `AI_THINKING_DELAY_MS`). Якщо
   * затримка нульова — повертаємо Promise, що резолвиться одразу.
   */
  public chooseMoveAsync(
    strategy: AIStrategy,
    game: Game,
  ): Promise<Position> {
    const position = this.chooseMove(strategy, game);
    if (this.delayMs <= 0) return Promise.resolve(position);
    return new Promise((resolve) => {
      setTimeout(() => resolve(position), this.delayMs);
    });
  }

  /**
   * Зручне розширення: одразу робить хід у переданому Game і повертає
   * новий екземпляр гри. Корисно у тестах та в self-play.
   */
  public playOnce(strategy: AIStrategy, game: Game): Game {
    const position = this.chooseMove(strategy, game);
    return game.move(position);
  }
}
