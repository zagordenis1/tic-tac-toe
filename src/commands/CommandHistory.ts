import type { Command } from "./Command";
import { ensure } from "../utils/assert";

/**
 * Стек команд для undo/redo. Класичний приклад керованої історії: ми
 * памʼятаємо вже виконані команди в одному стеку, а скасовані — у іншому.
 *
 * Чому два стеки, а не один список з курсором? Бо тоді нам не потрібно
 * памʼятати «скільки треба ще undo» — ми просто перекладаємо команди
 * між стеками. Код виходить простіший, а зв'язки прозоріші.
 */
export class CommandHistory<S> {
  private readonly past: Command<S>[] = [];
  private readonly future: Command<S>[] = [];
  private readonly capacity: number;

  public constructor(options: { capacity?: number } = {}) {
    this.capacity = options.capacity ?? 200;
  }

  /**
   * Виконує команду й кладе її в історію. Стек redo очищається —
   * це стандартна поведінка undo/redo в усіх редакторах.
   */
  public execute(state: S, command: Command<S>): S {
    const next = command.execute(state);
    this.push(command);
    return next;
  }

  /**
   * Додає вже виконану команду в історію. Корисно, якщо ми зробили хід
   * без участі цього сервісу (наприклад, через інший канал) і хочемо
   * мати його в стеку undo.
   */
  public push(command: Command<S>): void {
    this.past.push(command);
    this.future.length = 0;
    this.trim();
  }

  /**
   * Скасовує останню оборотну команду й повертає попередній стан.
   * Якщо історія порожня — кидає помилку.
   */
  public undo(state: S): S {
    ensure(this.canUndo(), "CommandHistory: undo неможливий");
    let next = state;
    let popped: Command<S> | undefined;
    while (this.past.length > 0) {
      popped = this.past.pop();
      if (popped === undefined) break;
      if (popped.reversible) {
        next = popped.undo(next);
        this.future.push(popped);
        return next;
      }
    }
    throw new Error("CommandHistory: всі команди необоротні");
  }

  /**
   * Повертає скасовану команду назад. Це робить undo/redo симетричним:
   * ми не виконуємо команду «з нуля», а просто заново застосовуємо її
   * `execute` до поточного стану.
   */
  public redo(state: S): S {
    ensure(this.canRedo(), "CommandHistory: redo неможливий");
    const command = this.future.pop();
    ensure(command !== undefined, "CommandHistory: redo: пустий стек");
    const next = command.execute(state);
    this.past.push(command);
    return next;
  }

  public canUndo(): boolean {
    return this.past.some((command) => command.reversible);
  }

  public canRedo(): boolean {
    return this.future.length > 0;
  }

  /**
   * Очищує всю історію. Використовуємо при перезапуску партії або при
   * завантаженні збереженої гри.
   */
  public clear(): void {
    this.past.length = 0;
    this.future.length = 0;
  }

  /**
   * Кількість записаних команд. Для тестів і UI.
   */
  public get pastSize(): number {
    return this.past.length;
  }

  public get futureSize(): number {
    return this.future.length;
  }

  /**
   * Повертає копію переліку імен у стеку past — корисно для логування
   * і налагодження.
   */
  public describePast(): string[] {
    return this.past.map((command) => command.name);
  }

  public describeFuture(): string[] {
    return this.future.map((command) => command.name);
  }

  /**
   * Тримає розмір історії в межах `capacity`. Викидає найстаріші команди.
   * Це гарантує, що довга партія на дошці 6х6 не зʼїсть памʼять.
   */
  private trim(): void {
    while (this.past.length > this.capacity) {
      this.past.shift();
    }
  }
}
