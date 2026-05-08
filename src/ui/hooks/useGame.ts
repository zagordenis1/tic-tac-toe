import { useContext } from "react";
import { GameContext, type GameContextValue } from "../contexts/GameContext";

/**
 * Доступ до поточного стану гри. Замість того, щоб усі компоненти
 * самі підписувались на `EventBus`, ми тримаємо мінімум стану в
 * `GameProvider` і даємо реактивний знімок одним викликом.
 */
export function useGame(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) {
    throw new Error("useGame: відсутній GameProvider у дереві компонентів");
  }
  return value;
}
