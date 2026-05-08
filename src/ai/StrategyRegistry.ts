import type { AIStrategy } from "./AIStrategy";
import { Difficulty } from "../types/Difficulty";
import { RandomStrategy } from "./RandomStrategy";
import { HeuristicStrategy } from "./HeuristicStrategy";
import { MinimaxStrategy } from "./MinimaxStrategy";
import { AlphaBetaStrategy } from "./AlphaBetaStrategy";
import { ensure } from "../utils/assert";

/**
 * Реєстр доступних AI-стратегій. Окремий клас тут — щоб дотримуватися
 * принципу Open/Closed: щоб додати новий рівень складності, достатньо
 * зареєструвати нову стратегію, не міняючи AIPlayerFactory.
 *
 * Реалізовано як Singleton-подібний клас: реєстр створюється з типовою
 * конфігурацією, але є можливість підмінити стратегію (наприклад у тестах
 * або для експериментів). Це робить код тестованим і гнучким.
 */
export class StrategyRegistry {
  private readonly strategies: Map<Difficulty, () => AIStrategy>;

  public constructor() {
    this.strategies = new Map<Difficulty, () => AIStrategy>();
    this.registerDefaults();
  }

  /**
   * Реєструє нову стратегію. Якщо для рівня вже існує реєстрація — нова
   * перепише попередню. Це навмисна поведінка: тести можуть передати
   * заглушку без змін у решті коду.
   */
  public register(
    difficulty: Difficulty,
    factory: () => AIStrategy,
  ): void {
    this.strategies.set(difficulty, factory);
  }

  /**
   * Повертає стратегію для заданого рівня. Якщо рівень не зареєстрований,
   * кидає помилку — це краще, ніж повертати «найближчу» стратегію та
   * приховувати проблему конфігурації.
   */
  public create(difficulty: Difficulty): AIStrategy {
    const factory = this.strategies.get(difficulty);
    ensure(factory !== undefined, `Стратегію для рівня ${difficulty} не знайдено`);
    return factory();
  }

  /**
   * Повертає список зареєстрованих рівнів. Корисно для UI, який має
   * відобразити лише ті рівні, для яких справді є реалізація.
   */
  public registeredDifficulties(): Difficulty[] {
    return Array.from(this.strategies.keys());
  }

  private registerDefaults(): void {
    this.strategies.set(Difficulty.Easy, () => new RandomStrategy());
    this.strategies.set(Difficulty.Medium, () => new HeuristicStrategy());
    this.strategies.set(Difficulty.Hard, () => new MinimaxStrategy());
    this.strategies.set(Difficulty.Insane, () => new AlphaBetaStrategy());
  }
}

/**
 * Глобальний (за замовчуванням) реєстр. У реальному коді ми просто
 * викликаємо `defaultRegistry.create(difficulty)`. Якщо нам треба інша
 * конфігурація — створюємо власний `new StrategyRegistry()` локально.
 */
export const defaultStrategyRegistry = new StrategyRegistry();
