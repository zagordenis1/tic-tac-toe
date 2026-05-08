import type { AIContext, AIStrategy } from "./AIStrategy";
import type { Board } from "../core/Board";
import type { Position } from "../types/Position";
import type { PlayerSymbol } from "../types/Symbol";
import { oppositeSymbol } from "../types/Symbol";
import { WinChecker } from "../core/WinChecker";
import { BoardEvaluator } from "../core/BoardEvaluator";
import { ensure } from "../utils/assert";
import { isWin, isDraw } from "../types/GameStatus";
import { MINIMAX_MAX_DEPTH } from "../utils/constants";

/**
 * Класичний minimax без alpha-beta. Робить повний пошук на глибину
 * `maxDepth`, чергуючи максимізатора (наш AI) з мінімізатором (опонент).
 *
 * Корисний на дошках 3х3, де простір станів невеликий (9!) і пошук завжди
 * термінальний. На більших дошках обмежуємо глибину константою
 * `MINIMAX_MAX_DEPTH` — інакше браузер зависне.
 *
 * AlphaBetaStrategy — це наш «продакшн-варіант» minimax, але класичний
 * minimax залишаємо як окремий рівень: він виразно демонструє патерн
 * Strategy і служить контрольним прикладом для тестів.
 */
export class MinimaxStrategy implements AIStrategy {
  public readonly name = "MinimaxStrategy";

  private readonly winChecker: WinChecker;
  private readonly evaluator: BoardEvaluator;
  private readonly maxDepth: number;

  public constructor(
    options: {
      winChecker?: WinChecker;
      evaluator?: BoardEvaluator;
      maxDepth?: number;
    } = {},
  ) {
    this.winChecker = options.winChecker ?? new WinChecker();
    this.evaluator = options.evaluator ?? new BoardEvaluator();
    this.maxDepth = options.maxDepth ?? MINIMAX_MAX_DEPTH;
  }

  public decide(context: AIContext): Position {
    const empty = context.board.emptyPositions();
    ensure(empty.length > 0, "MinimaxStrategy: немає вільних клітинок");

    let bestScore = Number.NEGATIVE_INFINITY;
    let bestMove: Position | null = null;

    for (const position of empty) {
      const next = context.board.unsafeWithValue(position, context.forSymbol);
      const score = this.minimax(
        next,
        context.winLength,
        context.forSymbol,
        oppositeSymbol(context.forSymbol),
        this.maxDepth - 1,
      );
      if (score > bestScore || bestMove === null) {
        bestScore = score;
        bestMove = position;
      }
    }

    ensure(bestMove !== null, "MinimaxStrategy: не знайдено ходу");
    return bestMove;
  }

  /**
   * Рекурсивний minimax. Повертає оцінку поточної дошки з точки зору
   * `forSymbol` після того, як `currentSymbol` має зробити свій хід.
   */
  private minimax(
    board: Board,
    winLength: number,
    forSymbol: PlayerSymbol,
    currentSymbol: PlayerSymbol,
    depth: number,
  ): number {
    const status = this.winChecker.evaluate(board, winLength);
    if (isWin(status)) {
      return status.winner === forSymbol ? this.winScore(depth) : -this.winScore(depth);
    }
    if (isDraw(status)) {
      return 0;
    }
    if (depth <= 0) {
      return this.evaluator.evaluate(board, winLength, forSymbol);
    }

    const isMaximizing = currentSymbol === forSymbol;
    let best = isMaximizing
      ? Number.NEGATIVE_INFINITY
      : Number.POSITIVE_INFINITY;
    const empty = board.emptyPositions();
    for (const position of empty) {
      const next = board.unsafeWithValue(position, currentSymbol);
      const score = this.minimax(
        next,
        winLength,
        forSymbol,
        oppositeSymbol(currentSymbol),
        depth - 1,
      );
      if (isMaximizing) {
        if (score > best) best = score;
      } else if (score < best) {
        best = score;
      }
    }
    return best;
  }

  /**
   * Виграш у глибині 0 цінується вище, ніж виграш «після купи ходів». Це
   * підштовхує AI закінчувати партію якнайшвидше і тримає поразку від
   * опонента «якнайдалі» — результат: виграш веде в коротший шлях, поразка
   * відсувається.
   */
  private winScore(depth: number): number {
    return 1_000_000 + depth;
  }
}
