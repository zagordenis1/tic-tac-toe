import type { AIContext, AIStrategy } from "./AIStrategy";
import type { Position } from "../types/Position";
import { BoardEvaluator } from "../core/BoardEvaluator";
import { WinChecker } from "../core/WinChecker";
import { ensure } from "../utils/assert";
import { oppositeSymbol } from "../types/Symbol";
import { positionsEqual } from "../types/Position";
import { shuffle } from "../utils/array";

/**
 * Стратегія середньої складності. Не виконує глибокого пошуку, але
 * дотримується трьох простих правил у наступному пріоритеті:
 *
 *   1. Якщо я можу виграти за один хід — виграю.
 *   2. Якщо опонент може виграти за один хід — заблокую.
 *   3. Інакше — обираю клітинку, яка дає максимальний приріст оцінки
 *      позиції за `BoardEvaluator`.
 *
 * Така комбінація — це ефективний рівень для людини, яка вже зіграла
 * декілька партій: вона не може просто розставляти крапки, але й не
 * грає ідеально.
 */
export class HeuristicStrategy implements AIStrategy {
  public readonly name = "HeuristicStrategy";

  private readonly evaluator: BoardEvaluator;
  private readonly winChecker: WinChecker;

  public constructor(
    evaluator: BoardEvaluator = new BoardEvaluator(),
    winChecker: WinChecker = new WinChecker(),
  ) {
    this.evaluator = evaluator;
    this.winChecker = winChecker;
  }

  public decide(context: AIContext): Position {
    const empty = context.board.emptyPositions();
    ensure(empty.length > 0, "HeuristicStrategy: немає вільних клітинок");

    const winning = this.findImmediateWin(context, context.forSymbol);
    if (winning !== null) return winning;

    const blocking = this.findImmediateWin(
      context,
      oppositeSymbol(context.forSymbol),
    );
    if (blocking !== null) return blocking;

    return this.bestByEvaluation(context);
  }

  /**
   * Шукає клітинку, в яку якщо поставити `symbol`, той виграє одразу. Це
   * саме «загроза» — лінія, в якій бракує одного символу. Делегуємо це
   * до WinChecker, щоб логіка була в одному місці (DRY).
   */
  private findImmediateWin(
    context: AIContext,
    symbol: import("../types/Symbol").PlayerSymbol,
  ): Position | null {
    const threats = this.winChecker.findThreats(
      context.board,
      context.winLength,
      symbol,
    );
    for (const threat of threats) {
      for (const position of threat.positions) {
        if (context.board.isEmpty(position)) {
          return position;
        }
      }
    }
    return null;
  }

  /**
   * Серед вільних клітинок повертає ту, що дає найбільшу оцінку для
   * нашого символу. При рівних оцінках випадковий вибір — щоб AI не був
   * передбачуваним. Це невеликий, але приємний штрих для враження «ой
   * він трохи варіює свої ходи».
   */
  private bestByEvaluation(context: AIContext): Position {
    const empty = context.board.emptyPositions();
    let bestScore = Number.NEGATIVE_INFINITY;
    let bestMoves: Position[] = [];
    for (const position of empty) {
      const candidate = context.board.unsafeWithValue(
        position,
        context.forSymbol,
      );
      const score = this.evaluator.evaluate(
        candidate,
        context.winLength,
        context.forSymbol,
      );
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [position];
      } else if (score === bestScore) {
        bestMoves.push(position);
      }
    }
    ensure(bestMoves.length > 0, "HeuristicStrategy: не знайдено ходу");
    const shuffled = shuffle(bestMoves);
    return shuffled[0];
  }

  /**
   * Допоміжний метод, який міг би стати в нагоді тестам. Не використовується
   * безпосередньо, але дозволяє з єдиного місця перевірити, чи стратегія
   * відрізняє «корисний» хід від «нейтрального».
   */
  public scoreMove(context: AIContext, position: Position): number {
    const candidate = context.board.unsafeWithValue(
      position,
      context.forSymbol,
    );
    return this.evaluator.evaluate(
      candidate,
      context.winLength,
      context.forSymbol,
    );
  }

  /**
   * Допоміжний метод для тестів — повертає всі найкращі ходи з однаковою
   * оцінкою. Корисно, щоб впевнитися, що стратегія не має детермінованого
   * порядку обходу клітинок (інакше ми отримали б завжди той самий хід).
   */
  public bestMoves(context: AIContext): Position[] {
    const empty = context.board.emptyPositions();
    let bestScore = Number.NEGATIVE_INFINITY;
    let bestMoves: Position[] = [];
    for (const position of empty) {
      const candidate = context.board.unsafeWithValue(
        position,
        context.forSymbol,
      );
      const score = this.evaluator.evaluate(
        candidate,
        context.winLength,
        context.forSymbol,
      );
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [position];
      } else if (score === bestScore) {
        bestMoves.push(position);
      }
    }
    return bestMoves.filter(
      (position, index, array) =>
        array.findIndex((other) => positionsEqual(other, position)) === index,
    );
  }
}
