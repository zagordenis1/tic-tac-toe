/**
 * Константи, які використовуються в кількох модулях. Збір в одному місці
 * полегшує тонке налаштування поведінки гри без полювання на «магічні»
 * числа в коді.
 */

/** Мінімальний розмір ігрового поля. Менше робити немає сенсу. */
export const MIN_BOARD_SIZE = 3;

/** Максимальний розмір ігрового поля. Більше — і AI стає дуже повільним. */
export const MAX_BOARD_SIZE = 6;

/** Стандартна довжина виграшної лінії для класичних хрестиків-нуликів. */
export const DEFAULT_WIN_LENGTH = 3;

/** За скільки мс затримати хід AI, щоб гравець бачив «думання». */
export const AI_THINKING_DELAY_MS = 350;

/** Максимальна глибина пошуку для minimax без alpha-beta. */
export const MINIMAX_MAX_DEPTH = 6;

/** Бали за типи закінчених ігор. Використовується в leaderboard. */
export const POINTS = {
  win: 3,
  draw: 1,
  loss: 0,
} as const;

/** Локальні ключі для localStorage. Збираємо в одному місці. */
export const STORAGE_KEYS = {
  settings: "ttt::settings",
  history: "ttt::history",
  stats: "ttt::stats",
  achievements: "ttt::achievements",
  pendingGame: "ttt::pending-game",
} as const;
