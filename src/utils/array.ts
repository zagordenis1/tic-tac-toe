/**
 * Утиліти для роботи з матрицями. Більшість логіки гри (Board, WinChecker,
 * BoardEvaluator) активно оперує двовимірними масивами, тому виокремлюємо
 * повторювані операції в окремий модуль — це принцип DRY на практиці.
 */

/**
 * Створює квадратну матрицю заданого розміру, заповнену значенням
 * fillValue. Замість безпосередніх викликів `Array.from(...).fill(...)`
 * у різних місцях коду ми використовуємо це гарне ім'я.
 */
export function createMatrix<T>(size: number, fillValue: T): T[][] {
  const matrix: T[][] = [];
  for (let row = 0; row < size; row += 1) {
    const rowItems: T[] = [];
    for (let col = 0; col < size; col += 1) {
      rowItems.push(fillValue);
    }
    matrix.push(rowItems);
  }
  return matrix;
}

/**
 * Повертає глибоку копію матриці. Глибока — у сенсі двох рівнів, чого
 * достатньо, бо в нашому випадку клітинка містить примітивне значення
 * (`PlayerSymbol | null`).
 */
export function cloneMatrix<T>(matrix: ReadonlyArray<ReadonlyArray<T>>): T[][] {
  return matrix.map((row) => row.slice());
}

/**
 * Обходить кожну клітинку матриці й передає row/col у callback. Завдяки
 * цій функції ми не повторюємо подвійні цикли в десятках місць.
 */
export function forEachCell<T>(
  matrix: ReadonlyArray<ReadonlyArray<T>>,
  callback: (value: T, row: number, col: number) => void,
): void {
  for (let row = 0; row < matrix.length; row += 1) {
    const currentRow = matrix[row];
    for (let col = 0; col < currentRow.length; col += 1) {
      callback(currentRow[col], row, col);
    }
  }
}

/**
 * Повертає всі рядки матриці у вигляді масиву масивів. Здається тривіальним,
 * але у комбінації з columns/diagonals/antiDiagonals дає однорідний API
 * для пошуку виграшних ліній.
 */
export function rows<T>(matrix: ReadonlyArray<ReadonlyArray<T>>): T[][] {
  return matrix.map((row) => row.slice());
}

/**
 * Повертає колонки матриці. Замість того щоб писати окрему перевірку для
 * вертикальних виграшних ліній, ми використовуємо ту саму функцію, що й
 * для рядків, але на «транспонованій» матриці.
 */
export function columns<T>(matrix: ReadonlyArray<ReadonlyArray<T>>): T[][] {
  if (matrix.length === 0) return [];
  const size = matrix.length;
  const result: T[][] = [];
  for (let col = 0; col < matrix[0].length; col += 1) {
    const column: T[] = [];
    for (let row = 0; row < size; row += 1) {
      column.push(matrix[row][col]);
    }
    result.push(column);
  }
  return result;
}

/**
 * Повертає всі ліві діагоналі (top-left → bottom-right) довжиною не менш як
 * `minLength`. Це необхідно для дошок 4х4, 5х5, де виграшною може бути
 * лише головна діагональ або діагональ, що проходить через певну точку.
 */
export function diagonals<T>(
  matrix: ReadonlyArray<ReadonlyArray<T>>,
  minLength = 1,
): T[][] {
  const size = matrix.length;
  const result: T[][] = [];
  for (let startCol = 0; startCol < size; startCol += 1) {
    result.push(collectDiagonal(matrix, 0, startCol, 1, 1));
  }
  for (let startRow = 1; startRow < size; startRow += 1) {
    result.push(collectDiagonal(matrix, startRow, 0, 1, 1));
  }
  return result.filter((diag) => diag.length >= minLength);
}

/**
 * Симетричний випадок — антидіагоналі (top-right → bottom-left).
 */
export function antiDiagonals<T>(
  matrix: ReadonlyArray<ReadonlyArray<T>>,
  minLength = 1,
): T[][] {
  const size = matrix.length;
  const result: T[][] = [];
  for (let startCol = size - 1; startCol >= 0; startCol -= 1) {
    result.push(collectDiagonal(matrix, 0, startCol, 1, -1));
  }
  for (let startRow = 1; startRow < size; startRow += 1) {
    result.push(collectDiagonal(matrix, startRow, size - 1, 1, -1));
  }
  return result.filter((diag) => diag.length >= minLength);
}

/**
 * Внутрішня допоміжна функція. Експортуємо тільки `diagonals` і
 * `antiDiagonals`, бо вони задають семантично прозорі контракти.
 */
function collectDiagonal<T>(
  matrix: ReadonlyArray<ReadonlyArray<T>>,
  startRow: number,
  startCol: number,
  rowStep: number,
  colStep: number,
): T[] {
  const result: T[] = [];
  let row = startRow;
  let col = startCol;
  while (
    row >= 0 &&
    row < matrix.length &&
    col >= 0 &&
    col < matrix[0].length
  ) {
    result.push(matrix[row][col]);
    row += rowStep;
    col += colStep;
  }
  return result;
}

/**
 * Чи всі елементи масиву рівні між собою та відмінні від `null`/`undefined`?
 * Стандартний хелпер для перевірки виграшної комбінації.
 */
export function allEqualNonEmpty<T>(values: ReadonlyArray<T>): boolean {
  if (values.length === 0) return false;
  const first = values[0];
  if (first === null || first === undefined) return false;
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] !== first) return false;
  }
  return true;
}

/**
 * Розбиває масив на «вікна» довжиною windowSize. Аналог Python's
 * `more_itertools.windowed`. Знадобиться для перевірки 5-в-ряд на
 * нестандартних дошках.
 */
export function slidingWindows<T>(
  values: ReadonlyArray<T>,
  windowSize: number,
): T[][] {
  if (windowSize <= 0 || values.length < windowSize) return [];
  const windows: T[][] = [];
  for (let start = 0; start <= values.length - windowSize; start += 1) {
    windows.push(values.slice(start, start + windowSize));
  }
  return windows;
}

/**
 * Перемішує масив за алгоритмом Фішера-Єйтса. Використовуємо в RandomStrategy
 * для рівномірного вибору ходу серед доступних.
 */
export function shuffle<T>(values: ReadonlyArray<T>): T[] {
  const result = values.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
