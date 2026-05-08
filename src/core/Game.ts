import type { Position } from "../types/Position";
import { type PlayerSymbol, oppositeSymbol } from "../types/Symbol";
import type { GameStatus } from "../types/GameStatus";
import { GameStatuses } from "../types/GameStatus";
import { isGameOver } from "../types/GameStatus";
import { Board } from "./Board";
import type { Move } from "./Move";
import { makeMove } from "./Move";
import { WinChecker } from "./WinChecker";
import { ensure } from "../utils/assert";
import type { Player } from "./Player";

/**
 * Імутабельна модель партії. Game зберігає всі ходи і стан дошки на
 * поточний момент. Кожна успішна спроба ходу повертає новий екземпляр
 * Game — це базовий принцип, який дозволяє реалізувати undo/redo без
 * головного болю та зробити поведінку передбачуваною.
 */
export class Game {
  private readonly board: Board;
  private readonly moves: ReadonlyArray<Move>;
  private readonly currentSymbol: PlayerSymbol;
  private readonly winLength: number;
  private readonly playerX: Player;
  private readonly playerO: Player;
  private readonly status: GameStatus;
  private readonly startedAt: number;
  private readonly finishedAt: number | null;
  private static readonly winChecker = new WinChecker();

  private constructor(input: {
    board: Board;
    moves: ReadonlyArray<Move>;
    currentSymbol: PlayerSymbol;
    winLength: number;
    playerX: Player;
    playerO: Player;
    status: GameStatus;
    startedAt: number;
    finishedAt: number | null;
  }) {
    this.board = input.board;
    this.moves = input.moves;
    this.currentSymbol = input.currentSymbol;
    this.winLength = input.winLength;
    this.playerX = input.playerX;
    this.playerO = input.playerO;
    this.status = input.status;
    this.startedAt = input.startedAt;
    this.finishedAt = input.finishedAt;
  }

  /**
   * Стартова партія: пуста дошка, історія порожня, статус «триває».
   */
  public static start(input: {
    boardSize: number;
    winLength: number;
    firstSymbol: PlayerSymbol;
    playerX: Player;
    playerO: Player;
  }): Game {
    const board = Board.empty(input.boardSize);
    return new Game({
      board,
      moves: [],
      currentSymbol: input.firstSymbol,
      winLength: input.winLength,
      playerX: input.playerX,
      playerO: input.playerO,
      status: GameStatuses.inProgress(),
      startedAt: Date.now(),
      finishedAt: null,
    });
  }

  public getBoard(): Board {
    return this.board;
  }

  public getMoves(): ReadonlyArray<Move> {
    return this.moves;
  }

  public getStatus(): GameStatus {
    return this.status;
  }

  public getCurrentSymbol(): PlayerSymbol {
    return this.currentSymbol;
  }

  public getWinLength(): number {
    return this.winLength;
  }

  public getPlayerX(): Player {
    return this.playerX;
  }

  public getPlayerO(): Player {
    return this.playerO;
  }

  public getStartedAt(): number {
    return this.startedAt;
  }

  public getFinishedAt(): number | null {
    return this.finishedAt;
  }

  /**
   * Поточний гравець, на чий хід чекає гра.
   */
  public getCurrentPlayer(): Player {
    return this.currentSymbol === this.playerX.symbol ? this.playerX : this.playerO;
  }

  /**
   * Чи гра завершена (виграш або нічия).
   */
  public isOver(): boolean {
    return isGameOver(this.status);
  }

