import type { AIStrategy } from "./AIStrategy";
import type { Difficulty } from "../types/Difficulty";
import {
  defaultStrategyRegistry,
  StrategyRegistry,
} from "./StrategyRegistry";

/**
 * Фабрика AI-«гравців». Її роль — приховати від решти коду деталі того,
 * звідки беруться стратегії. Це класичний приклад патерна Factory: клієнт
 * каже «дайте мені AI рівня Hard», а ми вирішуємо, чи створити новий
 * `MinimaxStrategy`, чи скопіювати з пулу — деталі ховаються тут.
 *
 * Окрім простого створення, фабрика також генерує «імена» гравців на
 * основі рівня — щоб у статистиці та в UI було видно, з ким зіграно
 * («Бот: Hard»), без повторення цих рядків у кожному модулі.
 */
export class AIPlayerFactory {
  private readonly registry: StrategyRegistry;

  public constructor(registry: StrategyRegistry = defaultStrategyRegistry) {
    this.registry = registry;
  }

  /**
   * Повертає стратегію для гравця-AI заданого рівня. На цьому рівні
   * абстракції ми вже не дбаємо, як саме реалізована стратегія — лише про
   * те, який інтерфейс вона надає.
   */
  public createStrategy(difficulty: Difficulty): AIStrategy {
    return this.registry.create(difficulty);
  }

  /**
   * Імʼя бота для UI / історії. Виокремлено в єдине місце, щоб не
   * повторювати «Бот: Easy» / «Бот: Medium» в кількох файлах. Якщо колись
   * захочемо перейти на персональні імена («Petryk», «Ostap»), достатньо
   * поправити тільки цей метод.
   */
  public botName(difficulty: Difficulty): string {
    const localized: Record<Difficulty, string> = {
      easy: "Бот (легкий)",
      medium: "Бот (середній)",
      hard: "Бот (важкий)",
      insane: "Бот (несамовитий)",
    };
    return localized[difficulty];
  }

  /**
   * Чи є рівень доступним. Корисно для UI: якщо в реєстрі немає
   * певної стратегії, ми не показуємо її гравцеві.
   */
  public isAvailable(difficulty: Difficulty): boolean {
    return this.registry.registeredDifficulties().includes(difficulty);
  }
}

export const defaultAIPlayerFactory = new AIPlayerFactory();
