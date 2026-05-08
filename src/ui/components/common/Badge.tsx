import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "success" | "danger" | "warning" | "accent";

export interface BadgeProps {
  readonly tone?: BadgeTone;
  readonly children: ReactNode;
  readonly className?: string;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-canvas-subtle text-ink-muted border border-line",
  success: "bg-success/10 text-success border border-success/30",
  danger: "bg-danger/10 text-danger border border-danger/30",
  warning: "bg-warning/10 text-warning border border-warning/30",
  accent: "bg-accent/10 text-accent border border-accent/30",
};

/**
 * Маленький значок для статусів і метаданих (наприклад «AI Hard»,
 * «Перемога», «Нічия»). Використовуємо «бінарну» палітру тонів,
 * щоб не плодити кольори без потреби.
 */
export function Badge({ tone = "neutral", children, className = "" }: BadgeProps): JSX.Element {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5",
        "text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
