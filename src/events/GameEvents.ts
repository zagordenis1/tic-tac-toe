import type { Game } from "../core/Game";
import type { Move } from "../core/Move";
import type { GameStatus } from "../types/GameStatus";

/**
 * Каталог подій ігрового домену. Кожен ключ — це унікальне імʼя
 * події; значення — типізований payload, який будуть отримувати
 * підписники. Завдяки цьому підпису TypeScript ловить помилки на
 * етапі компіляції, а не в рантаймі.
 */
/**
 * Каталог визначається як `type` (а не `interface`), щоб задовольнити
 * обмеження `Record<string, unknown>` у `EventBus`. У TypeScript
 * інтерфейси без явного index-signature формально не сумісні з
 * `Record<string, unknown>`, тоді як object type-літерал — сумісний.
 */
export type GameEventMap = {
  /**
   * Партія щойно стартувала (вперше або після перезапуску).
   */
  "game:started": {
    readonly game: Game;
  };

  /**
   * Гравець зробив легальний хід.
   */
  "game:moveMade": {
    readonly game: Game;
    readonly move: Move;
  };

  /**
   * Гравець спробував зробити нелегальний хід (наприклад, у зайняту
   * клітинку). Не блокує гру, але дає UI можливість показати
   * підказку.
   */
  "game:moveRejected": {
    readonly game: Game;
    readonly reason: string;
  };

  /**
   * Команду скасовано (undo).
   */
  "game:undo": {
    readonly game: Game;
  };

  /**
   * Команду повторено (redo).
   */
  "game:redo": {
    readonly game: Game;
  };

  /**
   * Партію перезапущено: дошка очищена, лічильники обнулено.
   */
  "game:restarted": {
    readonly game: Game;
  };

  /**
   * Партія завершилася (виграш або нічия).
   */
  "game:ended": {
    readonly game: Game;
    readonly status: GameStatus;
  };

  /**
   * Зміна історії команд: змінилось `canUndo` чи `canRedo`. UI цим
   * користується, щоб увімкнути/вимкнути кнопки.
   */
  "history:changed": {
    readonly canUndo: boolean;
    readonly canRedo: boolean;
    readonly pastSize: number;
    readonly futureSize: number;
  };
};

/**
 * Зручне обʼєднання усіх імен подій у тип. Корисно для приймачів, які
 * хочуть приймати «будь-яке» подієве імʼя.
 */
export type GameEventName = keyof GameEventMap;
