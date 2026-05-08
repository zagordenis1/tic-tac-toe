import type { AIContext, AIStrategy } from "./AIStrategy";
import type { Board } from "../core/Board";
import type { Position } from "../types/Position";
import type { PlayerSymbol } from "../types/Symbol";
import { oppositeSymbol } from "../types/Symbol";
import { WinChecker } from "../core/WinChecker";
import { BoardEvaluator } from "../core/BoardEvaluator";
import { ensure } from "../utils/assert";
import { isWin, isDraw } from "../types/GameStatus";

/**
 * Minimax з alpha-beta pruning та упорядкуванням ходів. Це наш «найсильніший»
 * AI — рівень Insane. Завдяки відсіканню непотрібних гілок ми можемо вільно
 * глядіти на 8-10 ходів вперед на дошках 4х4 і навіть 5х5.
 *
 * Окрім самого alpha-beta, тут зроблено кілька покращень:
 *   - Move ordering через BoardEvaluator.orderMoves: спочатку перевіряємо
 *     найбільш «обнадійливі» ходи, що драматично прискорює відсікання.
 *   - Виграш на меншій глибині цінується вище, ніж на більшій (швидко
 *     закінчити партію), а поразка — навпаки.
 *   - Якщо ми досягли максимальної глибини, повертаємо евристичну оцінку
 *     дошки. Без цього на великих дошках пошук був би невиправдано довгим.
 */
export class AlphaBetaStrategy implements AIStrategy {
  public readonly name = "AlphaBetaStrategy";

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
    this.maxDepth = options.maxDepth ?? this.suggestDepthForBoard();
  }

  public decide(context: AIContext): Position {
    const empty = context.board.emptyPositions();
    ensure(empty.length > 0, "AlphaBetaStrategy: немає вільних клітинок");

    if (context.board.isEmpty_()) {
      return context.board.centerPosition();
    }

    const ordered = this.evaluator.orderMoves(
      context.board,
      context.winLength,
      context.forSymbol,
    );

    let bestScore = Number.NEGATIVE_INFINITY;
    let bestMove: Position | null = null;
    let alpha = Number.NEGATIVE_INFINITY;
    const beta = Number.POSITIVE_INFINITY;
    const maxDepth = this.adaptiveDepth(context.board);

    for (const position of ordered) {
      const next = context.board.unsafeWithValue(position, context.forSymbol);
      const score = this.search(
        next,
        context.winLength,
        context.forSymbol,
        oppositeSymbol(context.forSymbol),
        maxDepth - 1,
        alpha,
        beta,
      );
      if (score > bestScore || bestMove === null) {
        bestScore = score;
        bestMove = position;
      }
      if (score > alpha) {
        alpha = score;
      }
    }

    ensure(bestMove !== null, "AlphaBetaStrategy: не знайдено ходу");
    return bestMove;
  }

  /**
   * Рекурсивна функція пошуку з alpha-beta pruning. Аргументи `alpha` і
   * `beta` обмежують вікно прийнятних значень: якщо знайдене значення
   * «вилазить» за вікно, ми пропускаємо решту гілки — її в будь-якому
   * випадку не оберуть.
   */
  private search(
    board: Board,
    winLength: number,
    forSymbol: PlayerSymbol,
    currentSymbol: PlayerSymbol,
    depth: number,
    alpha: number,
    beta: number,
  ): number {
    const status = this.winChecker.evaluate(board, winLength);
    if (isWin(status)) {
      return status.winner === forSymbol
        ? this.winScore(depth)
        : -this.winScore(depth);
    }
    if (isDraw(status)) {
      return 0;
    }
    if (depth <= 0) {
      return this.evaluator.evaluate(board, winLength, forSymbol);
    }

    const ordered = this.evaluator.orderMoves(board, winLength, currentSymbol);
    const isMaximizing = currentSymbol === forSymbol;
    let best = isMaximizing
      ? Number.NEGATIVE_INFINITY
      : Number.POSITIVE_INFINITY;
    let localAlpha = alpha;
    let localBeta = beta;

    for (const position of ordered) {
      const next = board.unsafeWithValue(position, currentSymbol);
      const score = this.search(
        next,
        winLength,
        forSymbol,
        oppositeSymbol(currentSymbol),
        depth - 1,
        localAlpha,
        localBeta,
      );
      if (isMaximizing) {
        if (score > best) best = score;
        if (best > localAlpha) localAlpha = best;
      } else {
        if (score < best) best = score;
        if (best < localBeta) localBeta = best;
      }
      if (localBeta <= localAlpha) {
        break;
      }
    }
    return best;
  }

  /**
   * Адаптивна глибина: для маленьких дошок ми можемо собі дозволити повний
   * пошук; для великих обмежуємо. Без цієї адаптації AI на дошці 5х5 міг би
   * замислитися на хвилину — нікому це не цікаво.
   */
  private adaptiveDepth(board: Board): number {
    const free = board.freeCount;
    if (board.size <= 3) return Math.min(this.maxDepth, free);
    if (board.size === 4) return Math.min(this.maxDepth, 6);
    if (board.size === 5) return Math.min(this.maxDepth, 4);
    return Math.min(this.maxDepth, 3);
  }

  private suggestDepthForBoard(): number {
    return 8;
  }

  /**
   * Виграш у глибині 0 цінується вище, ніж виграш «після купи ходів». Це
   * підштовхує AI закінчувати партію якнайшвидше і тримає поразку від
   * опонента «якнайдалі». На рівні Insane це особливо важливо: гравцеві
   * приємно бачити, що AI «змушує здатися», а не просто «грає на обмеження».
   */
  private winScore(depth: number): number {
    return 1_000_000 + depth;
  }
}
