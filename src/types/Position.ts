/**
 * Координата на ігровому полі. Поля `row` та `col` використовуються
 * скрізь — від UI до AI — тож ми тримаємо їх в одному незмінному місці,
 * щоб уникнути плутанини між (row, col) та (col, row).
 */
export interface Position {
  readonly row: number;
  readonly col: number;
}

/**
 * Створює нову позицію. Обгортка зручна для уніфікованого створення
 * об'єктів, якщо в майбутньому додамо валідацію.
 */
export function makePosition(row: number, col: number): Position {
  return { row, col };
}

/**
 * Дві позиції вважаються рівними, якщо співпадають їх координати. Без цієї
 * утиліти багато місць у коді доводилось би писати `a.row === b.row && ...`,
 * що порушує принцип DRY.
 */
export function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

/**
 * Конвертує позицію в плоский індекс (row-major). Знадобиться, коли ми
 * захочемо представити клітинки одновимірним масивом — наприклад, при
 * серіалізації стану в JSON.
 */
export function positionToIndex(position: Position, size: number): number {
  return position.row * size + position.col;
}

/**
 * Зворотна операція: за плоским індексом і розміром поля повертає позицію.
 */
export function indexToPosition(index: number, size: number): Position {
  return makePosition(Math.floor(index / size), index % size);
}

/**
 * Перевіряє, чи позиція знаходиться всередині поля заданого розміру.
 * Використовуємо це і в логіці гри (заборона ходу за межі поля), і в AI
 * (наприклад при оцінюванні діагоналей).
 */
export function isPositionInBounds(position: Position, size: number): boolean {
  return (
    position.row >= 0 &&
    position.row < size &&
    position.col >= 0 &&
    position.col < size
  );
}
