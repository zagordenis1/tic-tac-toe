import type { CellValue } from "../types/Symbol";
import type { Position } from "../types/Position";

/**
 * Клітинка ігрового поля. Тримаємо її як структуру з полем `position` та
 * `value`, щоб у будь-якому місці коду було видно і координату, і
 * значення без додаткових пошуків.
 *
 * Незмінність полів важлива: будь-яка зміна стану повинна породжувати
 * нову клітинку. Це робить систему передбачуваною й полегшує
 * undo/redo (див. /commands).
 */
export interface Cell {
  readonly position: Position;
  readonly value: CellValue;
}

/**
 * Створює нову клітинку. Винесено в фабричну функцію, щоб уникнути
 * дублювання літералів `{ position, value }` по всьому коду.
 */
export function makeCell(position: Position, value: CellValue): Cell {
  return { position, value };
}

/**
 * Чи клітинка вільна. Маленька абстракція, але ім'я говорить за себе:
 * замість `cell.value === null` ми пишемо `isEmptyCell(cell)`, що читається
 * як англійське речення (Programming Principle: Self-Documenting Code).
 */
export function isEmptyCell(cell: Cell): boolean {
  return cell.value === null;
}

/**
 * Зворотна перевірка — клітинка зайнята.
 */
export function isOccupiedCell(cell: Cell): boolean {
  return cell.value !== null;
}
