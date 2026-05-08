/**
 * Режими гри, які підтримуються застосунком. PvP — два гравці на одному
 * пристрої, PvC — гравець проти комп'ютера.
 *
 * Перерахування винесено в окремий тип, тому що від нього залежить багато
 * сценаріїв (показ налаштувань складності, статистика, поведінка
 * GameInvoker). Завдяки цьому ми уникаємо магічних рядків у коді.
 */
export const GameMode = {
  PlayerVsPlayer: "PVP",
  PlayerVsComputer: "PVC",
} as const;

export type GameMode = (typeof GameMode)[keyof typeof GameMode];

/**
 * Зручна перевірка для гілок, які мають виконуватися тільки при грі з
 * комп'ютером (наприклад автоматичне виконання ходу AI).
 */
export function isComputerMode(mode: GameMode): boolean {
  return mode === GameMode.PlayerVsComputer;
}

/**
 * Зворотна перевірка — використовується там, де нам важливо явно
 * наголосити на людському режимі (логування, аналітика).
 */
export function isPlayerVsPlayerMode(mode: GameMode): boolean {
  return mode === GameMode.PlayerVsPlayer;
}
