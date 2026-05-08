/**
 * Невелика утиліта для перевірки інваріантів. Замість викидати інстанси
 * `Error` напряму ми використовуємо окреме ім'я, щоб у логах одразу було
 * видно: тут зламана внутрішня логіка, а не помилка користувача.
 */
export class InvariantError extends Error {
  constructor(message: string) {
    super(`Invariant violated: ${message}`);
    this.name = "InvariantError";
  }
}

export function invariant(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new InvariantError(message);
  }
}

/**
 * Дещо м'якший варіант — для вхідних даних, що можуть приходити з UI.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new ValidationError(message);
  }
}
