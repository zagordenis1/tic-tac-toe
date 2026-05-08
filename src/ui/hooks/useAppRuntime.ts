import { useContext } from "react";
import { AppRuntimeContext } from "../contexts/AppRuntimeContext";
import type { AppRuntime } from "../services/AppRuntime";

/**
 * Хук доступу до композитного рантайму. Кидає помилку, якщо
 * викликати поза межами `AppRuntimeProvider` — це гарантує, що
 * жоден компонент не «гублений» з боку DI-дерева.
 */
export function useAppRuntime(): AppRuntime {
  const value = useContext(AppRuntimeContext);
  if (!value) {
    throw new Error("useAppRuntime: відсутній AppRuntimeProvider у дереві компонентів");
  }
  return value;
}
