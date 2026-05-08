import { useEffect } from "react";
import type { EventBus } from "../../events/EventBus";
import type { GameEventMap } from "../../events/GameEvents";

/**
 * Підписка React-компонента на конкретну подію шини. Хук бере
 * функцію-обробник і встановлює/прибирає підписку. Виклик
 * `handler` робить у замиканні — споживач не повинен турбуватись
 * за цикл життя.
 *
 * Якщо потрібно отримувати кілька подій — створюйте кілька викликів
 * `useEventBus`, кожен зі своєю спеціалізованою функцією.
 */
export function useEventBus<K extends keyof GameEventMap>(
  bus: EventBus<GameEventMap>,
  event: K,
  handler: (payload: GameEventMap[K]) => void,
): void {
  useEffect(() => {
    return bus.on(event, handler);
    // Залежимо від ідентичности handler/event/bus: якщо споживач
    // загорнув handler у `useCallback`, ефект не перезапиниться.
  }, [bus, event, handler]);
}
