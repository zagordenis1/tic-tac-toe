import type { TabId } from "./tabs";
import { useTranslation } from "../../hooks/useTranslation";

export interface SidebarProps {
  readonly active: TabId;
  readonly onChange: (tab: TabId) => void;
}

interface TabDescriptor {
  readonly id: TabId;
  readonly translationKey:
    | "menu.newGame"
    | "menu.history"
    | "menu.stats"
    | "menu.achievements"
    | "menu.settings";
  readonly icon: string;
}

const TABS: ReadonlyArray<TabDescriptor> = [
  { id: "game", translationKey: "menu.newGame", icon: "♟️" },
  { id: "history", translationKey: "menu.history", icon: "🕘" },
  { id: "stats", translationKey: "menu.stats", icon: "📊" },
  { id: "achievements", translationKey: "menu.achievements", icon: "🏅" },
  { id: "settings", translationKey: "menu.settings", icon: "⚙️" },
];

/**
 * Бокова панель з закладками. На вузьких екранах перетворюється
 * на горизонтальний скрол — без bootstrap'у/гамбургеру, бо вкладок
 * лише пʼять.
 */
export function Sidebar({ active, onChange }: SidebarProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t("menu.settings")}
      className="flex flex-row gap-1 overflow-x-auto rounded-2xl border border-line bg-canvas-subtle p-1 sm:flex-col sm:overflow-x-visible"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
              "focus-visible:outline-none focus-visible:shadow-focus",
              isActive
                ? "bg-accent text-accent-contrast"
                : "text-ink-muted hover:text-ink hover:bg-canvas",
            ].join(" ")}
          >
            <span aria-hidden className="text-base">
              {tab.icon}
            </span>
            <span>{t(tab.translationKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}
