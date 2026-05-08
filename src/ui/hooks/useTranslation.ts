import { useContext } from "react";
import { I18nContext, type I18nContextValue } from "../contexts/I18nContext";

/**
 * Доступ до перекладача та функції `t`. Реактивна: при зміні
 * локалі провайдер оновить значення контексту і викликаючий
 * компонент перерендериться.
 */
export function useTranslation(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useTranslation: відсутній I18nProvider у дереві компонентів");
  }
  return value;
}
