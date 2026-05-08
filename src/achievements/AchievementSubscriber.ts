import type { EventBus } from "../events/EventBus";
import type { GameEventMap } from "../events/GameEvents";
import { MatchRecordMapper } from "../persistence/mappers/MatchRecordMapper";
import { StatsCalculator } from "../stats/StatsCalculator";
import type { MatchRepository } from "../persistence/repositories/MatchRepository";
import type { Game } from "../core/Game";
import type { MatchRecord } from "../persistence/Match";
import type { UnlockedAchievement } from "./Achievement";
import { AchievementEvaluator } from "./AchievementEvaluator";
import type { AchievementRepository } from "./AchievementRepository";

/**
 * Опційний колбек, що повідомляє UI про нові розблоковані
 * досягнення. Використовується для toast-нотифікацій.
 */
export type AchievementUnlockedListener = (
  unlocked: ReadonlyArray<UnlockedAchievement>,
) => void;

/**
 * Підписник на `EventBus`, який після завершення партії перевіряє,
 * чи зʼявились нові досягнення, і записує їх у репозиторій.
 *
 * Це — приклад декомпозиції через Observer-патерн: ми не вʼяжемо
 * правила досягнень до ігрового сервісу, а реагуємо на події, тож
 * додавання нових правил не вимагає змін у грі.
 */
export class AchievementSubscriber {
  private readonly disposers: Array<() => void> = [];
  private readonly humanKey: string;

  public constructor(
    private readonly bus: EventBus<GameEventMap>,
    private readonly evaluator: AchievementEvaluator,
    private readonly achievements: AchievementRepository,
    private readonly matches: MatchRepository,
    private readonly humanName: string,
    private readonly now: () => number = () => Date.now(),
    private readonly onUnlocked?: AchievementUnlockedListener,
  ) {
    this.humanKey = `human:${this.humanName}`;
  }

  /**
   * Запускає підписку. Повертає функцію відписки — UI викликає її
   * при `unmount`, щоб не лишати «висячих» колбеків.
   */
  public start(): () => void {
    if (this.disposers.length > 0) {
      // Захист від подвійного `start` — у dev-режимі React може
      // монтувати ефекти двічі.
      return this.dispose.bind(this);
    }
    const offEnded = this.bus.on("game:ended", (payload) =>
      this.handleGameEnded(payload.game),
    );
    this.disposers.push(offEnded);
    return this.dispose.bind(this);
  }

  /**
   * Перевіряє історію без чекання нової партії — корисно при першому
   * запуску після перезавантаження, коли частина матчів уже є,
   * але підписки ще не було.
   */
  public bootstrap(): void {
    const matches = this.matches.listAll();
    if (matches.length === 0) return;
    const lastRecord = matches[matches.length - 1];
    const ids = this.evaluateAgainstHistory(matches, lastRecord);
    this.persistUnlocks(ids);
  }

  private handleGameEnded(game: Game): void {
    const record = new MatchRecordMapper().toRecord(game);
    const allMatches = [...this.matches.listAll(), record];
    const ids = this.evaluateAgainstHistory(allMatches, record);
    this.persistUnlocks(ids);
  }

  private evaluateAgainstHistory(
    history: ReadonlyArray<MatchRecord>,
    lastRecord: MatchRecord,
  ): string[] {
    const stats = new StatsCalculator().computeMap(history);
    const playerStats = stats.get(this.humanKey);
    if (!playerStats) return [];
    const summary = AchievementEvaluator.buildSummary(lastRecord, this.humanKey);
    return this.evaluator.evaluateForStats(playerStats, summary);
  }

  private persistUnlocks(ids: ReadonlyArray<string>): void {
    if (ids.length === 0) return;
    const fresh = this.achievements.unlockMany(ids, this.now());
    if (fresh.length > 0 && this.onUnlocked) {
      this.onUnlocked(fresh);
    }
  }

  private dispose(): void {
    for (const disposer of this.disposers) disposer();
    this.disposers.length = 0;
  }
}
