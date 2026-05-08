import type { Game } from "../../core/Game";
import type { Player } from "../../core/Player";
import { buildMatchId, type MatchParticipant, type MatchRecord } from "../Match";

/**
 * Перетворення `Game → MatchRecord`. Створюється запис, що готовий
 * лягти в історію партій, без зайвих знань про сам Game.
 */
export class MatchRecordMapper {
  private static suffixCounter = 0;

  /**
   * Будує запис партії з `Game`. Обовʼязково передавайте завершену
   * партію (`game.isOver() === true`); метод фіксує час завершення
   * саме на момент виклику, якщо `finishedAt` не виставлено.
   */
  public toRecord(game: Game): MatchRecord {
    const playedAt = game.getStartedAt();
    const finishedAt = game.getFinishedAt() ?? Date.now();
    const id = buildMatchId(playedAt, MatchRecordMapper.nextSuffix());
    return {
      id,
      playedAt,
      durationMs: Math.max(0, finishedAt - playedAt),
      boardSize: game.getBoard().size,
      winLength: game.getWinLength(),
      playerX: MatchRecordMapper.toParticipant(game.getPlayerX()),
      playerO: MatchRecordMapper.toParticipant(game.getPlayerO()),
      status: game.getStatus(),
      moves: game.getMoves().map((move) => ({
        row: move.position.row,
        col: move.position.col,
        symbol: move.symbol,
        madeAt: move.madeAt,
      })),
    };
  }

  private static toParticipant(player: Player): MatchParticipant {
    return {
      name: player.name,
      symbol: player.symbol,
      type: player.isComputer ? "ai" : "human",
      difficulty: player.difficulty,
    };
  }

  /**
   * Постфікс додає унікальності записам, зробленим за одну й ту ж
   * мілісекунду (рідко, але реально, наприклад у тестах).
   */
  private static nextSuffix(): string {
    MatchRecordMapper.suffixCounter += 1;
    return MatchRecordMapper.suffixCounter.toString(36);
  }
}
