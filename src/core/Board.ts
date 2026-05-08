import type { CellValue, PlayerSymbol } from "../types/Symbol";
import type { Position } from "../types/Position";
import {
  isPositionInBounds,
  makePosition,
  positionsEqual,
} from "../types/Position";
import { Cell, makeCell } from "./Cell";
import {
  cloneMatrix,
  createMatrix,
  forEachCell,
} from "../utils/array";
import { ensure, invariant } from "../utils/assert";

/**
 * Імутабельне ігрове поле. Замість того щоб зберігати клітинки і змінювати
 * їх «на місці», кожна модифікація повертає нову Board. Це дозволяє:
 *   - дешево зберігати знімки стану (наприклад для undo/redo);
 *   - використовувати `Object.is` для порівняння у React;
 *   - бути впевненими, що алгоритми AI не псують стан гри.
 *
 * Інкапсуляція реалізується через приватні поля та публічні методи.
 */
export class Board {
  private readonly matrix: ReadonlyArray<ReadonlyArray<CellValue>>;

  private constructor(matrix: ReadonlyArray<ReadonlyArray<CellValue>>) {
    this.matrix = matrix;
  }

  /**
   * Створює пусту дошку розміру `size`.
   */
  public static empty(size: number): Board {
    invariant(size >= 1, "size must be positive");
    return new Board(createMatrix<CellValue>(size, null));
  }

  /**
   * Реконструює дошку з матриці значень. Використовується при відновленні
   * стану з localStorage або при тестуванні.
   */
  public static fromMatrix(
    matrix: ReadonlyArray<ReadonlyArray<CellValue>>,
  ): Board {
    invariant(matrix.length > 0, "matrix must not be empty");
    const expectedSize = matrix.length;
    for (const row of matrix) {
      invariant(row.length === expectedSize, "matrix must be square");
    }
    return new Board(cloneMatrix(matrix));
  }

  /**
   * Розмір сторони дошки.
   */
  public get size(): number {
    return this.matrix.length;
  }

  /**
   * Загальна кількість клітинок.
   */
  public get totalCells(): number {
    return this.size * this.size;
  }

  /**
   * Кількість зайнятих клітинок. Використовується для перевірки нічиєї
   * без додаткового підрахунку.
   */
  public get occupiedCount(): number {
    let count = 0;
    forEachCell(this.matrix, (value) => {
      if (value !== null) count += 1;
    });
    return count;
  }

  /**
   * Кількість вільних клітинок.
   */
  public get freeCount(): number {
    return this.totalCells - this.occupiedCount;
  }

  /**
   * Повертає значення клітинки за позицією.
   */
  public valueAt(position: Position): CellValue {
    ensure(
      isPositionInBounds(position, this.size),
      `position ${position.row},${position.col} is out of bounds`,
    );
    return this.matrix[position.row][position.col];
  }

  /**
   * Чи клітинка вільна.
   */
  public isEmpty(position: Position): boolean {
    return this.valueAt(position) === null;
  }

  /**
   * Чи клітинка зайнята конкретним символом.
   */
  public isOccupiedBy(position: Position, symbol: PlayerSymbol): boolean {
    return this.valueAt(position) === symbol;
  }

  /**
   * Чи поле повністю заповнене.
   */
  public isFull(): boolean {
    return this.freeCount === 0;
  }

  /**
   * Чи поле порожнє (потрібно для AI першого ходу: на пустій дошці
   * можна одразу обрати центр без minimax).
   */
  public isEmpty_(): boolean {
    return this.occupiedCount === 0;
  }

  /**
   * Повертає всі позиції, які зараз вільні. Використовується AI для
   * генерації списку доступних ходів.
   */
  public emptyPositions(): Position[] {
    const positions: Position[] = [];
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) {
        if (this.matrix[row][col] === null) {
          positions.push(makePosition(row, col));
        }
      }
    }
    return positions;
  }

  /**
   * Повертає всі позиції, зайняті конкретним символом.
   */
  public positionsOf(symbol: PlayerSymbol): Position[] {
    const positions: Position[] = [];
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) {
        if (this.matrix[row][col] === symbol) {
          positions.push(makePosition(row, col));
        }
      }
    }
    return positions;
  }

  /**
   * Повертає копію матриці значень. Корисно для серіалізації.
   */
  public toMatrix(): CellValue[][] {
    return cloneMatrix(this.matrix);
  }

  /**
   * Повертає всі клітинки у вигляді списку (зручно для рендеру у React).
   */
  public toCells(): Cell[] {
    const cells: Cell[] = [];
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) {
        cells.push(makeCell(makePosition(row, col), this.matrix[row][col]));
      }
    }
    return cells;
  }

  /**
   * Створює нову дошку, де клітинка `position` має значення `value`.
   * Кидає помилку, якщо клітинка вже зайнята — це гарантує консистентність.
   */
  public withMove(position: Position, value: PlayerSymbol): Board {
    ensure(
      isPositionInBounds(position, this.size),
      `position ${position.row},${position.col} is out of bounds`,
    );
    ensure(this.isEmpty(position), `cell ${position.row},${position.col} is already taken`);
    const next = cloneMatrix(this.matrix);
    next[position.row][position.col] = value;
    return new Board(next);
  }

  /**
   * Створює нову дошку із зміненою клітинкою без перевірок (useful for AI
   * simulation, де ми вже впевнені, що хід валідний). Зробили окремий метод,
   * аби семантика withMove залишалася суворою.
   */
  public unsafeWithValue(position: Position, value: CellValue): Board {
    const next = cloneMatrix(this.matrix);
    next[position.row][position.col] = value;
    return new Board(next);
  }

  /**
   * Перевіряє, чи дошка зараз така сама, як інша. Корисно у тестах.
   */
  public equals(other: Board): boolean {
    if (this.size !== other.size) return false;
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) {
        if (this.matrix[row][col] !== other.matrix[row][col]) return false;
      }
    }
    return true;
  }

  /**
   * Повертає текстове представлення для дебагу і логів. Кожен ряд — на
   * окремому рядку, порожні клітинки — крапка.
   */
  public toString(): string {
    return this.matrix
      .map((row) => row.map((value) => value ?? ".").join(" "))
      .join("\n");
  }

  /**
   * Допоміжний хелпер: повертає Board, де додатково зайнято передані позиції
   * певним символом. Не змінює існуючу. Використовується тестами і AI.
   */
  public withMovesOf(
    symbol: PlayerSymbol,
    positions: ReadonlyArray<Position>,
  ): Board {
    return positions.reduce<Board>(
      (acc, position) => acc.withMove(position, symbol),
      this,
    );
  }

  /**
   * Знаходить позицію центру (для квадратних дошок з непарним розміром
   * вона єдина; для парних — повертає одну з чотирьох близьких до центру).
   * Зручно для AI, який часто хоче починати з центру.
   */
  public centerPosition(): Position {
    const center = Math.floor(this.size / 2);
    return makePosition(center, center);
  }

  /**
   * Чи задана позиція є кутовою? AI часто хоче закрити кут після центру.
   */
  public isCornerPosition(position: Position): boolean {
    const last = this.size - 1;
    const corners: Position[] = [
      makePosition(0, 0),
      makePosition(0, last),
      makePosition(last, 0),
      makePosition(last, last),
    ];
    return corners.some((corner) => positionsEqual(corner, position));
  }
}
