import type { PlayerSymbol } from "../types/Symbol";
import type { Position } from "../types/Position";

/**
 * Запис про один хід. Використовується в історії ходів, undo/redo, у
 * статистиці і при відтворенні гри з логу.
 */
export interface Move {
  readonly position: Position;
  readonly symbol: PlayerSymbol;
  readonly madeAt: number;
}

export function makeMove(
  position: Position,
  symbol: PlayerSymbol,
  madeAt: number = Date.now(),
): Move {
  return { position, symbol, madeAt };
}
