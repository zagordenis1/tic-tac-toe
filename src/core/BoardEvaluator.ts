import type { Board } from "./Board";
import { generateLines, type Line } from "./Lines";
import type { PlayerSymbol } from "../types/Symbol";
import { oppositeSymbol } from "../types/Symbol";

/**
 * Кількісна оцінка позиції на дошці. Не визначає, хто переміг (це робить
 * WinChecker), а повертає число, що відображає «комфортність» розкладу для
 * заданого символу. Використовується HeuristicStrategy і MinimaxStrategy
 * як проміжна оцінка при недосяжності термінального стану.
 *
 * Відокремлення оцінки від перевірки перемоги — приклад Single
 * Responsibility Principle: кожен клас має одне чітко визначене завдання.
 */
export class BoardEvaluator {
  private readonly cache: Map<string, ReadonlyArray<Line>> = new Map();

  /**
   * Повертає оцінку від `for` до `against`. Значення додатнє, якщо позиція
   * вигідна для `forSymbol`, від'ємне — якщо для опонента, нуль — якщо
   * нейтрально. Шкала логарифмічна: дві свої клітинки в одній лінії
   * варті значно більше, ніж дві окремі.
   */
  public evaluate(
    board: Board,
    winLength: number,
    forSymbol: PlayerSymbol,
  ): number {
    const opponent = oppositeSymbol(forSymbol);
    let score = 0;
    const lines = this.getLines(board.size, winLength);
    for (const line of lines) {
      const summary = this.summarizeLine(board, line, forSymbol);
      score += this.lineScore(summary, winLength);
      const oppSummary = this.summarizeLine(board, line, opponent);
      score -= this.lineScore(oppSummary, winLength);
    }
    return score;
  }

  /**
   * Повертає набір потенційно цікавих ходів — у порядку перспективності.
   * Це дозволяє AlphaBetaStrategy робити «move ordering» — суттєво
   * прискорює пошук завдяки кращому відсіканню.
   */
  public orderMoves(
    board: Board,
    winLength: number,
    forSymbol: PlayerSymbol,
  ): import("../types/Position").Position[] {
    const moves = board.emptyPositions();
    const scored = moves.map((position) => {
      const next = board.unsafeWithValue(position, forSymbol);
      const score = this.evaluate(next, winLength, forSymbol);
      return { position, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.map((entry) => entry.position);
  }

  private getLines(size: number, winLength: number): ReadonlyArray<Line> {
    const key = `${size}-${winLength}`;
    let cached = this.cache.get(key);
    if (cached === undefined) {
      cached = generateLines(size, winLength);
      this.cache.set(key, cached);
    }
    return cached;
  }

  private summarizeLine(
    board: Board,
    line: Line,
    forSymbol: PlayerSymbol,
  ): LineSummary {
    let own = 0;
    let empty = 0;
    let other = 0;
    for (const position of line.positions) {
      const value = board.valueAt(position);
      if (value === forSymbol) own += 1;
      else if (value === null) empty += 1;
      else other += 1;
    }
    return { own, empty, other };
  }

  /**
   * Локальна оцінка лінії. Якщо є хоч одна клітинка опонента — лінія для
   * нас «мертва», повертаємо 0. Інакше дуже швидко зростаємо: 1, 10, 100,
   * 1000 — щоб зайнята лінія в N-1 клітинок мала пріоритет над «розпорошеними»
   * розкладами.
   */
  private lineScore(summary: LineSummary, winLength: number): number {
    if (summary.other > 0) return 0;
    if (summary.own === 0) return 0;
    if (summary.own >= winLength) return 100000;
    return 10 ** (summary.own - 1);
  }
}

interface LineSummary {
  readonly own: number;
  readonly empty: number;
  readonly other: number;
}
