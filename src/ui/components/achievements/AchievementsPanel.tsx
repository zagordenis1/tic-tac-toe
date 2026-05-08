import { useMemo } from "react";
import { Panel } from "../common/Panel";
import { EmptyState } from "../common/EmptyState";
import { Badge } from "../common/Badge";
import { useAppRuntime } from "../../hooks/useAppRuntime";
import { useTranslation } from "../../hooks/useTranslation";
import { useGame } from "../../hooks/useGame";
import { ACHIEVEMENT_CATALOG } from "../../../achievements/AchievementCatalog";
import type { Achievement } from "../../../achievements/Achievement";

/**
 * Розділ досягнень. Зливаємо два джерела:
 *   - повний каталог (`ACHIEVEMENT_CATALOG`) — щоб показати ще закриті;
 *   - стан репозиторію — щоб правильно відобразити дату відкриття.
 *
 * Колір рамки залежить від «тиру» (бронза/срібло/золото).
 */
export function AchievementsPanel(): JSX.Element {
  const { t, locale } = useTranslation();
  const runtime = useAppRuntime();
  const { game } = useGame();

  const unlocks = useMemo(() => {
    // game у залежностях, щоб після події `game:ended` (яка
    // створює нові розблокування) ми перерахувались.
    void game;
    return new Map(runtime.achievements.list().map((entry) => [entry.id, entry.unlockedAt]));
  }, [runtime, game]);

  const total = ACHIEVEMENT_CATALOG.length;
  const unlockedCount = ACHIEVEMENT_CATALOG.filter((a) => unlocks.has(a.id)).length;

  if (total === 0) {
    return (
      <Panel title={t("achievements.title")}>
        <EmptyState
          title={t("achievements.title")}
          description={t("achievements.empty")}
        />
      </Panel>
    );
  }

  return (
    <Panel
      title={t("achievements.title")}
      subtitle={t("achievements.progress", {
        params: { unlocked: unlockedCount, total },
      })}
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {ACHIEVEMENT_CATALOG.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            unlockedAt={unlocks.get(achievement.id) ?? null}
            locale={locale}
          />
        ))}
      </ul>
    </Panel>
  );
}

interface AchievementCardProps {
  readonly achievement: Achievement;
  readonly unlockedAt: number | null;
  readonly locale: string;
}

function AchievementCard({
  achievement,
  unlockedAt,
  locale,
}: AchievementCardProps): JSX.Element {
  const { t } = useTranslation();
  const isUnlocked = unlockedAt !== null;
  const tierClass =
    achievement.tier === "gold"
      ? "border-warning/60"
      : achievement.tier === "silver"
        ? "border-line"
        : "border-line/60";
  const dateLabel = isUnlocked
    ? new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-US", {
        dateStyle: "medium",
      }).format(new Date(unlockedAt))
    : null;
  return (
    <li
      className={`flex items-start gap-3 rounded-xl border ${tierClass} bg-canvas-subtle px-3 py-3 ${
        isUnlocked ? "" : "opacity-60"
      }`}
    >
      <span aria-hidden className="text-2xl select-none">
        {achievement.icon}
      </span>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-ink">{achievement.title}</span>
          <Badge tone={isUnlocked ? "success" : "neutral"}>
            {isUnlocked ? t("achievements.unlocked") : t("achievements.locked")}
          </Badge>
        </div>
        <p className="text-xs text-ink-muted mt-1">{achievement.description}</p>
        {dateLabel ? (
          <p className="text-xs text-ink-muted mt-1">
            {t("achievements.unlockedAt", { params: { date: dateLabel } })}
          </p>
        ) : null}
      </div>
    </li>
  );
}
