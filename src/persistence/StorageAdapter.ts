/**
 * Узагальнений інтерфейс «місця, де зберігається сирий рядок». Це
 * дозволяє підмінити localStorage на in-memory варіант у тестах та SSR
 * без зміни вищих шарів. Усі ключі — рядкові, всі значення — рядкові
 * або відсутні.
 */
export interface StorageAdapter {
  read(key: string): string | null;
  write(key: string, value: string): void;
  remove(key: string): void;
  /**
   * Перелічує ключі, що відповідають заданому префіксу. Корисно, коли
   * репозиторій тримає набір записів за схожими ключами
   * (наприклад, `match:<id>`).
   */
  keys(prefix: string): string[];
  clearPrefix(prefix: string): void;
}
