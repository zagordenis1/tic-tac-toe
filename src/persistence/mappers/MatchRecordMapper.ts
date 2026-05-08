import type { Game } from "../../core/Game";
import type { Player } from "../../core/Player";
import { buildMatchId, type MatchParticipant, type MatchRecord } from "../Match";

/**
 * Перетворення `Game → MatchRecord`. Створюється запис, що готовий
 * лягти в історію партій, без зайвих знань про сам Game.
 */
export class MatchRecordMapper {
  /**
   * Будує запис партії з `Game`. Обовʼязково передавайте завершену
   * партію (`game.isOver() === true`); метод фіксує час завершення
   * саме на момент виклику, якщо `finishedAt` не виставлено.
   *
   * ID складається лише зі стабільних властивостей завершеної партії
   * (`startedAt`, `finishedAt`, кількість ходів). Тому redo фінального
   * ходу, який повторно тригерить `game:ended`, не створить дубль —
   * `MatchRepository.save` ідемпотентно зливає однаковий ID.
   */
  public toRecord(game: Game): MatchRecord {
    const playedAt = game.getStartedAt();
    const finishedAt = game.getFinishedAt() ?? Date.now();
    const id = buildMatchId(
      playedAt,
      MatchRecordMapper.deterministicSuffix(finishedAt, game.getMoves().length),
    );
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
   * Детермінований постфікс із моменту завершення та кількості ходів.
   * Дві однакові партії за `startedAt` + `finishedAt` + кількість ходів
   * матимуть один і той самий ID — це і є умова дедуплікації.
   */
  private static deterministicSuffix(finishedAt: number, moveCount: number): string {
    return `${finishedAt.toString(36)}-${moveCount.toString(36)}`;
  }
}
