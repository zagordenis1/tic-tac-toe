import { createContext, type ReactNode, useEffect, useMemo, useState } from "react";
import type { AppRuntime } from "../services/AppRuntime";
import { createAppRuntime } from "../services/AppRuntime";

/**
 * Контекст «композитного» рантайму. Тримає всі довгоживучі сервіси,
 * створені одного разу. React-компоненти отримують доступ через
 * `useAppRuntime()` (див. `hooks/useAppRuntime`), а не пробрасывают
 * пропами, бо це свідомо «глобальні» обʼєкти на рівні застосунку.
 *
 * Контекст оголошений зі значенням `null`, бо створення рантайму
 * відкладається до монтування `AppRuntimeProvider`. Хук перевіряє
 * наявність значення і кидає помилку, якщо забули обгорнути дерево
 * у провайдер — це робить фейл явним при першому ж рендері.
 */
export const AppRuntimeContext = createContext<AppRuntime | null>(null);

export interface AppRuntimeProviderProps {
  readonly children: ReactNode;
  readonly runtime?: AppRuntime;
}

/**
 * Провайдер рантайму. Якщо `runtime` передали ззовні (тести або
 * Storybook) — використовуємо його; інакше створюємо новий через
 * `createAppRuntime()`. У `useEffect` чіпляємо dispose-callback,
 * щоб StrictMode або HMR не залишали підвішених підписок.
 */
export function AppRuntimeProvider({
  children,
  runtime: external,
}: AppRuntimeProviderProps): JSX.Element {
  const [runtime] = useState<AppRuntime>(() => external ?? createAppRuntime());

  useEffect(() => {
    return () => {
      // Не диспатчимо dispose, якщо рантайм передали зовні — за
      // його життєвим циклом стежить власник.
      if (external) return;
      runtime.dispose();
    };
    // Залежності навмисно сталі: ми створюємо рантайм один раз і
    // тримаємо його до розмонтування провайдера.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => runtime, [runtime]);
  return (
    <AppRuntimeContext.Provider value={value}>{children}</AppRuntimeContext.Provider>
  );
}
