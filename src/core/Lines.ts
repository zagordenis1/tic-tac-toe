import type { Position } from "../types/Position";
import { makePosition } from "../types/Position";

/**
 * Виокремлене обчислення «ліній» — рядків, колонок і діагоналей фіксованої
 * довжини. Колись це було усередині WinChecker, але геометричні обчислення
 * краще ізолювати: ту ж логіку використовує BoardEvaluator для оцінки
 * розташування символів (Refactoring: Extract Module).
 */
export interface Line {
  readonly positions: ReadonlyArray<Position>;
}

/**
 * Повертає всі лінії довжини `windowLength` на дошці розміру `size`. Лінії
 * включають усі повні рядки, колонки і діагоналі обох напрямків.
 */
export function generateLines(size: number, windowLength: number): Line[] {
  const lines: Line[] = [];
  collectRows(size, windowLength, lines);
  collectColumns(size, windowLength, lines);
  collectDiagonals(size, windowLength, lines);
  collectAntiDiagonals(size, windowLength, lines);
  return lines;
}

function collectRows(size: number, windowLength: number, lines: Line[]): void {
  for (let row = 0; row < size; row += 1) {
    for (let startCol = 0; startCol + windowLength <= size; startCol += 1) {
      const positions: Position[] = [];
      for (let offset = 0; offset < windowLength; offset += 1) {
        positions.push(makePosition(row, startCol + offset));
      }
      lines.push({ positions });
    }
  }
}

function collectColumns(
  size: number,
  windowLength: number,
  lines: Line[],
): void {
  for (let col = 0; col < size; col += 1) {
    for (let startRow = 0; startRow + windowLength <= size; startRow += 1) {
      const positions: Position[] = [];
      for (let offset = 0; offset < windowLength; offset += 1) {
        positions.push(makePosition(startRow + offset, col));
      }
      lines.push({ positions });
    }
  }
}

function collectDiagonals(
  size: number,
  windowLength: number,
  lines: Line[],
): void {
  for (let row = 0; row + windowLength <= size; row += 1) {
    for (let col = 0; col + windowLength <= size; col += 1) {
      const positions: Position[] = [];
      for (let offset = 0; offset < windowLength; offset += 1) {
        positions.push(makePosition(row + offset, col + offset));
      }
      lines.push({ positions });
    }
  }
}

function collectAntiDiagonals(
  size: number,
  windowLength: number,
  lines: Line[],
): void {
  for (let row = 0; row + windowLength <= size; row += 1) {
    for (let col = windowLength - 1; col < size; col += 1) {
      const positions: Position[] = [];
      for (let offset = 0; offset < windowLength; offset += 1) {
        positions.push(makePosition(row + offset, col - offset));
      }
      lines.push({ positions });
    }
  }
}
