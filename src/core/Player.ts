import type { PlayerSymbol } from "../types/Symbol";

/**
 * Профіль гравця. У PvP ми зберігаємо двох людей; у PvC — людину та
 * комп'ютера (тоді `isComputer` == true).
 *
 * Виділяємо в окремий тип, бо AI (через AIController) хоче знати символ і
 * рівень складності, а UI — ім'я.
 */
export interface Player {
  readonly id: string;
  readonly name: string;
  readonly symbol: PlayerSymbol;
  readonly isComputer: boolean;
  readonly difficulty: import("../types/Difficulty").Difficulty | null;
}

export function makePlayer(input: {
  id: string;
  name: string;
  symbol: PlayerSymbol;
  isComputer: boolean;
  difficulty?: import("../types/Difficulty").Difficulty | null;
}): Player {
  return {
    id: input.id,
    name: input.name,
    symbol: input.symbol,
    isComputer: input.isComputer,
    difficulty: input.difficulty ?? null,
  };
}

/**
 * Відображає гравця в людському вигляді (для логів). Маленька, але
 * приємна абстракція замість повторюваного `${player.name} (${player.symbol})`.
 */
export function describePlayer(player: Player): string {
  const role = player.isComputer ? "AI" : "Людина";
  return `${player.name} [${player.symbol}, ${role}]`;
}
