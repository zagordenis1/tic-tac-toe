import type { Difficulty } from "../types/Difficulty";

/**
 * Аґреґована статистика по одному «учаснику». Учасник — це не Player
 * (бо id-логіки гравців у нас наразі немає), а імʼя, з яким людина
 * грає; AI агрегується окремо за рівнем складності.
 */
export interface PlayerStats {
  /**
   * Стабільний ключ запису. Для людини це `human:<name>`, для AI —
   * `ai:<difficulty>`. Уніфікований префікс дає можливість UI
   * відрізнити людей і ботів без зайвих полів.
   */
  readonly key: string;
  readonly displayName: string;
  readonly type: "human" | "ai";
  readonly difficulty: Difficulty | null;

  readonly games: number;
  readonly wins: number;
  readonly losses: number;
  readonly draws: number;

  /**
   * Поточна серія перемог підряд. Скидається на нуль при поразці.
   * При нічиях не змінюється — це навмисно, щоб «топ-серії» залишались
   * одною й тією ж самою сильною ознакою.
   */
  readonly currentWinStreak: number;
  readonly bestWinStreak: number;

  /**
   * Сума тривалостей усіх партій (мс). Використовується для
   * обчислення середнього часу через `averageMatchMs`.
   */
  readonly totalDurationMs: number;
  readonly totalMoves: number;

  /**
   * Час останньої партії, у яку був втягнутий цей учасник. UI
   * показує «давно не грав» у списку.
   */
  readonly lastPlayedAt: number | null;
}

/**
 * Створює пустий запис для учасника. Виносимо в окрему функцію, щоб
 * не повторювати поля в коді калькулятора.
 */
export function emptyPlayerStats(input: {
  key: string;
  displayName: string;
  type: "human" | "ai";
  difficulty: Difficulty | null;
}): PlayerStats {
  return {
    key: input.key,
    displayName: input.displayName,
    type: input.type,
    difficulty: input.difficulty,
    games: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    totalDurationMs: 0,
    totalMoves: 0,
    lastPlayedAt: null,
  };
}

/**
 * Обчислює відсоток перемог. Округлюємо до десятої — більше не дає
 * корисної точности у списку статистики.
 */
export function winRate(stats: PlayerStats): number {
  if (stats.games === 0) return 0;
  return Math.round((stats.wins / stats.games) * 1000) / 10;
}

/**
 * Середня тривалість партії. Якщо партій нема — 0.
 */
export function averageMatchMs(stats: PlayerStats): number {
  if (stats.games === 0) return 0;
  return Math.round(stats.totalDurationMs / stats.games);
}
