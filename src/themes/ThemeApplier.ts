import type { ThemeMode } from "../persistence/Settings";
import type { Theme, ThemeId } from "./Theme";
import { THEMES, getTheme, isThemeId } from "./ThemeRegistry";

/**
 * Накладальник тем. Повертає поточну застосовану тему та накочує
 * CSS-змінні на `document.documentElement`. Для серверного середовища
 * та тестів без DOM `target` опційний — у такому випадку методи
 * лишаються no-op, але збереження стану працює.
 *
 * Окрім самих кольорів, виставляє атрибут `data-theme` на корені, щоб
 * Tailwind (із селектором `[data-theme="dark"]`) міг змінювати стиль
 * без додаткових JS-перерендерів.
 */
export class ThemeApplier {
  private readonly listeners = new Set<(theme: Theme) => void>();
  private current: Theme;
  private mediaQuery: MediaQueryList | null;
  private readonly mediaListener: ((event: MediaQueryListEvent) => void) | null;
  private mode: ThemeMode;

  public constructor(
    private readonly target: HTMLElement | null = typeof document !== "undefined"
      ? document.documentElement
      : null,
    initialMode: ThemeMode = "system",
  ) {
    this.mode = initialMode;
    this.mediaQuery =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;
    this.mediaListener = this.mediaQuery
      ? () => {
          if (this.mode === "system") {
            this.apply(this.resolveSystemTheme());
          }
        }
      : null;
    if (this.mediaQuery && this.mediaListener) {
      this.mediaQuery.addEventListener("change", this.mediaListener);
    }
    this.current = this.resolveTheme(initialMode);
    this.apply(this.current);
  }

  public getMode(): ThemeMode {
    return this.mode;
  }

  public getCurrent(): Theme {
    return this.current;
  }

  /**
   * Перемикає або фіксований ID теми, або «system». Внутрішньо
   * кешуємо вибраний `mode`, щоб подальші зміни системної теми
   * автоматично відлунювали лише за `mode === "system"`.
   */
  public setMode(mode: ThemeMode): void {
    this.mode = mode;
    this.apply(this.resolveTheme(mode));
  }

  public setThemeId(id: ThemeId): void {
    if (!isThemeId(id)) return;
    this.setMode(id);
  }

  /**
   * Підписка на зміну активної теми (Observer). Використовується UI,
   * щоб перерендерити компоненти без додаткового глобального стейту.
   */
  public subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Прибирає підписки і media-listener. Корисно у SPA з гарячою
   * заміною модулів та в юніт-тестах.
   */
  public dispose(): void {
    if (this.mediaQuery && this.mediaListener) {
      this.mediaQuery.removeEventListener("change", this.mediaListener);
    }
    this.listeners.clear();
  }

  private apply(theme: Theme): void {
    this.current = theme;
    if (this.target) {
      for (const [token, value] of Object.entries(theme.tokens)) {
        this.target.style.setProperty(token, value);
      }
      this.target.setAttribute("data-theme", theme.id);
      this.target.classList.toggle("dark", theme.id === "dark");
    }
    for (const listener of this.listeners) {
      listener(theme);
    }
  }

  private resolveTheme(mode: ThemeMode): Theme {
    if (mode === "system") return this.resolveSystemTheme();
    return getTheme(mode);
  }

  private resolveSystemTheme(): Theme {
    if (this.mediaQuery && this.mediaQuery.matches) {
      return THEMES.dark;
    }
    return THEMES.light;
  }
}
