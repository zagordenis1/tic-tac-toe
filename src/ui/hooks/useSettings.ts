import { useContext } from "react";
import { SettingsContext, type SettingsContextValue } from "../contexts/SettingsContext";

/**
 * Доступ до користувацьких налаштувань. Обгортка над `SettingsContext`
 * — рівно той самий інтерфейс, лише з перевіркою наявності провайдера.
 */
export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) {
    throw new Error("useSettings: відсутній SettingsProvider у дереві компонентів");
  }
  return value;
}
