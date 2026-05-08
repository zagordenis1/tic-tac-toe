import { useMemo } from "react";
import { Panel } from "../common/Panel";
import { EmptyState } from "../common/EmptyState";
import { Badge } from "../common/Badge";
import { useAppRuntime } from "../../hooks/useAppRuntime";
import { useTranslation } from "../../hooks/useTranslation";
import { useGame } from "../../hooks/useGame";
import { useSettings } from "../../hooks/useSettings";
import { StatsCalculator } from "../../../stats/StatsCalculator";
import { averageMatchMs, winRate } from "../../../stats/PlayerStats";

/**
 * Форматує тривалість у вигляді `m:ss`. Виносимо в окрему функцію,
 * аби не плодити дрібну логіку всередині JSX.
 */
function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0:00";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Форматує дату у локалізованому вигляді. Якщо передали `null`
 * (наприклад, гравець ще не грав) — показуємо тире.
 */
function formatDate(timestamp: number | null, locale: string): string {
  if (timestamp === null) return "—";
  return new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

interface StatRowProps {
  readonly label: string;
  readonly value: string | number;
}

function StatRow({ label, value }: StatRowProps): JSX.Element {
  return (
    <div className="flex items-center justify-between border-b border-line py-2 last:border-0">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

/**
 * Розділ статистики. Показуємо два варіанти агрегацій:
 *   1) персональні дані поточного гравця (за `humanName` із налаштувань);
 *   2) топ-таблицю всіх учасників, що з’являлись у партіях.
 *
 * Не зберігаємо результат окремо — статистика обчислюється з історії
 * партій кожного разу при рендері. Для кількох сотень записів це
 * безкоштовно і дає 100% актуальність.
 */
export function StatsPanel(): JSX.Element {
  const { t, locale } = useTranslation();
  const runtime = useAppRuntime();
  const { settings } = useSettings();
  // Підтягуємо game для невидимої залежности від оновлень історії —
  // після завершення партії ми хочемо свіжу статистику без перезавантаження.
  const { game } = useGame();
  const matches = useMemo(
    () => runtime.storage.matches.listAll(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [runtime, game],
  );
  const calculator = useMemo(() => new StatsCalculator(), []);
  const personalKey = `human:${settings.humanName}`;
  const personal = useMemo(
    () => calculator.statsFor(matches, personalKey, settings.humanName),
    [calculator, matches, personalKey, settings.humanName],
  );
  const topPlayers = useMemo(() => calculator.computeList(matches), [calculator, matches]);

  if (matches.length === 0) {
    return (
      <Panel title={t("stats.title")}>
        <EmptyState
          title={t("stats.title")}
          description={t("stats.empty")}
        />
      </Panel>
    );
  }

  return (
    <Panel title={t("stats.title")} subtitle={settings.humanName}>
      <div>
        <StatRow label={t("stats.totalGames")} value={personal.games} />
        <StatRow label={t("stats.wins")} value={personal.wins} />
        <StatRow label={t("stats.losses")} value={personal.losses} />
        <StatRow label={t("stats.draws")} value={personal.draws} />
        <StatRow
          label={t("stats.winRate")}
          value={`${winRate(personal).toFixed(1)}%`}
        />
        <StatRow label={t("stats.bestStreak")} value={personal.bestWinStreak} />
        <StatRow label={t("stats.currentStreak")} value={personal.currentWinStreak} />
        <StatRow
          label={t("stats.averageDuration")}
          value={formatDuration(averageMatchMs(personal))}
        />
        <StatRow
          label={t("stats.lastPlayed")}
          value={formatDate(personal.lastPlayedAt, locale)}
        />
      </div>

      {topPlayers.length > 1 ? (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-ink-muted mb-2">
            {t("stats.title")}
          </h3>
          <div className="flex flex-col gap-1">
            {topPlayers.map((row) => (
              <div
                key={row.key}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Badge tone={row.type === "ai" ? "accent" : "neutral"}>
                    {row.type === "ai"
                      ? t("common.player.ai")
                      : t("common.player.human")}
                  </Badge>
                  <span className="text-sm font-medium text-ink">
                    {row.displayName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-ink-muted">
                  <span>{t("stats.totalGames")}: {row.games}</span>
                  <span>{t("stats.wins")}: {row.wins}</span>
                  <span>{t("stats.losses")}: {row.losses}</span>
                  <span>{t("stats.draws")}: {row.draws}</span>
                  <span>{winRate(row).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
