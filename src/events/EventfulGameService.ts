import type { Game } from "../core/Game";
import { GameCommandService } from "../commands/GameCommandService";
import type { Position } from "../types/Position";
import { GameStatuses } from "../types/GameStatus";
import { ValidationError } from "../utils/assert";
import { EventBus } from "./EventBus";
import type { GameEventMap } from "./GameEvents";

/**
 * Декоратор поверх `GameCommandService`, який публікує події через
 * `EventBus`. Підхід «декоратор + ін'єкція шини» дозволяє:
 *
 *   1. лишати ядро (Command/CommandService) повністю чистим від
 *      підписок та сторонніх ефектів;
 *   2. підмінити шину в тестах на легку моковану реалізацію;
 *   3. підключити до тих самих подій багатьох спостерігачів — UI,
 *      статистику, логер, аналітику — без зміни ядра.
 *
 * Усі помилки під час `makeMove` (наприклад, нелегальний хід)
 * перетворюються на подію `game:moveRejected` замість необробленого
 * winaty: UI таким чином може елегантно показати повідомлення.
 */
export class EventfulGameService {
  private readonly inner: GameCommandService;
  private readonly bus: EventBus<GameEventMap>;

  public constructor(inner: GameCommandService, bus: EventBus<GameEventMap>) {
    this.inner = inner;
    this.bus = bus;
  }

  /**
   * Поточна партія.
   */
  public getState(): Game {
    return this.inner.getState();
  }

  /**
   * Анонсує стартовий стан партії підписникам. Викликається UI один
   * раз після ініціалізації, бо конструктор ще не має активних
   * підписок.
   */
  public announceStart(): void {
    this.bus.emit("game:started", { game: this.inner.getState() });
    this.emitHistoryChanged();
  }

  /**
   * Робить хід та публікує події. Якщо хід нелегальний — кидає
   * `ValidationError` далі, але паралельно публікує
   * `game:moveRejected`, щоб UI міг відреагувати.
   */
  public makeMove(position: Position): Game {
    let next: Game;
    try {
      next = this.inner.makeMove(position);
    } catch (error) {
      if (error instanceof ValidationError) {
        this.bus.emit("game:moveRejected", {
          game: this.inner.getState(),
          reason: error.message,
        });
      }
      throw error;
    }
    const lastMove = next.getMoves()[next.getMoves().length - 1];
    this.bus.emit("game:moveMade", { game: next, move: lastMove });
    this.emitHistoryChanged();
    if (next.isOver()) {
      this.bus.emit("game:ended", { game: next, status: next.getStatus() });
    }
    return next;
  }

  /**
   * Скасовує останній хід.
   */
  public undo(): Game {
    if (!this.inner.canUndo()) return this.inner.getState();
    const wasOver = this.inner.getState().isOver();
    const next = this.inner.undo();
    this.bus.emit("game:undo", { game: next });
    this.emitHistoryChanged();
    if (wasOver && !next.isOver()) {
      // Скасування фінального ходу: вертаємо UI до стану «триває».
      this.bus.emit("game:started", { game: next });
    }
    return next;
  }

  /**
   * Повертає скасовану команду.
   */
  public redo(): Game {
    if (!this.inner.canRedo()) return this.inner.getState();
    const next = this.inner.redo();
    this.bus.emit("game:redo", { game: next });
    this.emitHistoryChanged();
    if (next.isOver()) {
      this.bus.emit("game:ended", { game: next, status: next.getStatus() });
    }
    return next;
  }

  /**
   * Перезапускає гру та анонсує підписникам.
   */
  public restart(): Game {
    const next = this.inner.restart();
    this.bus.emit("game:restarted", { game: next });
    this.emitHistoryChanged();
    return next;
  }

  /**
   * Завантажує зовнішній стан (наприклад, після перезавантаження
   * сторінки). Завжди емітимо `game:started` як full-sync сигнал —
   * підписники (`MoveCounter`, `HistoryRecorder`) реагують на нього
   * методом `syncFromGame`, тому всі поля гарантовано актуальні. Якщо
   * стан відразу фінальний, додатково публікуємо `game:ended`, щоб UI
   * не довелося повторно перевіряти статус.
   */
  public replaceState(next: Game): void {
    this.inner.replaceState(next);
    this.bus.emit("game:started", { game: next });
    if (next.isOver()) {
      this.bus.emit("game:ended", { game: next, status: next.getStatus() });
    }
    this.emitHistoryChanged();
  }

  public canUndo(): boolean {
    return this.inner.canUndo();
  }

  public canRedo(): boolean {
    return this.inner.canRedo();
  }

  public getBus(): EventBus<GameEventMap> {
    return this.bus;
  }

  /**
   * Вузький допоміжний метод: чи фінальний статус — нічия. Винесено,
   * щоб у тестах було простіше перевірити стан без імпорту
   * `GameStatuses`.
   */
  public isDraw(): boolean {
    return this.inner.getState().getStatus().kind === GameStatuses.draw().kind;
  }

  private emitHistoryChanged(): void {
    const history = this.inner.getHistory();
    this.bus.emit("history:changed", {
      canUndo: this.inner.canUndo(),
      canRedo: this.inner.canRedo(),
      pastSize: history.pastSize,
      futureSize: history.futureSize,
    });
  }
}
