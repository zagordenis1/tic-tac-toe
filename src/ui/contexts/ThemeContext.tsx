import { createContext, type ReactNode, useEffect, useMemo, useState } from "react";
import type { Theme } from "../../themes/Theme";
import type { ThemeApplier } from "../../themes/ThemeApplier";
import type { ThemeMode } from "../../persistence/Settings";

export interface ThemeContextValue {
  readonly applier: ThemeApplier;
  readonly mode: ThemeMode;
  readonly current: Theme;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  readonly applier: ThemeApplier;
  readonly children: ReactNode;
}

/**
 * Провайдер теми. Підписується на `ThemeApplier.subscribe`, який
 * сповіщає, коли тема фактично змінилась (наприклад, перемкнулась
 * системна тема). React-компоненти, які залежать від теми (наприклад,
 * іконки), використовують `useTheme()` і автоматично перерендеряться.
 */
export function ThemeProvider({ applier, children }: ThemeProviderProps): JSX.Element {
  const [current, setCurrent] = useState<Theme>(applier.getCurrent());
  const [mode, setMode] = useState<ThemeMode>(applier.getMode());

  useEffect(() => {
    return applier.subscribe((theme) => {
      setCurrent(theme);
      setMode(applier.getMode());
    });
  }, [applier]);

  const value = useMemo<ThemeContextValue>(
    () => ({ applier, mode, current }),
    [applier, mode, current],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
