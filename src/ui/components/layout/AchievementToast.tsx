import { useEffect } from "react";
import { useAchievementsUnlock } from "../../hooks/useAchievementsUnlock";
import { useTranslation } from "../../hooks/useTranslation";
import { findAchievement } from "../../../achievements/AchievementCatalog";

/**
 * Невеликий банер-toast про щойно розблоковане досягнення. Авто-
 * закривається через 4 секунди — ми не блокуємо ним інтерфейс.
 */
export function AchievementToast(): JSX.Element | null {
  const { notice, dismiss } = useAchievementsUnlock();
  const { t } = useTranslation();

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(dismiss, 4000);
    return () => window.clearTimeout(timer);
  }, [notice, dismiss]);

  if (!notice || notice.entries.length === 0) return null;
  const last = notice.entries[notice.entries.length - 1];
  const meta = findAchievement(last.id);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-2xl border border-line bg-canvas-subtle px-4 py-3 shadow-card animate-fade"
    >
      <span aria-hidden className="text-2xl">
        {meta?.icon ?? "🏆"}
      </span>
      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase text-ink-muted">
          {t("achievements.unlocked")}
        </span>
        <span className="text-sm font-medium text-ink">
          {meta?.title ?? last.id}
        </span>
      </div>
    </div>
  );
}
