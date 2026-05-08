import { useEffect, useState } from "react";
import type { UnlockedAchievement } from "../../achievements/Achievement";
import { useAppRuntime } from "./useAppRuntime";

/**
 * Стан про останні розблоковані досягнення. Використовується
 * тостами/банерами «Нове досягнення!». Сам список тримаємо
 * коротким — це лише «новини» з останнього кінця партії.
 */
export interface UnlockNotice {
  readonly entries: ReadonlyArray<UnlockedAchievement>;
  readonly seenAt: number;
}

/**
 * Хук, який підписується на повідомлення про ФАКТИЧНО нові
 * розблокування (через `runtime.onAchievementsUnlocked`). Старі
 * досягнення не показуємо повторно — це раніше призводило до
 * «фантомних» тостів після кожної завершеної партії.
 *
 * Виклик `dismiss()` обнуляє повідомлення, дозволяючи UI закрити
 * банер, не перезавантажуючи сторінку.
 */
export function useAchievementsUnlock(): {
  notice: UnlockNotice | null;
  dismiss: () => void;
} {
  const runtime = useAppRuntime();
  const [notice, setNotice] = useState<UnlockNotice | null>(null);

  useEffect(() => {
    return runtime.onAchievementsUnlocked((entries) => {
      if (entries.length === 0) return;
      setNotice({ entries: [...entries], seenAt: Date.now() });
    });
  }, [runtime]);

  return {
    notice,
    dismiss(): void {
      setNotice(null);
    },
  };
}
