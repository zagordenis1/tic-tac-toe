import { Difficulty } from "../types/Difficulty";
import { GameMode } from "../types/GameMode";
import { PlayerSymbol } from "../types/Symbol";
import { DEFAULT_WIN_LENGTH, MAX_BOARD_SIZE, MIN_BOARD_SIZE } from "../utils/constants";
import { ensure } from "../utils/assert";

/**
 * Конфігурація партії. Зібрана в один іммутабельний об'єкт, щоб не
 * передавати десяток окремих параметрів у GameFactory та AIController.
 */
export interface GameConfig {
  readonly mode: GameMode;
  readonly boardSize: number;
  readonly winLength: number;
  readonly playerXName: string;
  readonly playerOName: string;
  readonly aiSymbol: PlayerSymbol | null;
  readonly aiDifficulty: Difficulty | null;
  readonly firstSymbol: PlayerSymbol;
}

/**
 * Стандартна конфігурація — звичайні хрестики-нулики 3х3, гравець X ходить
 * перший, AI вимкнено. Використовується як база для нової гри.
 */
export const defaultGameConfig: GameConfig = {
  mode: GameMode.PlayerVsPlayer,
  boardSize: MIN_BOARD_SIZE,
  winLength: DEFAULT_WIN_LENGTH,
  playerXName: "Гравець X",
  playerOName: "Гравець O",
  aiSymbol: null,
  aiDifficulty: null,
  firstSymbol: PlayerSymbol.X,
};

/**
 * Валідує конфігурацію. Повертає той самий об'єкт, якщо все ОК, або кидає
 * `ValidationError` зі зрозумілим повідомленням. Робимо це окремою
 * функцією, щоб і UI, і Repository могли пропустити дані через одну й ту
 * саму перевірку.
 */
export function validateGameConfig(config: GameConfig): GameConfig {
  ensure(
    config.boardSize >= MIN_BOARD_SIZE,
    `boardSize must be >= ${MIN_BOARD_SIZE}`,
  );
  ensure(
    config.boardSize <= MAX_BOARD_SIZE,
    `boardSize must be <= ${MAX_BOARD_SIZE}`,
  );
  ensure(
    config.winLength >= 3,
    "winLength must be >= 3",
  );
  ensure(
    config.winLength <= config.boardSize,
    "winLength cannot exceed boardSize",
  );
  if (config.mode === GameMode.PlayerVsComputer) {
    ensure(
      config.aiSymbol !== null,
      "aiSymbol must be set in PVC mode",
    );
    ensure(
      config.aiDifficulty !== null,
      "aiDifficulty must be set in PVC mode",
    );
  }
  return config;
}
