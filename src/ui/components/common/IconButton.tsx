import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly label: string;
  readonly icon: ReactNode;
  readonly tone?: "default" | "danger" | "accent";
}

const TONE_CLASSES: Record<NonNullable<IconButtonProps["tone"]>, string> = {
  default: "text-ink hover:bg-canvas-subtle",
  danger: "text-danger hover:bg-danger/10",
  accent: "text-accent hover:bg-accent/10",
};

/**
 * Кнопка-іконка з обовʼязковою `aria-label`. Виносимо її з Button,
 * щоб не множити прапорці на кшталт `iconOnly` і не ламати тенденцію
 * Button мати `children` як підпис.
 */
export function IconButton({
  label,
  icon,
  tone = "default",
  className = "",
  type = "button",
  ...rest
}: IconButtonProps): JSX.Element {
  const classes = [
    "inline-flex items-center justify-center w-9 h-9 rounded-xl",
    "transition focus-visible:outline-none focus-visible:shadow-focus",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    TONE_CLASSES[tone],
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} aria-label={label} title={label} className={classes} {...rest}>
      <span aria-hidden>{icon}</span>
    </button>
  );
}
