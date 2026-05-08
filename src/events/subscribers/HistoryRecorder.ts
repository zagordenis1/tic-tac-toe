import type { Move } from "../../core/Move";
import type { GameStatus } from "../../types/GameStatus";
import type { EventBus, Unsubscribe } from "../EventBus";
import type { GameEventMap } from "../GameEvents";

/**
 * Запис партії: послідовність ходів + результат. Підписник пасивно
 * накопичує події в памʼяті. Потім результат можна передати в сховище
 * (Repository) або експортувати у JSON.
 */
export interface RecordedGame {
  readonly startedAt: number;
  readonly finishedAt: number | null;
  readonly moves: ReadonlyArray<Move>;
  readonly status: GameStatus;
}

/**
 * Підписник, який слухає шину і збирає статистику поточної партії.
 * Працює лише в межах одного «сеансу» — на `game:restarted` обнулює
 * запис, а не накладається.
 */
export class HistoryRecorder {
  private moves: Move[] = [];
  private startedAt: number;
  private finishedAt: number | null = null;
  private status: GameStatus | null = null;
  private readonly unsubscribe: Unsubscribe;

  public constructor(bus: EventBus<GameEventMap>) {
    this.startedAt = Date.now();
    const offMove = bus.on("game:moveMade", ({ move }) => {
      this.moves = [...this.moves, move];
    });
    const offStart = bus.on("game:started", ({ game }) => {
      this.moves = [...game.getMoves()];
      this.startedAt = game.getStartedAt();
      this.finishedAt = null;
      this.status = game.getStatus();
    });
    const offRestart = bus.on("game:restarted", ({ game }) => {
      this.moves = [];
      this.startedAt = game.getStartedAt();
      this.finishedAt = null;
      this.status = game.getStatus();
    });
    const offEnd = bus.on("game:ended", ({ game, status }) => {
      this.finishedAt = game.getFinishedAt();
      this.status = status;
    });
    this.unsubscribe = () => {
      offMove();
      offStart();
      offRestart();
      offEnd();
    };
  }

  public snapshot(): RecordedGame {
    return {
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      moves: [...this.moves],
      status: this.status ?? { kind: "in_progress" },
    };
  }

  public dispose(): void {
    this.unsubscribe();
  }
}
