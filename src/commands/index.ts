/**
 * Барель-експорт модуля команд. Решта застосунку працює лише через цей
 * шлях, не торкаючись внутрішньої структури каталогу.
 */
export type { Command } from "./Command";
export { MakeMoveCommand } from "./MakeMoveCommand";
export { RestartGameCommand } from "./RestartGameCommand";
export { CommandHistory } from "./CommandHistory";
export { GameCommandService } from "./GameCommandService";
