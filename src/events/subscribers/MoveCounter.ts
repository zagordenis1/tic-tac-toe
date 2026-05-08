import type { EventBus, Unsubscribe } from "../EventBus";
import type { GameEventMap } from "../GameEvents";

/**
 * Лічильник ходів окремо по X та O. Підписується на `game:moveMade`
 * та `game:restarted`. Використовується статистичним модулем і UI-
 * панеллю «інформація про партію».
 *
 * Реалізує принцип Single Responsibility: знає лише про кількість
 * ходів, нічого більше.
 */
export class MoveCounter {
  private xMoves = 0;
  private oMoves = 0;
  private total = 0;
  private readonly unsubscribe: Unsubscribe;

  public constructor(bus: EventBus<GameEventMap>) {
    const offMove = bus.on("game:moveMade", ({ move }) => {
      this.total += 1;
      if (move.symbol === "X") {
        this.xMoves += 1;
      } else {
        this.oMoves += 1;
      }
    });
    const offRestart = bus.on("game:restarted", () => {
      this.reset();
    });
    const offStart = bus.on("game:started", ({ game }) => {
      this.reset();
      for (const move of game.getMoves()) {
        this.total += 1;
        if (move.symbol === "X") {
          this.xMoves += 1;
        } else {
          this.oMoves += 1;
        }
      }
    });
    this.unsubscribe = () => {
      offMove();
      offRestart();
      offStart();
    };
  }

  public getXMoves(): number {
    return this.xMoves;
  }

  public getOMoves(): number {
    return this.oMoves;
  }

  public getTotal(): number {
    return this.total;
  }

  public dispose(): void {
    this.unsubscribe();
  }

  private reset(): void {
    this.xMoves = 0;
    this.oMoves = 0;
    this.total = 0;
  }
}
