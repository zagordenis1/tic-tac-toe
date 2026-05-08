import { GameMode } from "../types/GameMode";
import { PlayerSymbol } from "../types/Symbol";
import { Game } from "./Game";
import { type GameConfig, validateGameConfig } from "./GameConfig";
import { makePlayer } from "./Player";
import { generateId } from "../utils/generateId";

/**
 * Реалізація патерну Factory. UI створює лише `GameConfig`, а як саме
 * перетворити цю конфігурацію в готову `Game` (із заповненими гравцями,
 * фабриками AI тощо) — справа фабрики. Це дозволяє нам змінювати
 * принципи створення гри (наприклад, додати новий режим), не торкаючись
 * викликаючого коду.
 */
export class GameFactory {
  /**
   * Створює нову партію за конфігурацією.
   */
  public static create(rawConfig: GameConfig): Game {
    const config = validateGameConfig(rawConfig);
    const playerX = makePlayer({
      id: generateId("player"),
      name: config.playerXName,
      symbol: PlayerSymbol.X,
      isComputer:
        config.mode === GameMode.PlayerVsComputer &&
        config.aiSymbol === PlayerSymbol.X,
      difficulty:
        config.mode === GameMode.PlayerVsComputer &&
        config.aiSymbol === PlayerSymbol.X
          ? config.aiDifficulty
          : null,
    });
    const playerO = makePlayer({
      id: generateId("player"),
      name: config.playerOName,
      symbol: PlayerSymbol.O,
      isComputer:
        config.mode === GameMode.PlayerVsComputer &&
        config.aiSymbol === PlayerSymbol.O,
      difficulty:
        config.mode === GameMode.PlayerVsComputer &&
        config.aiSymbol === PlayerSymbol.O
          ? config.aiDifficulty
          : null,
    });
    return Game.start({
      boardSize: config.boardSize,
      winLength: config.winLength,
      firstSymbol: config.firstSymbol,
      playerX,
      playerO,
    });
  }
}
