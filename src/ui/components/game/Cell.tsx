import { memo } from "react";
import type { CellValue } from "../../../types/Symbol";
import type { Position } from "../../../types/Position";

export interface CellProps {
  readonly position: Position;
  readonly value: CellValue;
  readonly disabled: boolean;
  readonly highlighted: boolean;
  readonly winning: boolean;
  readonly onSelect: (position: Position) => void;
}

/**
 * Окрема клітинка дошки. Робимо її чистим презентаційним компонентом:
 * вона не знає, як зробити хід — лише сповіщає батька через `onSelect`.
 * Завдяки цьому `Board` лишається маленьким і легко тестуватись.
 *
 * `memo` спеціально потрібний, бо при кожному ході більшість клітинок
 * не змінюється — рендер дешевих 9-25 клітинок не критичний, але для
 * 6×6 = 36 клітинок ми вже не хочемо реакрувати без потреби.
 */
function CellInner({
  position,
  value,
  disabled,
  highlighted,
  winning,
  onSelect,
}: CellProps): JSX.Element {
  const symbolClass =
    value === "X" ? "text-cross" : value === "O" ? "text-nought" : "text-ink-muted";
  const ariaLabel = value
    ? `${position.row + 1}-${position.col + 1}: ${value}`
    : `Порожня клітинка ${position.row + 1}-${position.col + 1}`;
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled || value !== null}
      onClick={() => onSelect(position)}
      className={[
        "aspect-square rounded-xl border border-line bg-canvas-subtle",
        "flex items-center justify-center text-4xl font-semibold",
        "transition select-none",
        "focus-visible:outline-none focus-visible:shadow-focus",
        "disabled:cursor-not-allowed",
        winning ? "bg-success/15 border-success animate-pop" : "",
        !winning && highlighted ? "ring-2 ring-accent ring-inset" : "",
        value === null && !disabled ? "hover:bg-canvas" : "",
        symbolClass,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {value ? <span className="animate-pop">{value}</span> : null}
    </button>
  );
}

export const Cell = memo(CellInner);
