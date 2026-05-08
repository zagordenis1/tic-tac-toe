/**
 * Перелік ID вкладок основної навігації. Виносимо в окремий модуль,
 * щоб уникнути циклічних імпортів між `Sidebar`, `App` та контейнером
 * табів.
 */
export type TabId = "game" | "history" | "stats" | "achievements" | "settings";

export const ALL_TABS: ReadonlyArray<TabId> = [
  "game",
  "history",
  "stats",
  "achievements",
  "settings",
];
