import type { GameStatus } from "../types/GameStatus";
import type { PlayerSymbol } from "../types/Symbol";
import type { Difficulty } from "../types/Difficulty";

/**
 * Запис партії, що зберігається в історії. Це не сам Game, а лише
 * «відбиток» — те, що цікаво показати користувачу в списку та
 * використати для статистики.
 */
export interface MatchRecord {
  readonly id: string;
  readonly playedAt: number;
  readonly durationMs: number;
  readonly boardSize: number;
  readonly winLength: number;
  readonly playerX: MatchParticipant;
  readonly playerO: MatchParticipant;
  readonly status: GameStatus;
  readonly moves: ReadonlyArray<MatchMoveRecord>;
}

/**
 * Учасник партії в записі: достатньо знати імʼя, тип («human»/«ai»)
 * і складність для AI. Всі інші реквізити можна обчислити.
 */
export interface MatchParticipant {
  readonly name: string;
  readonly symbol: PlayerSymbol;
  readonly type: "human" | "ai";
  readonly difficulty: Difficulty | null;
}

/**
 * Окремий хід у записі. Використовуємо плоскі поля замість вкладеної
 * `Position`, бо це простіше для серіалізації.
 */
export interface MatchMoveRecord {
  readonly row: number;
  readonly col: number;
  readonly symbol: PlayerSymbol;
  readonly madeAt: number;
}

/**
 * Виносимо генератор ID в окрему функцію: тестам зручно зробити стаб.
 */
export function buildMatchId(playedAt: number, suffix: string): string {
  return `match-${playedAt}-${suffix}`;
}
