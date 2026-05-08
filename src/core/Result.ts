import type { GameStatus } from "../types/GameStatus";
import type { Player } from "./Player";

/**
 * Підсумок партії, який фіксується по її завершенню.
 *
 * Окремий тип потрібен, бо `GameStatus` описує поточний стан логіки
 * (виграш/нічия/у грі), а `MatchResult` додає контекст: учасників,
 * тривалість, кількість ходів — все, що цікаво для статистики/історії.
 */
export interface MatchResult {
  readonly id: string;
  readonly startedAt: number;
  readonly finishedAt: number;
  readonly durationMs: number;
  readonly playerX: Player;
  readonly playerO: Player;
  readonly winner: Player | null;
  readonly status: GameStatus;
  readonly totalMoves: number;
  readonly mode: import("../types/GameMode").GameMode;
  readonly boardSize: number;
  readonly winLength: number;
}
