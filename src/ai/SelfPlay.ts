import type { AIStrategy } from "./AIStrategy";
import { AIController } from "./AIController";
import type { Game } from "../core/Game";
import type { GameStatus } from "../types/GameStatus";
import { isGameOver } from "../types/GameStatus";

/**
 * Утиліта для гри AI проти AI до завершення партії. Призначена для:
 *   - тестів регресій (перевірити, що дві стратегії дають коректні
 *     результати без помилок);
 *   - демо-режиму в UI («подивитися, як грають боти»);
 *   - бенчмарків (порахувати, скільки виграє Hard проти Medium на
 *     великій кількості партій).
 *
 * Виокремлення цієї логіки в окремий файл — приклад техніки рефакторингу
 * Extract Module: код, який не належить ані до самого AI, ані до Game,
 * але потребує обох, заслуговує на свій власний дім.
 */
export class SelfPlay {
  private readonly controller: AIController;

  public constructor(controller: AIController = new AIController({ delayMs: 0 })) {
    this.controller = controller;
  }

  /**
   * Програє партію до кінця і повертає підсумковий стан. `xStrategy`
   * грає за X, `oStrategy` — за O. Якщо ходи робити нікому, метод нічого
   * не робить — це найбезпечніше за умови, що гра вже завершена.
   */
  public play(input: {
    initialGame: Game;
    xStrategy: AIStrategy;
    oStrategy: AIStrategy;
    maxPlies?: number;
  }): SelfPlayResult {
    let game = input.initialGame;
    let plies = 0;
    const maxPlies = input.maxPlies ?? input.initialGame.getBoard().totalCells * 2;
    while (!game.isOver() && plies < maxPlies) {
      const symbol = game.getCurrentSymbol();
      const strategy =
        symbol === game.getPlayerX().symbol ? input.xStrategy : input.oStrategy;
      game = this.controller.playOnce(strategy, game);
      plies += 1;
    }
    return {
      finalGame: game,
      finalStatus: game.getStatus(),
      pliesPlayed: plies,
      stoppedEarly: !isGameOver(game.getStatus()),
    };
  }
}

export interface SelfPlayResult {
  readonly finalGame: Game;
  readonly finalStatus: GameStatus;
  readonly pliesPlayed: number;
  readonly stoppedEarly: boolean;
}
