import { Game } from "../../core/Game";
import { makePlayer } from "../../core/Player";
import type { Player } from "../../core/Player";
import type { SaveSlot, SaveSlotParticipant } from "../SaveSlot";

/**
 * Перетворення `Game ↔ SaveSlot`. Винесли в окремий модуль, бо це
 * технічна деталь шару збереження, а домен (`Game`) має лишатись
 * чистим — без зайвих знань про формат localStorage.
 */
export class SaveSlotMapper {
  /**
   * Серіалізує гру у слот, готовий до запису. Беремо лише ходи —
   * усе інше відновлюється з правил при `restore`.
   */
  public toSlot(slotName: string, game: Game): SaveSlot {
    return {
      slotName,
      savedAt: Date.now(),
      startedAt: game.getStartedAt(),
      boardSize: game.getBoard().size,
      winLength: game.getWinLength(),
      firstSymbol: game.firstSymbol(),
      playerX: SaveSlotMapper.serializePlayer(game.getPlayerX()),
      playerO: SaveSlotMapper.serializePlayer(game.getPlayerO()),
      moves: game.getMoves().map((move) => ({
        row: move.position.row,
        col: move.position.col,
        symbol: move.symbol,
        madeAt: move.madeAt,
      })),
    };
  }

  /**
   * Відновлює `Game` зі слота. Робимо це покроково — викликаємо
   * `move()` для кожної позиції, тож вся валідація та обчислення
   * статусу спрацьовує природно. Якщо ходи були записані з помилками,
   * метод кине `ValidationError`, і виклик ловиться вище.
   *
   * Передаємо оригінальні `madeAt`-таймстемпи через `options`, аби
   * round-trip `toSlot → fromSlot` не «зсував» час ходів. Першого
   * символа беремо зі слота безпосередньо — навіть якщо ходи відсутні,
   * відновлення коректно зберігає, хто мав ходити першим.
   */
  public fromSlot(slot: SaveSlot): Game {
    const playerX = SaveSlotMapper.deserializePlayer(slot.playerX);
    const playerO = SaveSlotMapper.deserializePlayer(slot.playerO);
    let game = Game.start({
      boardSize: slot.boardSize,
      winLength: slot.winLength,
      firstSymbol: slot.firstSymbol,
      startedAt: slot.startedAt,
      playerX,
      playerO,
    });
    for (const move of slot.moves) {
      game = game.move(
        { row: move.row, col: move.col },
        { madeAt: move.madeAt },
      );
    }
    return game;
  }

  private static serializePlayer(player: Player): SaveSlotParticipant {
    return {
      name: player.name,
      symbol: player.symbol,
      type: player.isComputer ? "ai" : "human",
      difficulty: player.difficulty,
    };
  }

  private static deserializePlayer(participant: SaveSlotParticipant): Player {
    return makePlayer({
      id: `${participant.symbol}:${participant.name}`,
      name: participant.name,
      symbol: participant.symbol,
      isComputer: participant.type === "ai",
      difficulty: participant.difficulty,
    });
  }
}