  /**
   * Спроба зробити хід поточним гравцем у позицію `position`. Виконує усі
   * перевірки правил та повертає новий екземпляр Game. Якщо хід нелегальний —
   * кидає `ValidationError`.
   *
   * Опційний параметр `options.madeAt` дозволяє відтворити гру із збереженого
   * стану без втрати оригінальних таймстемпів — наприклад, при імпорті
   * `SaveSlot` чи реплеї `MatchRecord`. Без нього беремо `Date.now()`,
   * як і раніше.
   */
  public move(position: Position, options?: { madeAt?: number }): Game {
    ensure(!this.isOver(), "Гра вже завершена — нові ходи неможливі");
    const newBoard = this.board.withMove(position, this.currentSymbol);
    const madeAt = options?.madeAt ?? Date.now();
    const newMoves: Move[] = [
      ...this.moves,
      makeMove(position, this.currentSymbol, madeAt),
    ];
    const newStatus = Game.winChecker.evaluate(newBoard, this.winLength);
    const finished = isGameOver(newStatus);
    return new Game({
      board: newBoard,
      moves: newMoves,
      currentSymbol: oppositeSymbol(this.currentSymbol),
      winLength: this.winLength,
      playerX: this.playerX,
      playerO: this.playerO,
      status: newStatus,
      startedAt: this.startedAt,
      finishedAt: finished ? madeAt : null,
    });
  }

  /**
   * Повертає попередній стан гри. Метод не використовується безпосередньо —
   * undo керується через Command/CommandHistory, але реалізувати його тут
   * корисно для зручності тестування.
   */
  public undoLastMove(): Game {
    ensure(this.moves.length > 0, "Немає ходів для скасування");
    const previousMoves = this.moves.slice(0, -1);
    let board = Board.empty(this.board.size);
    for (const move of previousMoves) {
      board = board.withMove(move.position, move.symbol);
    }
    const newStatus = Game.winChecker.evaluate(board, this.winLength);
    const previousSymbol =
      previousMoves.length === 0
        ? this.firstSymbol()
        : oppositeSymbol(previousMoves[previousMoves.length - 1].symbol);
    return new Game({
      board,
      moves: previousMoves,
      currentSymbol: previousSymbol,
      winLength: this.winLength,
      playerX: this.playerX,
      playerO: this.playerO,
      status: newStatus,
      startedAt: this.startedAt,
      finishedAt: null,
    });
  }

  /**
   * Виводить «поточний хід» (1-based). Корисно для логів та UI.
   */
  public getMoveNumber(): number {
    return this.moves.length + 1;
  }

  /**
   * Повертає інстанс гри з тих самих параметрів, але з пустою дошкою.
   * Це швидкий «restart» без зміни конфігурації.
   */
  public restart(): Game {
    return Game.start({
      boardSize: this.board.size,
      winLength: this.winLength,
      firstSymbol: this.firstSymbol(),
      playerX: this.playerX,
      playerO: this.playerO,
    });
  }

  /**
   * Допоміжний метод: визначає, який символ ходить першим за історією
   * партії.
   */
  public firstSymbol(): PlayerSymbol {
    if (this.moves.length === 0) {
      return this.currentSymbol;
    }
    return this.moves[0].symbol;
  }

  /**
   * Тривалість поточної партії в мс.
   */
  public elapsedMs(now: number = Date.now()): number {
    if (this.finishedAt !== null) {
      return this.finishedAt - this.startedAt;
    }
    return now - this.startedAt;
  }

  /**
   * Серіалізація для збереження.
   */
  public toJSON(): GameSnapshot {
    return {
      boardMatrix: this.board.toMatrix(),
      moves: this.moves.map((move) => ({
        row: move.position.row,
        col: move.position.col,
        symbol: move.symbol,
        madeAt: move.madeAt,
      })),
      currentSymbol: this.currentSymbol,
      winLength: this.winLength,
      playerX: this.playerX,
      playerO: this.playerO,
      status: this.status,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
    };
  }
}

export interface GameSnapshot {
  readonly boardMatrix: ReadonlyArray<ReadonlyArray<PlayerSymbol | null>>;
  readonly moves: ReadonlyArray<{
    row: number;
    col: number;
    symbol: PlayerSymbol;
    madeAt: number;
  }>;
  readonly currentSymbol: PlayerSymbol;
  readonly winLength: number;
  readonly playerX: Player;
  readonly playerO: Player;
  readonly status: GameStatus;
  readonly startedAt: number;
  readonly finishedAt: number | null;
}
