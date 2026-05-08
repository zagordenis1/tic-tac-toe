import type { Difficulty } from "../types/Difficulty";
import type { PlayerSymbol } from "../types/Symbol";

/**
 * Слот збереження поточної партії. Містить мінімум, потрібний, щоб
 * відновити `Game`: налаштування правил, тип кожного гравця та лінійна
 * послідовність ходів.
 *
 * `firstSymbol` зберігаємо явно: коли в слоті 0 ходів (партію щойно
 * створили й автозбереження її зловило), без цього поля ми б не знали,
 * хто ходить першим, і скидали б до «X». Тепер відновлення поважає
 * оригінальну конфігурацію `GameConfig.firstSymbol`.
 */
export interface SaveSlot {
  readonly slotName: string;
  readonly savedAt: number;
  readonly boardSize: number;
  readonly winLength: number;
  readonly firstSymbol: PlayerSymbol;
  readonly playerX: SaveSlotParticipant;
  readonly playerO: SaveSlotParticipant;
  readonly moves: ReadonlyArray<SaveSlotMove>;
}

/**
 * Учасник у слоті: знаючи `type` і `difficulty`, ми можемо
 * відтворити `Player` через `Player.human(...)` або
 * `Player.ai(...)`.
 */
export interface SaveSlotParticipant {
  readonly name: string;
  readonly symbol: PlayerSymbol;
  readonly type: "human" | "ai";
  readonly difficulty: Difficulty | null;
}

export interface SaveSlotMove {
  readonly row: number;
  readonly col: number;
  readonly symbol: PlayerSymbol;
  readonly madeAt: number;
}
