import type { ReactNode } from "react";

export interface PanelProps {
  readonly title?: ReactNode;
  readonly subtitle?: ReactNode;
  readonly actions?: ReactNode;
  readonly footer?: ReactNode;
  readonly children?: ReactNode;
  readonly className?: string;
  readonly id?: string;
}

/**
 * Загальна «картка» — стандартизує відступи, заголовки та підвал
 * для секцій інтерфейсу: налаштувань, статистики, історії тощо.
 * Так у нас усі панелі мають однакові пропорції та фокус.
 */
export function Panel({
  title,
  subtitle,
  actions,
  footer,
  children,
  className = "",
  id,
}: PanelProps): JSX.Element {
  return (
    <section
      id={id}
      className={[
        "flex flex-col gap-4 rounded-2xl border border-line bg-canvas-subtle p-5",
        "shadow-card",
        className,
      ].join(" ")}
    >
      {(title || actions) && (
        <header className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            {title ? (
              <h3 className="text-lg font-semibold text-ink">{title}</h3>
            ) : null}
            {subtitle ? (
              <p className="text-sm text-ink-muted">{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="flex gap-2">{actions}</div> : null}
        </header>
      )}
      <div className="flex flex-col gap-3">{children}</div>
      {footer ? <footer className="border-t border-line pt-3">{footer}</footer> : null}
    </section>
  );
}
