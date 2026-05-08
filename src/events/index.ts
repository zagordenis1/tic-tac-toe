/**
 * Барель-експорт модуля подій. Дозволяє решті застосунку імпортувати
 * лише `from "../events"` без знання про внутрішню структуру каталогу.
 */
export { EventBus } from "./EventBus";
export type { EventHandler, Unsubscribe, AnyEventObserver } from "./EventBus";
export type { GameEventMap, GameEventName } from "./GameEvents";
export { EventfulGameService } from "./EventfulGameService";
export { ConsoleLoggerSubscriber } from "./subscribers/ConsoleLogger";
export { HistoryRecorder } from "./subscribers/HistoryRecorder";
export type { RecordedGame } from "./subscribers/HistoryRecorder";
export { MoveCounter } from "./subscribers/MoveCounter";
