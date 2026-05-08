import type { Command } from "./Command";
import { Game } from "../core/Game";
import type { Position } from "../types/Position";
import { ensure } from "../utils/assert";

/**
 * Команда «зробити хід». Найважливіша команда нашого застосунку: вона
 * інкапсулює одну спробу гравця або AI поставити свій символ. Зберігає
 * усе, що потрібно для скасування — старий стан гри.
 *
 * У нас і так імутабельна `Game`, тому реалізація undo тривіальна:
 * просто повертаємо попередній обʼєкт. Але цінність патерна Command не
 * лише в undo — вона ще й у тому, що ми можемо зберігати такі обʼєкти
 * в reproducer-і для відтворення партії або в логах для аналітики.
 */
export class MakeMoveCommand implements Command<Game> {
  public readonly name = "MakeMove";
  public readonly reversible = true;
  public readonly position: Position;

  private snapshotBefore: Game | null = null;

  public constructor(position: Position) {
    this.position = position;
  }

  public execute(state: Game): Game {
    ensure(!state.isOver(), "MakeMoveCommand: гра вже закінчена");
    this.snapshotBefore = state;
    return state.move(this.position);
  }

  public undo(_state: Game): Game {
    ensure(
      this.snapshotBefore !== null,
      "MakeMoveCommand: не можна скасувати команду, яка не виконувалася",
    );
    return this.snapshotBefore;
  }

  /**
   * Цей метод корисний для серіалізації історії: ми зберігаємо лише позиції,
   * а не цілі обʼєкти Game.
   */
  public toJSON(): { name: string; position: Position } {
    return { name: this.name, position: this.position };
  }
}
