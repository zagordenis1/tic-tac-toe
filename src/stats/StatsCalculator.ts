import type { MatchRecord, MatchParticipant } from "../persistence/Match";
import { isDraw, isWin } from "../types/GameStatus";
import {
  emptyPlayerStats,
  type PlayerStats,
} from "./PlayerStats";

/**
 * Чиста функція побудови статистики: бере список записів партій і
 * повертає мапу «ключ учасника → агрегат». Статистика не зберігається
 * окремо у localStorage — це дешева на обчислення похідна, тож
 * перерахунок при завантаженні UI цілком виправданий.
 *
 * Якщо у майбутньому записів стане десятки тисяч, можна буде
 * закешувати у `StatsRepository`, не змінюючи зовнішню сигнатуру.
 */
export class StatsCalculator {
  /**
   * Повертає мапу за ключем `key` — щоб UI знаходив запис конкретного
   * учасника без лінійного пошуку.
   */
  public computeMap(matches: ReadonlyArray<MatchRecord>): Map<string, PlayerStats> {
    const result = new Map<string, PlayerStats>();
    const ordered = [...matches].sort((a, b) => a.playedAt - b.playedAt);
    for (const match of ordered) {
      this.applyMatch(result, match);
    }
    return result;
  }

  /**
   * Зручне читання у вигляді масиву. Сортує за к-стю партій і потім
   * за відсотком перемог: «найактивніші — нагорі».
   */
  public computeList(matches: ReadonlyArray<MatchRecord>): PlayerStats[] {
    const list = Array.from(this.computeMap(matches).values());
    list.sort((a, b) => {
      if (a.games !== b.games) return b.games - a.games;
      return b.wins - a.wins;
    });
    return list;
  }

  /**
   * Знаходить статистику конкретного учасника за ключем; якщо ще не
   * грав — повертає «пустий» запис. UI використовує це для показу
   * нульових значень без додаткових перевірок.
   */
  public statsFor(
    matches: ReadonlyArray<MatchRecord>,
    key: string,
    fallbackName: string,
  ): PlayerStats {
    return (
      this.computeMap(matches).get(key) ??
      emptyPlayerStats({
        key,
        displayName: fallbackName,
        type: key.startsWith("ai:") ? "ai" : "human",
        difficulty: null,
      })
    );
  }

  /**
   * Накладає один матч на акумулятор. Виокремлено в метод, бо його
   * зручно тестувати ізольовано, а зовнішній цикл лишається
   * декларативним.
   */
  private applyMatch(
    accumulator: Map<string, PlayerStats>,
    match: MatchRecord,
  ): void {
    const xKey = StatsCalculator.keyFor(match.playerX);
    const oKey = StatsCalculator.keyFor(match.playerO);
    const xRecord = this.ensureRecord(accumulator, xKey, match.playerX);
    const oRecord = this.ensureRecord(accumulator, oKey, match.playerO);

    let xResult: "win" | "loss" | "draw";
    let oResult: "win" | "loss" | "draw";
    if (isDraw(match.status)) {
      xResult = "draw";
      oResult = "draw";
    } else if (isWin(match.status)) {
      const winner = match.status.winner;
      if (winner === match.playerX.symbol) {
        xResult = "win";
        oResult = "loss";
      } else {
        xResult = "loss";
        oResult = "win";
      }
    } else {
      // Партія в історії не повинна бути «in_progress», але якщо так —
      // безпечно ігноруємо.
      return;
    }

    accumulator.set(
      xKey,
      this.applyMatchResult(xRecord, xResult, match),
    );
    accumulator.set(
      oKey,
      this.applyMatchResult(oRecord, oResult, match),
    );
  }

  private applyMatchResult(
    record: PlayerStats,
    result: "win" | "loss" | "draw",
    match: MatchRecord,
  ): PlayerStats {
    let { wins, losses, draws, currentWinStreak, bestWinStreak } = record;
    if (result === "win") {
      wins += 1;
      currentWinStreak += 1;
      if (currentWinStreak > bestWinStreak) {
        bestWinStreak = currentWinStreak;
      }
    } else if (result === "loss") {
      losses += 1;
      currentWinStreak = 0;
    } else {
      draws += 1;
    }
    return {
      ...record,
      games: record.games + 1,
      wins,
      losses,
      draws,
      currentWinStreak,
      bestWinStreak,
      totalDurationMs: record.totalDurationMs + match.durationMs,
      totalMoves: record.totalMoves + match.moves.length,
      lastPlayedAt: match.playedAt,
    };
  }

  private ensureRecord(
    accumulator: Map<string, PlayerStats>,
    key: string,
    participant: MatchParticipant,
  ): PlayerStats {
    const existing = accumulator.get(key);
    if (existing) return existing;
    return emptyPlayerStats({
      key,
      displayName: participant.name,
      type: participant.type,
      difficulty: participant.difficulty,
    });
  }

  /**
   * Стабільний ключ учасника. AI агрегуємо за рівнем — людина
   * проти `insane` бачить одну й ту ж статистику, незалежно від того,
   * скільки конкретних AI-«персонажів» було в історії.
   */
  public static keyFor(participant: MatchParticipant): string {
    if (participant.type === "ai") {
      return `ai:${participant.difficulty ?? "unknown"}`;
    }
    return `human:${participant.name}`;
  }
}
