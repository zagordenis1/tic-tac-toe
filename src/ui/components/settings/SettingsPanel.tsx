import { useMemo } from "react";
import { Panel } from "../common/Panel";
import { Select } from "../common/Select";
import { Toggle } from "../common/Toggle";
import { Button } from "../common/Button";
import { useSettings } from "../../hooks/useSettings";
import { useTranslation } from "../../hooks/useTranslation";
import { useTheme } from "../../hooks/useTheme";
import { ALL_DIFFICULTIES } from "../../../types/Difficulty";
import type { Difficulty } from "../../../types/Difficulty";
import type { ThemeMode, SupportedLocale } from "../../../persistence/Settings";

/**
 * Великий розділ «Налаштування». Зібрали всі поля `UserSettings` в
 * один екран; кожна зміна негайно записується в репозиторій через
 * `useSettings().setField`. Це навмисно — користувачу не треба
 * натискати «Зберегти», щоб тема або мова змінилися.
 */
export function SettingsPanel(): JSX.Element {
  const { t } = useTranslation();
  const { settings, setField, reset } = useSettings();
  const { applier } = useTheme();

  const themeOptions = useMemo(
    () => [
      { value: "system" as ThemeMode, label: t("settings.theme.system") },
      { value: "light" as ThemeMode, label: t("settings.theme.light") },
      { value: "dark" as ThemeMode, label: t("settings.theme.dark") },
    ],
    [t],
  );

  const localeOptions = useMemo(
    () => [
      { value: "uk" as SupportedLocale, label: "Українська" },
      { value: "en" as SupportedLocale, label: "English" },
    ],
    [],
  );

  const difficultyOptions = useMemo(
    () =>
      ALL_DIFFICULTIES.map((difficulty) => ({
        value: difficulty,
        label: t(`settings.aiDifficulty.${difficulty}` as const),
      })),
    [t],
  );

  return (
    <Panel
      title={t("settings.title")}
      footer={
        <Button variant="ghost" onClick={reset}>
          {t("settings.reset")}
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label={t("settings.theme")}
          value={settings.theme}
          onChange={(value) => {
            setField("theme", value as ThemeMode);
            applier.setMode(value as ThemeMode);
          }}
          options={themeOptions}
        />
        <Select
          label={t("settings.locale")}
          value={settings.locale}
          onChange={(value) => setField("locale", value as SupportedLocale)}
          options={localeOptions}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label={t("settings.aiDifficulty")}
          value={settings.aiDifficulty}
          onChange={(value) => setField("aiDifficulty", value as Difficulty)}
          options={difficultyOptions}
        />
        <Select
          label={t("settings.aiThinkingDelay")}
          value={String(settings.aiThinkingDelayMs)}
          onChange={(value) => setField("aiThinkingDelayMs", Number(value))}
          options={[
            { value: "0", label: "0" },
            { value: "150", label: "150" },
            { value: "350", label: "350" },
            { value: "700", label: "700" },
            { value: "1500", label: "1500" },
          ]}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Toggle
          label={t("settings.enableSounds")}
          checked={settings.enableSounds}
          onChange={(value) => setField("enableSounds", value)}
        />
        <Toggle
          label={t("settings.enableAnimations")}
          checked={settings.enableAnimations}
          onChange={(value) => setField("enableAnimations", value)}
        />
        <Toggle
          label={t("settings.enableHints")}
          checked={settings.enableHints}
          onChange={(value) => setField("enableHints", value)}
        />
        <Toggle
          label={t("settings.highlightLastMove")}
          checked={settings.highlightLastMove}
          onChange={(value) => setField("highlightLastMove", value)}
        />
        <Toggle
          label={t("settings.autosave")}
          checked={settings.autosave}
          onChange={(value) => setField("autosave", value)}
        />
      </div>
    </Panel>
  );
}
