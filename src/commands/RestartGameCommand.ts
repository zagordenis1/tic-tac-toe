import type { Command } from "./Command";
import { Game } from "../core/Game";

/**
 * Команда «перезапустити партію». Зберігає попередній знімок і використовує
 * `Game.restart()` для очищення дошки. Технічно ми могли б створити нову
 * партію через `Game.start(...)`, але `restart` зберігає налаштування
 * гравців і розміру — користувач не очікує, що його налаштування зникнуть.
 *
 * Цю команду ми позначаємо як reversible, але насправді в UI ми зазвичай
 * чистимо історію команд після рестарту, бо змішування «до» і «після»
 * перезапуску в одному стеку — погана ідея.
 */
export class RestartGameCommand implements Command<Game> {
  public readonly name = "RestartGame";
  public readonly reversible = true;

  private snapshotBefore: Game | null = null;

  public execute(state: Game): Game {
    this.snapshotBefore = state;
    return state.restart();
  }

  public undo(_state: Game): Game {
    if (this.snapshotBefore === null) return _state;
    return this.snapshotBefore;
  }
}
