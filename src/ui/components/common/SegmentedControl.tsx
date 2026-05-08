import type { ReactNode } from "react";

export interface SegmentedItem<TValue extends string> {
  readonly value: TValue;
  readonly label: ReactNode;
  readonly icon?: ReactNode;
  readonly disabled?: boolean;
}

export interface SegmentedControlProps<TValue extends string> {
  readonly value: TValue;
  readonly onChange: (value: TValue) => void;
  readonly items: ReadonlyArray<SegmentedItem<TValue>>;
  readonly ariaLabel: string;
  readonly className?: string;
}

/**
 * Сегментований перемикач (як у iOS-стилі). Підходить для тем
 * (light/dark/system) та інших невеликих, взаємовиключних виборів —
 * там, де `<select>` зайвий і займає більше місця.
 */
export function SegmentedControl<TValue extends string>({
  value,
  onChange,
  items,
  ariaLabel,
  className = "",
}: SegmentedControlProps<TValue>): JSX.Element {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={[
        "inline-flex items-center gap-1 rounded-xl bg-canvas-subtle p-1",
        "border border-line",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={[
              "h-8 px-3 rounded-lg text-sm transition",
              "focus-visible:outline-none focus-visible:shadow-focus",
              active
                ? "bg-accent text-accent-contrast shadow"
                : "bg-transparent text-ink-muted hover:text-ink",
              item.disabled ? "opacity-40 cursor-not-allowed" : "",
            ].join(" ")}
          >
            <span className="inline-flex items-center gap-1.5">
              {item.icon ? <span aria-hidden>{item.icon}</span> : null}
              <span>{item.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
