import type { SelectHTMLAttributes } from "react";

export interface SelectOption<TValue extends string = string> {
  readonly value: TValue;
  readonly label: string;
}

export interface SelectProps<TValue extends string = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> {
  readonly value: TValue;
  readonly onChange: (value: TValue) => void;
  readonly options: ReadonlyArray<SelectOption<TValue>>;
  readonly label?: string;
  readonly hint?: string;
  readonly error?: string;
}

/**
 * Простий select без сторонніх залежностей. Для нашого UI
 * (вибір локалі, складнощі AI, теми) рідного `<select>` цілком
 * вистачає, не варто городити кастомний випадайник з усіма
 * проблемами доступности.
 */
export function Select<TValue extends string>({
  value,
  onChange,
  options,
  label,
  hint,
  error,
  className = "",
  id,
  disabled,
  ...rest
}: SelectProps<TValue>): JSX.Element {
  const selectId = id ?? `select-${(label ?? "field").replace(/\s+/g, "-")}`;
  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={selectId}>
      {label ? <span className="font-medium text-ink">{label}</span> : null}
      <select
        {...rest}
        id={selectId}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as TValue)}
        className={[
          "h-10 rounded-xl border border-line bg-canvas-subtle px-3",
          "text-ink focus-visible:outline-none focus-visible:shadow-focus",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="text-ink-muted">{hint}</span> : null}
      {error ? <span className="text-danger">{error}</span> : null}
    </label>
  );
}
