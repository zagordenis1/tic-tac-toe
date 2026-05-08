import { useId } from "react";

export interface ToggleProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
}

/**
 * Перемикач (switch) для бінарних налаштувань. Реалізуємо через
 * `<button role="switch">` — це найдоступніший варіант, який не
 * ламається при custom-стилях `<input type="checkbox">`.
 */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleProps): JSX.Element {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <div className="flex flex-col">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {description ? (
          <span className="text-xs text-ink-muted">{description}</span>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative inline-flex h-6 w-11 items-center rounded-full transition",
          "focus-visible:outline-none focus-visible:shadow-focus",
          checked ? "bg-accent" : "bg-canvas-subtle border border-line",
          disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "translate-x-5" : "translate-x-1",
          ].join(" ")}
          aria-hidden
        />
      </button>
    </div>
  );
}
