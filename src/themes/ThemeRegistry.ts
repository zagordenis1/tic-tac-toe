import type { Theme, ThemeId } from "./Theme";

/**
 * Базова палітра. Усі ключі починаються з `--ttt-`, щоб уникнути
 * випадкових колізій з токенами Tailwind за замовчуванням.
 *
 * Розділяємо тему на:
 *   - `bg-*` (фони),
 *   - `fg-*` (текст і базові акценти),
 *   - `accent-*` (виділення X/O, інтерактив, focus),
 *   - `border-*` (розмежування блоків і клітинок поля).
 */
const lightTheme: Theme = {
  id: "light",
  nameKey: "settings.theme.light",
  mode: "light",
  tokens: {
    "--ttt-bg-page": "#f4f5f7",
    "--ttt-bg-surface": "#ffffff",
    "--ttt-bg-cell": "#ffffff",
    "--ttt-bg-cell-highlight": "#fffbe6",
    "--ttt-fg-primary": "#1f2933",
    "--ttt-fg-muted": "#52606d",
    "--ttt-fg-inverse": "#ffffff",
    "--ttt-accent-x": "#2563eb",
    "--ttt-accent-o": "#dc2626",
    "--ttt-accent-win": "#16a34a",
    "--ttt-accent-focus": "#0ea5e9",
    "--ttt-border-soft": "#e5e7eb",
    "--ttt-border-strong": "#9ca3af",
    "--ttt-shadow-elevation": "0 12px 32px rgba(15, 23, 42, 0.08)",
  },
};

const darkTheme: Theme = {
  id: "dark",
  nameKey: "settings.theme.dark",
  mode: "dark",
  tokens: {
    "--ttt-bg-page": "#0f172a",
    "--ttt-bg-surface": "#111c33",
    "--ttt-bg-cell": "#16223e",
    "--ttt-bg-cell-highlight": "#1e2a4a",
    "--ttt-fg-primary": "#e2e8f0",
    "--ttt-fg-muted": "#94a3b8",
    "--ttt-fg-inverse": "#0f172a",
    "--ttt-accent-x": "#60a5fa",
    "--ttt-accent-o": "#f87171",
    "--ttt-accent-win": "#4ade80",
    "--ttt-accent-focus": "#38bdf8",
    "--ttt-border-soft": "#1e293b",
    "--ttt-border-strong": "#475569",
    "--ttt-shadow-elevation": "0 18px 36px rgba(0, 0, 0, 0.45)",
  },
};

/**
 * Мапа тем за ID. Тримаємо «реєстр» в окремому об’єкті, щоб додати
 * кастомні теми було тривіально (один запис у мапі, без правок UI).
 *
 * Заморожуємо мапу: ніхто не повинен мутувати реєстр у рантаймі —
 * для нової теми треба зробити новий релізе.
 */
export const THEMES: Readonly<Record<ThemeId, Theme>> = Object.freeze({
  light: lightTheme,
  dark: darkTheme,
});

/**
 * Перелік ID тем у порядку, придатному для UI-перемикача (вкладеного
 * у налаштування). Вмисне тільки для відображення; фактичну тему
 * шукай через `THEMES[id]`.
 */
export const THEME_IDS: ReadonlyArray<ThemeId> = ["light", "dark"];

/**
 * Перевіряє, чи рядок є валідним ID теми. Корисно при відновленні з
 * `localStorage`/`URL` або при імпорті JSON-налаштувань.
 */
export function isThemeId(value: unknown): value is ThemeId {
  return value === "light" || value === "dark";
}

/**
 * Безпечне читання теми. Якщо ID неправильний, повертаємо світлу —
 * інакше веб лишиться без CSS-змінних і в темному режимі сторінка
 * виглядатиме як «біле полотно».
 */
export function getTheme(id: ThemeId): Theme {
  return THEMES[id] ?? lightTheme;
}
