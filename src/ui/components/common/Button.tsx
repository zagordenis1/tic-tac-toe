import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Базова кнопка з кількома варіантами візуалу. Свідомо лишаємо
 * мінімальний набір варіантів — `primary`, `secondary`, `ghost`,
 * `danger` — щоб уникати «зоопарку» стилів. Всі інші особливості
 * (іконки, лоадери) додаються як children, без додаткових prop-ів.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly fullWidth?: boolean;
  readonly leadingIcon?: ReactNode;
  readonly trailingIcon?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-contrast hover:opacity-90 disabled:opacity-50 shadow-card",
  secondary:
    "bg-canvas-subtle text-ink hover:bg-canvas/60 border border-line",
  ghost:
    "bg-transparent text-ink hover:bg-canvas-subtle border border-transparent",
  danger:
    "bg-danger text-white hover:opacity-90 disabled:opacity-50",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded-lg",
  md: "h-10 px-4 text-base rounded-xl",
  lg: "h-12 px-6 text-lg rounded-2xl",
};

/**
 * Чисто презентаційний компонент: бере presets для варіанту/розміру
 * та клас фокусу, передає решту прост на нативний `<button>`. Це
 * зменшує когнітивне навантаження — ми ніде не приховуємо подій миші
 * чи `aria-*`.
 */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps): JSX.Element {
  const classes = [
    "inline-flex items-center justify-center gap-2 font-medium transition",
    "focus-visible:outline-none focus-visible:shadow-focus",
    "disabled:cursor-not-allowed",
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={classes} {...rest}>
      {leadingIcon ? <span aria-hidden>{leadingIcon}</span> : null}
      <span>{children}</span>
      {trailingIcon ? <span aria-hidden>{trailingIcon}</span> : null}
    </button>
  );
}
