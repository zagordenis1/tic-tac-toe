/**
 * Barrel модуля тем. Тримає публічну поверхню чітко: ззовні видно
 * лише `Theme`, `ThemeId`, реєстр і накладальник.
 */
export type { Theme, ThemeId, ThemeTokens } from "./Theme";
export {
  THEMES,
  THEME_IDS,
  getTheme,
  isThemeId,
} from "./ThemeRegistry";
export { ThemeApplier } from "./ThemeApplier";
