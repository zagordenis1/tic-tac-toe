/**
 * Модуль `core` містить весь домен гри без жодних залежностей від UI чи
 * сховища. Завдяки цьому ту саму логіку можна повторно використовувати в
 * Node.js, у тестах або, наприклад, у бекенді.
 */
export { Board } from "./Board";
export { Game, type GameSnapshot } from "./Game";
export { GameFactory } from "./GameFactory";
export type { GameConfig } from "./GameConfig";
export { defaultGameConfig, validateGameConfig } from "./GameConfig";
export { WinChecker } from "./WinChecker";
export { BoardEvaluator } from "./BoardEvaluator";
export { generateLines } from "./Lines";
export type { Line } from "./Lines";
export type { Cell } from "./Cell";
export { isEmptyCell, isOccupiedCell, makeCell } from "./Cell";
export type { Move } from "./Move";
export { makeMove } from "./Move";
export type { Player } from "./Player";
export { makePlayer, describePlayer } from "./Player";
export type { MatchResult } from "./Result";
