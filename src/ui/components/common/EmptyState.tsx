import type { ReactNode } from "react";

export interface EmptyStateProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly action?: ReactNode;
  readonly icon?: ReactNode;
}

/**
 * Універсальний placeholder для секцій без даних (порожня історія,
 * жодного відкритого досягнення тощо). Свідомо не приймаємо
 * довільних className — щоб усі «порожні стани» виглядали однаково.
 */
export function EmptyState({ title, description, action, icon }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 py-8">
      {icon ? <div className="text-3xl text-ink-muted" aria-hidden>{icon}</div> : null}
      <h4 className="text-base font-semibold text-ink">{title}</h4>
      {description ? <p className="text-sm text-ink-muted max-w-sm">{description}</p> : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
