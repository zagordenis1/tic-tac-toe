import { useContext } from "react";
import { ThemeContext, type ThemeContextValue } from "../contexts/ThemeContext";

/**
 * Доступ до поточної теми. Дає UI можливість прочитати фактичну
 * тему (наприклад, при `mode === "system"`) та перемкнутись через
 * `applier.setMode`.
 */
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme: відсутній ThemeProvider у дереві компонентів");
  }
  return value;
}
