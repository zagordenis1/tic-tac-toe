import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRuntimeProvider } from "./ui/contexts/AppRuntimeContext";
import { I18nProvider } from "./ui/contexts/I18nContext";
import { ThemeProvider } from "./ui/contexts/ThemeContext";
import { GameProvider } from "./ui/contexts/GameContext";
import { SettingsProvider } from "./ui/contexts/SettingsContext";
import { App } from "./ui/components/layout/App";
import { createAppRuntime } from "./ui/services/AppRuntime";
import "./styles/index.css";

/**
 * Точка входу клієнтського застосунку. Створюємо рантайм один раз і
 * передаємо його в дерево провайдерів — це гарантує, що сервіси
 * живуть довше за React-дерево й не перевизначаються при HMR.
 *
 * Порядок провайдерів важливий:
 *   1) AppRuntimeProvider — джерело всіх сервісів;
 *   2) I18nProvider — переклад;
 *   3) ThemeProvider — тема;
 *   4) SettingsProvider — користувацькі налаштування;
 *   5) GameProvider — ігровий стан.
 */
const runtime = createAppRuntime();

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AppRuntimeProvider runtime={runtime}>
        <I18nProvider translator={runtime.translator}>
          <ThemeProvider applier={runtime.themeApplier}>
            <SettingsProvider
              repository={runtime.storage.settings}
              initial={runtime.settings}
              onChange={(next, prev) => {
                if (next.locale !== prev.locale) {
                  runtime.translator.setLocale(next.locale);
                }
                if (next.theme !== prev.theme) {
                  runtime.themeApplier.setMode(next.theme);
                }
              }}
            >
              <GameProvider service={runtime.gameService}>
                <App />
              </GameProvider>
            </SettingsProvider>
          </ThemeProvider>
        </I18nProvider>
      </AppRuntimeProvider>
    </StrictMode>,
  );
}
