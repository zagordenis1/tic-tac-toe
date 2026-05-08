import type { PlayerStats } from "./PlayerStats";
import { winRate } from "./PlayerStats";

/**
 * Сортувальні стратегії для лідерборду. Окрема константа замість enum
 * щоб JSON-серіалізація налаштувань (через `UserSettings.theme` тощо)
 * не вимагала додаткової конвертації.
 */
export type LeaderboardSort =
  | "wins-desc"
  | "win-rate-desc"
  | "games-desc"
  | "best-streak-desc";

/**
 * Один рядок таблиці лідерів. Окремий тип, бо в UI ми хочемо мати
 * стабільне «місце» (rank) і ключ ідентичний `PlayerStats.key` для
 * `key`-prop у списку.
 */
export interface LeaderboardEntry {
  readonly rank: number;
  readonly stats: PlayerStats;
  readonly winRate: number;
}

/**
 * Чисто детермінована функція побудови лідерборду. Виокремили з UI,
 * щоб тести могли просто перевірити порядок.
 */
export class Leaderboard {
  /**
   * Будує таблицю з масиву `PlayerStats`. Якщо в одного з учасників
   * нема партій — він просто не потрапляє в лідерборд (нульові
   * метрики не цікаві).
   */
  public build(
    players: ReadonlyArray<PlayerStats>,
    sort: LeaderboardSort = "wins-desc",
  ): LeaderboardEntry[] {
    const filtered = players.filter((p) => p.games > 0);
    const sorted = [...filtered].sort(Leaderboard.compareFor(sort));
    return sorted.map((stats, index) => ({
      rank: index + 1,
      stats,
      winRate: winRate(stats),
    }));
  }

  /**
   * Стратегія порівняння — Strategy-патерн в мініатюрі. Виносимо в
   * статичний метод, щоб читачу було очевидно, що сортувальники не
   * мають стану.
   */
  private static compareFor(
    sort: LeaderboardSort,
  ): (a: PlayerStats, b: PlayerStats) => number {
    switch (sort) {
      case "wins-desc":
        return (a, b) => b.wins - a.wins || b.games - a.games;
      case "win-rate-desc":
        return (a, b) => winRate(b) - winRate(a) || b.wins - a.wins;
      case "games-desc":
        return (a, b) => b.games - a.games;
      case "best-streak-desc":
        return (a, b) => b.bestWinStreak - a.bestWinStreak || b.wins - a.wins;
      default: {
        // Захист від додавання нової константи без оновлення методу.
        const exhaustive: never = sort;
        return exhaustive;
      }
    }
  }
}
