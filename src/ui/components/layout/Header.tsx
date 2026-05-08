import { useTheme } from "../../hooks/useTheme";
import { useSettings } from "../../hooks/useSettings";
import { useTranslation } from "../../hooks/useTranslation";
import { SegmentedControl } from "../common/SegmentedControl";
import type { ThemeMode, SupportedLocale } from "../../../persistence/Settings";

/**
 * Шапка застосунку. Тримає назву, девіз і два швидких перемикачі —
 * тема та локаль. Свідомо не показуємо тут довгих описів — більш
 * деталізовані налаштування доступні в окремому розділі.
 */
export function Header(): JSX.Element {
  const { t } = useTranslation();
  const { settings, setField } = useSettings();
  const { applier, mode } = useTheme();

  const handleThemeChange = (value: ThemeMode): void => {
    setField("theme", value);
    applier.setMode(value);
  };

  const handleLocaleChange = (value: SupportedLocale): void => {
    setField("locale", value);
  };

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t("app.title")}</h1>
        <p className="text-sm text-ink-muted">{t("app.tagline")}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl<ThemeMode>
          value={mode}
          onChange={handleThemeChange}
          ariaLabel={t("settings.theme")}
          items={[
            { value: "system", label: t("settings.theme.system") },
            { value: "light", label: t("settings.theme.light") },
            { value: "dark", label: t("settings.theme.dark") },
          ]}
        />
        <SegmentedControl<SupportedLocale>
          value={settings.locale}
          onChange={handleLocaleChange}
          ariaLabel={t("settings.locale")}
          items={[
            { value: "uk", label: "UA" },
            { value: "en", label: "EN" },
          ]}
        />
      </div>
    </header>
  );
}
