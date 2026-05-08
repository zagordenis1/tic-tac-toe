import { useCallback, useMemo } from "react";
import type { Game } from "../../../core/Game";
import type { Position } from "../../../types/Position";
import { isWin } from "../../../types/GameStatus";
import { Cell } from "./Cell";

export interface BoardProps {
  readonly game: Game;
  readonly disabled: boolean;
  readonly onSelect: (position: Position) => void;
  readonly highlightLastMove: boolean;
}

/**
 * Сітка клітинок. Розраховує параметри сітки на основі фактичного
 * розміру дошки і не залежить від конфігурації Tailwind за межами
 * базового набору утиліт. Так ми не плодимо `grid-cols-3` ... `grid-cols-6`
 * вручну.
 */
export function Board({
  game,
  disabled,
  onSelect,
  highlightLastMove,
}: BoardProps): JSX.Element {
  const board = game.getBoard();
  const status = game.getStatus();
  const size = board.size;
  const cells = useMemo(() => board.toCells(), [board]);
  const moves = game.getMoves();
  const lastMove = moves.length > 0 ? moves[moves.length - 1] : null;
  const winningSet = useMemo(() => {
    if (!isWin(status)) return new Set<string>();
    return new Set(status.winningLine.map((p) => `${p.row}:${p.col}`));
  }, [status]);
  const handleSelect = useCallback(
    (position: Position) => {
      if (disabled) return;
      onSelect(position);
    },
    [disabled, onSelect],
  );
  return (
    <div
      role="grid"
      aria-label={`Ігрове поле ${size} на ${size}`}
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {cells.map((cell) => {
        const key = `${cell.position.row}:${cell.position.col}`;
        const isLast =
          highlightLastMove && lastMove !== null
            ? lastMove.position.row === cell.position.row &&
              lastMove.position.col === cell.position.col
            : false;
        return (
          <Cell
            key={key}
            position={cell.position}
            value={cell.value}
            disabled={disabled}
            highlighted={isLast}
            winning={winningSet.has(key)}
            onSelect={handleSelect}
          />
        );
      })}
    </div>
  );
}
