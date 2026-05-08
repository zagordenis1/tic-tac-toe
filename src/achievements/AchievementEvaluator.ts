import type { MatchRecord } from "../persistence/Match";
import type { PlayerStats } from "../stats/PlayerStats";
import { StatsCalculator } from "../stats/StatsCalculator";
import { isDraw, isWin } from "../types/GameStatus";
import {
  type Achievement,
  type AchievementInput,
  type AchievementMatchSummary,
  type UnlockedAchievement,
} from "./Achievement";
import { ACHIEVEMENT_CATALOG } from "./AchievementCatalog";

/**
 * «Двигун» досягнень. Окрема сутність, яка знає, як з агрегованої
 * статистики плюс останньої партії побудувати `AchievementInput`
 * і застосувати до кожного правила. Це класичний Strategy/Rules
 * патерн: набір незалежних маленьких обʼєктів, які прокручуються
 * через однаковий вхід.
 */
export class AchievementEvaluator {
  public constructor(
    private readonly catalog: ReadonlyArray<Achievement> = ACHIEVEMENT_CATALOG,
  ) {}

  /**
   * Повертає id досягнень, які при поточному стані виконані. Без
   * фільтрації «вже розблоковано» — викликаюча сторона сама вирішує,
   * як діяти з повторами (зазвичай це робить `AchievementRepository`).
   */
  public evaluate(input: AchievementInput): string[] {
    return this.catalog.filter((a) => a.isUnlocked(input)).map((a) => a.id);
  }

  /**
   * Зручний хелпер для UI: побудуй input з агрегату і останньої
   * партії, повернувши вже готовий список «відкритих».
   */
  public evaluateForStats(
    stats: PlayerStats,
    lastMatch: AchievementMatchSummary | null,
  ): string[] {
    return this.evaluate({
      games: stats.games,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      currentWinStreak: stats.currentWinStreak,
      bestWinStreak: stats.bestWinStreak,
      lastMatch,
    });
  }

  /**
   * Перетворює `MatchRecord` (точка зору учасника) на коротке резюме
   * для правил. Повертає null, якщо учасник з ключем `playerKey`
   * не брав участі в матчі — для безпеки.
   *
   * Ключі учасників обчислюються через `StatsCalculator.keyFor`, аби
   * формат збігався з тим, що використовує `StatsCalculator.computeMap`.
   * Інакше для AI без `difficulty` ключі розходяться (`ai:unknown` vs
   * `ai:<name>`), і метод повертав би `null` навіть для коректного
   * учасника.
   */
  public static buildSummary(
    match: MatchRecord,
    playerKey: string,
  ): AchievementMatchSummary | null {
    const xKey = StatsCalculator.keyFor(match.playerX);
    const oKey = StatsCalculator.keyFor(match.playerO);

    let perspective: "X" | "O" | null = null;
    if (xKey === playerKey) {
      perspective = "X";
    } else if (oKey === playerKey) {
      perspective = "O";
    }
    if (perspective === null) return null;

    let result: "win" | "loss" | "draw";
    if (isDraw(match.status)) {
      result = "draw";
    } else if (isWin(match.status)) {
      const winnerSymbol = match.status.winner;
      const isX = perspective === "X";
      result =
        (isX && winnerSymbol === match.playerX.symbol) ||
        (!isX && winnerSymbol === match.playerO.symbol)
          ? "win"
          : "loss";
    } else {
      return null;
    }

    const opponent = perspective === "X" ? match.playerO : match.playerX;
    return {
      result,
      opponentType: opponent.type,
      opponentDifficulty: opponent.difficulty,
      moveCount: match.moves.length,
      durationMs: match.durationMs,
      boardSize: match.boardSize,
    };
  }

  /**
   * Створює `UnlockedAchievement[]` з id-сетa за поточний момент.
   * Використовується при першій появі досягнень у сторінці.
   */
  public static toUnlocked(
    ids: ReadonlyArray<string>,
    timestamp: number,
  ): UnlockedAchievement[] {
    return ids.map((id) => ({ id, unlockedAt: timestamp }));
  }
}
