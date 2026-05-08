import { useEffect, type ReactNode } from "react";
import { IconButton } from "./IconButton";

export interface ModalProps {
  readonly open: boolean;
  readonly title: ReactNode;
  readonly children: ReactNode;
  readonly onClose: () => void;
  readonly footer?: ReactNode;
  readonly size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

/**
 * Мінімальне модальне вікно без сторонніх залежностей. Робимо
 * фокус-пастку «руками» — закриваємо по `Escape` та клацанню по
 * фону. Не претендуємо на повну реалізацію WAI-ARIA, але базові
 * вимоги (`role="dialog"`, `aria-modal`, `aria-labelledby`)
 * виставлені.
 */
export function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  size = "md",
}: ModalProps): JSX.Element | null {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={[
          "relative w-full rounded-2xl bg-canvas-subtle shadow-card",
          "border border-line p-6 flex flex-col gap-4",
          SIZE_CLASSES[size],
        ].join(" ")}
      >
        <header className="flex items-center justify-between gap-2">
          <h2 id="modal-title" className="text-lg font-semibold text-ink">
            {title}
          </h2>
          <IconButton label="Закрити" icon={"×"} onClick={onClose} />
        </header>
        <div className="flex flex-col gap-4">{children}</div>
        {footer ? <footer className="flex justify-end gap-2">{footer}</footer> : null}
      </div>
    </div>
  );
}
