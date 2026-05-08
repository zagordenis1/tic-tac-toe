import type { AnyEventObserver } from "../EventBus";
import type { GameEventMap } from "../GameEvents";

/**
 * Спостерігач, що виводить кожну подію в консоль. Використовується
 * під час розробки і для діагностики у тестах. У продакшні його не
 * вмикаємо, щоб не засмічувати DevTools.
 */
export class ConsoleLoggerSubscriber implements AnyEventObserver<GameEventMap> {
  private readonly tag: string;

  public constructor(tag: string = "TTT") {
    this.tag = tag;
  }

  public observe<K extends keyof GameEventMap>(
    event: K,
    payload: GameEventMap[K],
  ): void {
    // eslint-disable-next-line no-console
    console.info(`[${this.tag}] ${String(event)}`, payload);
  }
}
