import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SettingsRepository } from "../../persistence/repositories/SettingsRepository";
import type { UserSettings } from "../../persistence/Settings";
import { withSettingChange } from "../../persistence/Settings";

export interface SettingsContextValue {
  readonly settings: UserSettings;
  /** Замінює одне поле за ключем — найчастіший сценарій. */
  setField<K extends keyof UserSettings>(key: K, value: UserSettings[K]): void;
  /** Часткове злиття для batch-оновлень (наприклад «нова гра»). */
  update(patch: Partial<UserSettings>): void;
  /** Скидає налаштування до дефолтних. */
  reset(): void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export interface SettingsProviderProps {
  readonly repository: SettingsRepository;
  readonly initial: UserSettings;
  readonly children: ReactNode;
  readonly onChange?: (next: UserSettings, prev: UserSettings) => void;
}

/**
 * Провайдер налаштувань. Тримає `useState` з користувацькими
 * налаштуваннями і синхронізує його з репозиторієм. Колбек
 * `onChange` дає можливість «підняти» зміни на рівень `App` — там
 * ми реагуємо на зміни теми/локалі/автозбереження.
 *
 * Усі мутації записують у `localStorage` через репозиторій. Якщо
 * користувач змінює одне поле — ми все одно зберігаємо повний
 * обʼєкт, бо `JsonRepository` робить це атомарно.
 */
export function SettingsProvider({
  repository,
  initial,
  children,
  onChange,
}: SettingsProviderProps): JSX.Element {
  const [settings, setSettings] = useState<UserSettings>(initial);

  // Тримаємо стабільне посилання на колбек, щоб не порушувати
  // правила React-хуків при змінах закритих над ним функцій.
  useEffect(() => {
    setSettings(initial);
  }, [initial]);

  const setField = useCallback(
    function set<K extends keyof UserSettings>(key: K, value: UserSettings[K]): void {
      setSettings((prev) => {
        const next = withSettingChange(prev, key, value);
        repository.save(next);
        if (onChange) onChange(next, prev);
        return next;
      });
    },
    [repository, onChange],
  );

  const update = useCallback(
    (patch: Partial<UserSettings>) => {
      // Виконуємо побічні ефекти (запис у репозиторій + onChange)
      // прямо в `setSettings`-апдейтері, але БЕЗ повторного виклику
      // `setState`. Раніше тут викликався `persist`, який сам робив
      // `setSettings(next)`, що породжувало вкладений setState й
      // попередження React «cannot update a component while rendering».
      setSettings((prev) => {
        const next: UserSettings = { ...prev, ...patch };
        repository.save(next);
        if (onChange) onChange(next, prev);
        return next;
      });
    },
    [repository, onChange],
  );

  const reset = useCallback(() => {
    setSettings((prev) => {
      const next = repository.reset();
      if (onChange) onChange(next, prev);
      return next;
    });
  }, [repository, onChange]);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, setField, update, reset }),
    [settings, setField, update, reset],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
