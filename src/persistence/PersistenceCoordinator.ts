import type { EventBus } from "../events/EventBus";
import type { GameEventMap } from "../events/GameEvents";
import type { Game } from "../core/Game";
import type { MatchRepository } from "./repositories/MatchRepository";
import type { SaveSlotRepository } from "./repositories/SaveSlotRepository";
import { MatchRecordMapper } from "./mappers/MatchRecordMapper";
import { SaveSlotMapper } from "./mappers/SaveSlotMapper";

/**
 * Координатор збереження. Підписується на ігрові події і:
 *   - оновлює слот «активна партія» після кожної зміни стану;
 *   - вкладає завершену партію в історію (`MatchRepository`);
 *   - стирає слот, коли партію перезапущено або вона завершилась.
 *
 * Координатор знає лише про репозиторії та `EventBus` — він не лізе
 * у домен. Дякуючи цьому ми додаємо/прибираємо «авто-збереження» однією
 * лінією у точці запуску застосунку, не редагуючи `GameCommandService`.
 */
export class PersistenceCoordinator {
  private readonly bus: EventBus<GameEventMap>;
  private readonly matches: MatchRepository;
  private readonly slots: SaveSlotRepository;
  private readonly slotMapper: SaveSlotMapper;
  private readonly matchMapper: MatchRecordMapper;
  private readonly slotName: string;
  private autosaveEnabled: boolean;
  private unsubscribe: (() => void) | null;

  public constructor(input: {
    bus: EventBus<GameEventMap>;
    matches: MatchRepository;
    slots: SaveSlotRepository;
    slotName?: string;
    autosaveEnabled?: boolean;
  }) {
    this.bus = input.bus;
    this.matches = input.matches;
    this.slots = input.slots;
    this.slotMapper = new SaveSlotMapper();
    this.matchMapper = new MatchRecordMapper();
    this.slotName = input.slotName ?? "default";
    this.autosaveEnabled = input.autosaveEnabled ?? true;
    this.unsubscribe = null;
  }

  /**
   * Активує підписки. Можна викликати кілька разів — повторні
   * виклики є no-op.
   */
  public start(): void {
    if (this.unsubscribe) return;
    const offMove = this.bus.on("game:moveMade", ({ game }) =>
      this.onStateProgress(game),
    );
    const offUndo = this.bus.on("game:undo", ({ game }) =>
      this.onStateProgress(game),
    );
    const offRedo = this.bus.on("game:redo", ({ game }) =>
      this.onStateProgress(game),
    );
    const offStarted = this.bus.on("game:started", ({ game }) =>
      this.onStateProgress(game),
    );
    const offEnded = this.bus.on("game:ended", ({ game }) =>
      this.onMatchEnded(game),
    );
    const offRestarted = this.bus.on("game:restarted", () => this.clearSlot());
    this.unsubscribe = () => {
      offMove();
      offUndo();
      offRedo();
      offStarted();
      offEnded();
      offRestarted();
    };
  }

  /**
   * Деактивує підписки. Корисно у тестах та при свопі ігрової сесії.
   */
  public stop(): void {
    if (!this.unsubscribe) return;
    this.unsubscribe();
    this.unsubscribe = null;
  }

  public setAutosaveEnabled(enabled: boolean): void {
    this.autosaveEnabled = enabled;
    if (!enabled) {
      this.clearSlot();
    }
  }

  public isAutosaveEnabled(): boolean {
    return this.autosaveEnabled;
  }

  /**
   * Швидкий ручний save — UI може викликати при паузі або перед
   * закриттям вкладки.
   */
  public saveNow(game: Game): void {
    if (!this.autosaveEnabled) return;
    if (game.isOver()) {
      this.clearSlot();
      return;
    }
    this.slots.save(this.slotMapper.toSlot(this.slotName, game));
  }

  private onStateProgress(game: Game): void {
    if (!this.autosaveEnabled) return;
    if (game.isOver()) {
      // Завершена партія не повинна лишатися в слоті — її обробить
      // `onMatchEnded`.
      return;
    }
    if (game.getMoves().length === 0) {
      this.clearSlot();
      return;
    }
    this.slots.save(this.slotMapper.toSlot(this.slotName, game));
  }

  private onMatchEnded(game: Game): void {
    this.clearSlot();
    const record = this.matchMapper.toRecord(game);
    this.matches.save(record);
  }

  private clearSlot(): void {
    if (this.slots.hasSavedGame()) {
      this.slots.clear();
    }
  }
}
