import type { PlayerSymbol } from "./Symbol";

/**
 * Стан гри з точки зору правил. Ми не змішуємо «технічні» стани
 * (наприклад, очікування ходу AI) з ігровими: для технічних
 * використовується patternState (див. /core/state).
 */
export type GameStatusKind = "in_progress" | "won" | "draw";

/**
 * Інтерфейс «гра триває». Окремий тип робить дискриміновану унію
 * (`GameStatus`), яка дозволяє TypeScript зрозуміти, що в стані `won`
 * обов'язково присутній `winner`.
 */
export interface InProgressStatus {
  readonly kind: "in_progress";
}

export interface WonStatus {
  readonly kind: "won";
  readonly winner: PlayerSymbol;
  readonly winningLine: ReadonlyArray<{ row: number; col: number }>;
}

export interface DrawStatus {
  readonly kind: "draw";
}

export type GameStatus = InProgressStatus | WonStatus | DrawStatus;

/**
 * Конструктори статусів. Виокремлення в окремі функції дає одне місце
 * правди для створення відповідних об'єктів і робить код, що робить
 * рішення про статус, чистішим.
 */
export const GameStatuses = {
  inProgress(): InProgressStatus {
    return { kind: "in_progress" };
  },
  won(
    winner: PlayerSymbol,
    winningLine: ReadonlyArray<{ row: number; col: number }>,
  ): WonStatus {
    return { kind: "won", winner, winningLine };
  },
  draw(): DrawStatus {
    return { kind: "draw" };
  },
};

export function isGameOver(status: GameStatus): boolean {
  return status.kind !== "in_progress";
}

export function isWin(status: GameStatus): status is WonStatus {
  return status.kind === "won";
}

export function isDraw(status: GameStatus): status is DrawStatus {
  return status.kind === "draw";
}
