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
 * Хук, який підписується на колбек розблокування та повертає
 * останнє повідомлення (або `null`, якщо нових немає).
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
    return runtime.bus.on("game:ended", () => {
      // Свіжий стан читаємо одразу після того, як підписник
      // досягнень обробить подію — для цього використовуємо
      // мікротаску, аби гарантовано перебігти за нашим порядком
      // підписників.
      Promise.resolve().then(() => {
        const list = runtime.achievements.list();
        if (list.length === 0) return;
        const last = list[list.length - 1];
        setNotice({ entries: [last], seenAt: Date.now() });
      });
    });
  }, [runtime]);

  return {
    notice,
    dismiss(): void {
      setNotice(null);
    },
  };
}
