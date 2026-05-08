import { Game } from "../core/Game";
import type { Position } from "../types/Position";
import { CommandHistory } from "./CommandHistory";
import { MakeMoveCommand } from "./MakeMoveCommand";
import { RestartGameCommand } from "./RestartGameCommand";
import type { Command } from "./Command";

/**
 * Високорівневий фасад над `Game` + `CommandHistory`. UI взаємодіє саме з
 * ним: «зробити хід», «скасувати», «повторити», «перезапустити». Ми не
 * примушуємо UI знати ані про самі обʼєкти команд, ані про деталі
 * управління історією — це класичний приклад принципу Tell-Don't-Ask.
 *
 * Сервіс зберігає посилання на поточний `Game` всередині себе. Хоча `Game`
 * імутабельна, ми все одно тримаємо її в одному місці — інакше UI
 * довелося б опрацьовувати «нову гру» руками після кожної команди.
 */
export class GameCommandService {
  private state: Game;
  private readonly history: CommandHistory<Game>;

  public constructor(initial: Game, options: { capacity?: number } = {}) {
    this.state = initial;
    this.history = new CommandHistory<Game>(options);
  }

  /**
   * Поточна партія. Імутабельна, тому її можна спокійно віддавати назовні.
   */
  public getState(): Game {
    return this.state;
  }

  /**
   * Повертає історію — переважно для UI («історія ходів») і для тестів.
   */
  public getHistory(): CommandHistory<Game> {
    return this.history;
  }

  /**
   * Робить хід у позицію `position`. Створює команду й виконує її через
   * стек. Повертає оновлений стан гри.
   */
  public makeMove(position: Position): Game {
    const command = new MakeMoveCommand(position);
    this.state = this.history.execute(this.state, command);
    return this.state;
  }

  /**
   * Перезапускає партію. Очищує історію, бо змішування «до» і «після»
   * рестарту — погана ідея.
   */
  public restart(): Game {
    const command = new RestartGameCommand();
    const next = command.execute(this.state);
    this.history.clear();
    this.state = next;
    return this.state;
  }

  /**
   * Скасовує останню оборотну команду.
   */
  public undo(): Game {
    if (!this.history.canUndo()) return this.state;
    this.state = this.history.undo(this.state);
    return this.state;
  }

  /**
   * Повторює щойно скасовану команду.
   */
  public redo(): Game {
    if (!this.history.canRedo()) return this.state;
    this.state = this.history.redo(this.state);
    return this.state;
  }

  /**
   * Замінює поточний стан зовнішнім. Використовується при завантаженні
   * збереженої партії з localStorage. Очищує undo-стек, бо ми не маємо
   * команд, що сюди привели.
   */
  public replaceState(next: Game): void {
    this.state = next;
    this.history.clear();
  }

  /**
   * Виконує довільну команду. Точка розширення для майбутніх команд
   * (наприклад «застосувати підказку», «здатися»).
   */
  public execute(command: Command<Game>): Game {
    this.state = this.history.execute(this.state, command);
    return this.state;
  }

  public canUndo(): boolean {
    return this.history.canUndo();
  }

  public canRedo(): boolean {
    return this.history.canRedo();
  }
}
