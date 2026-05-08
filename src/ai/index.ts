/**
 * Барель-експорт модуля AI. Інші частини проєкту імпортують усе через
 * цей шлях, не знаючи про внутрішню структуру каталогу. Це знижує
 * звʼязність — якщо ми переорганізуємо файли всередині `ai/`, інша
 * частина коду не помітить різниці.
 */
export type { AIStrategy, AIContext } from "./AIStrategy";
export { RandomStrategy } from "./RandomStrategy";
export { HeuristicStrategy } from "./HeuristicStrategy";
export { MinimaxStrategy } from "./MinimaxStrategy";
export { AlphaBetaStrategy } from "./AlphaBetaStrategy";
export {
  StrategyRegistry,
  defaultStrategyRegistry,
} from "./StrategyRegistry";
export { AIPlayerFactory, defaultAIPlayerFactory } from "./AIPlayerFactory";
export { AIController } from "./AIController";
export { SelfPlay, type SelfPlayResult } from "./SelfPlay";
