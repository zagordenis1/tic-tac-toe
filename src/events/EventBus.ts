/**
 * Узагальнена шина подій (Observer-патерн). Її можна параметризувати
 * мапою «імʼя події → тип payload»: тоді TypeScript сам не дасть нам
 * випадково підписатись на неіснуюче імʼя або передати неправильний
 * payload.
 *
 * Наша мета — надати єдину інфраструктуру, через яку доменна логіка
 * (Game / Commands) повідомляє решту застосунку: UI, статистику, логер,
 * сховище. Жоден з підписників не знає про інших, тож зв'язність
 * залишається мінімальною.
 */
export type EventHandler<P> = (payload: P) => void;

/**
 * Унікальна функція відписки. Викликати її повторно безпечно —
 * виконається один раз.
 */
export type Unsubscribe = () => void;

/**
 * Об'єкт, який спостерігає сирі події незалежно від їх типу. Зручно
 * для логерів та налагодження.
 */
export interface AnyEventObserver<EventMap> {
  observe<K extends keyof EventMap>(event: K, payload: EventMap[K]): void;
}

export class EventBus<EventMap extends Record<string, unknown>> {
  private readonly handlers: Map<keyof EventMap, Set<EventHandler<unknown>>> =
    new Map();
  private readonly observers: Set<AnyEventObserver<EventMap>> = new Set();
  private isPublishing = false;
  private readonly pending: Array<() => void> = [];

  /**
   * Підписує обробник на конкретну подію. Повертає функцію відписки.
   *
   * Множина обробників — це `Set`, тому повторна підписка одного й того
   * самого callback нічого не зламає.
   */
  public on<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
  ): Unsubscribe {
    const set = this.getOrCreateSet(event);
    set.add(handler as EventHandler<unknown>);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      set.delete(handler as EventHandler<unknown>);
    };
  }

  /**
   * Підписка «лише один раз»: автоматично відписується після першого
   * виклику. Корисно для очікування завершення партії, наприклад.
   */
  public once<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
  ): Unsubscribe {
    const off = this.on(event, (payload) => {
      off();
      handler(payload);
    });
    return off;
  }

  /**
   * Підписка на всі події одразу — основний інтерфейс для логерів,
   * аналітики тощо.
   */
  public observe(observer: AnyEventObserver<EventMap>): Unsubscribe {
    this.observers.add(observer);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      this.observers.delete(observer);
    };
  }

  /**
   * Публікує подію. Якщо нас викликали посеред публікації іншої
   * події — поточна відкладається в чергу й буде оброблена після
   * завершення поточного циклу. Це захищає від нескінченної рекурсії,
   * коли обробник публікує ту саму подію.
   */
  public emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    if (this.isPublishing) {
      this.pending.push(() => this.dispatch(event, payload));
      return;
    }
    this.isPublishing = true;
    try {
      this.dispatch(event, payload);
      while (this.pending.length > 0) {
        const next = this.pending.shift();
        if (next !== undefined) next();
      }
    } finally {
      this.isPublishing = false;
    }
  }

  /**
   * Знімає всіх підписників. Корисно в тестах і при перезапуску
   * застосунку.
   */
  public clear(): void {
    this.handlers.clear();
    this.observers.clear();
    this.pending.length = 0;
  }

  /**
   * Кількість підписників на конкретну подію. Виключно для тестів та
   * діагностики.
   */
  public listenerCount<K extends keyof EventMap>(event: K): number {
    return this.handlers.get(event)?.size ?? 0;
  }

  private dispatch<K extends keyof EventMap>(
    event: K,
    payload: EventMap[K],
  ): void {
    const handlers = this.handlers.get(event);
    if (handlers !== undefined) {
      // Копіюємо, бо обробник може відписатись посеред ітерації.
      const snapshot = Array.from(handlers);
      for (const handler of snapshot) {
        try {
          (handler as EventHandler<EventMap[K]>)(payload);
        } catch (error) {
          this.reportHandlerError(event, error);
        }
      }
    }
    for (const observer of Array.from(this.observers)) {
      try {
        observer.observe(event, payload);
      } catch (error) {
        this.reportHandlerError(event, error);
      }
    }
  }

  private getOrCreateSet<K extends keyof EventMap>(
    event: K,
  ): Set<EventHandler<unknown>> {
    let set = this.handlers.get(event);
    if (set === undefined) {
      set = new Set();
      this.handlers.set(event, set);
    }
    return set;
  }

  private reportHandlerError<K extends keyof EventMap>(
    event: K,
    error: unknown,
  ): void {
    // Не дозволяємо падінню одного підписника зламати інших. Логування
    // винесено в окремий метод, щоб у тестах його легко було підмінити.
    // eslint-disable-next-line no-console
    console.error(`[EventBus] handler for "${String(event)}" threw`, error);
  }
}
