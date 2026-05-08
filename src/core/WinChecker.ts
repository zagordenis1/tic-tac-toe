import type { Board } from "./Board";
import type { GameStatus } from "../types/GameStatus";
import { GameStatuses } from "../types/GameStatus";
import { generateLines, type Line } from "./Lines";
import type { PlayerSymbol } from "../types/Symbol";

/**
 * Перевіряє стан гри на дошці. Виокремлено в окремий клас, бо це логіка
 * правил гри і вона має бути єдиним джерелом правди як для самої гри, так і
 * для AI (Single Responsibility Principle).
 *
 * Внутрішньо WinChecker кешує згенеровані лінії — створювати їх кожного
 * разу при перевірці перемоги дорого, особливо для дошок 5х5 і більше.
 */
export class WinChecker {
  private readonly cache: Map<string, ReadonlyArray<Line>> = new Map();

  /**
   * Повертає поточний `GameStatus`. Якщо хтось переміг — повертає `won`
   * з координатами виграшної лінії; якщо вільних клітинок немає — `draw`;
   * інакше — `in_progress`.
   */
  public evaluate(board: Board, winLength: number): GameStatus {
    const lines = this.getLines(board.size, winLength);
    for (const line of lines) {
      const winner = this.lineWinner(board, line);
      if (winner !== null) {
        return GameStatuses.won(winner, line.positions);
      }
    }
    if (board.isFull()) {
      return GameStatuses.draw();
    }
    return GameStatuses.inProgress();
  }

  /**
   * Перевіряє, чи задана конфігурація на дошці має «загрозу» — тобто
   * чи є лінія, в якій усі клітинки заповнені одним символом окрім однієї
   * порожньої. Знадобиться евристиці AI для блокування противника.
   */
  public findThreats(
    board: Board,
    winLength: number,
    forSymbol: PlayerSymbol,
  ): Line[] {
    const lines = this.getLines(board.size, winLength);
    const threats: Line[] = [];
    for (const line of lines) {
      let countOwn = 0;
      let countEmpty = 0;
      let countOther = 0;
      for (const position of line.positions) {
        const value = board.valueAt(position);
        if (value === forSymbol) countOwn += 1;
        else if (value === null) countEmpty += 1;
        else countOther += 1;
      }
      if (countOther === 0 && countOwn === winLength - 1 && countEmpty === 1) {
        threats.push(line);
      }
    }
    return threats;
  }

  /**
   * Повертає кеш лінії для пари (size, winLength). Це інкапсулює дрібну
   * оптимізацію, не загрожуючи інкапсуляції класу.
   */
  private getLines(size: number, winLength: number): ReadonlyArray<Line> {
    const key = `${size}-${winLength}`;
    let cached = this.cache.get(key);
    if (cached === undefined) {
      cached = generateLines(size, winLength);
      this.cache.set(key, cached);
    }
    return cached;
  }

  /**
   * Обчислює переможця конкретної лінії. Якщо всі клітинки лінії заповнено
   * одним символом — він переможець; інакше null.
   */
  private lineWinner(board: Board, line: Line): PlayerSymbol | null {
    const first = board.valueAt(line.positions[0]);
    if (first === null) return null;
    for (let i = 1; i < line.positions.length; i += 1) {
      if (board.valueAt(line.positions[i]) !== first) return null;
    }
    return first;
  }
}
