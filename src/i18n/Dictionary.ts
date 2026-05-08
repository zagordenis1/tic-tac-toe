import type { PluralForm } from "./pluralRules";

/**
 * Тип значення словника. Або одиничний рядок (звичайний переклад), або
 * мапа `PluralForm → string`, що дозволяє узгоджено обʼєднати множинні
 * форми. Тримаємо опис рядковим — ніяких функцій-«джерел» у словнику,
 * щоб JSON-експорт/імпорт лишився можливим без додаткової серіалізації.
 */
export type DictionaryEntry = string | Partial<Record<PluralForm, string>>;

/**
 * Перелік ключів словника. Робимо TypeScript нашим контролером
 * перекладів: пропустив ключ — компіляція впаде. Замість плоского
 * `Record<string, string>` явний union демонструє, скільки рядків
 * локалізує застосунок.
 */
export type TranslationKey =
  | "app.title"
  | "app.tagline"
  | "menu.newGame"
  | "menu.continue"
  | "menu.history"
  | "menu.stats"
  | "menu.achievements"
  | "menu.settings"
  | "menu.about"
  | "game.yourTurn"
  | "game.opponentTurn"
  | "game.aiThinking"
  | "game.draw"
  | "game.winner"
  | "game.restart"
  | "game.undo"
  | "game.redo"
  | "game.surrender"
  | "game.boardSize"
  | "game.winLength"
  | "game.firstSymbol"
  | "game.symbol.x"
  | "game.symbol.o"
  | "settings.title"
  | "settings.theme"
  | "settings.theme.light"
  | "settings.theme.dark"
  | "settings.theme.system"
  | "settings.locale"
  | "settings.aiDifficulty"
  | "settings.aiDifficulty.easy"
  | "settings.aiDifficulty.medium"
  | "settings.aiDifficulty.hard"
  | "settings.aiDifficulty.insane"
  | "settings.enableSounds"
  | "settings.enableAnimations"
  | "settings.enableHints"
  | "settings.highlightLastMove"
  | "settings.autosave"
  | "settings.aiThinkingDelay"
  | "settings.reset"
  | "settings.export"
  | "settings.import"
  | "stats.title"
  | "stats.totalGames"
  | "stats.wins"
  | "stats.losses"
  | "stats.draws"
  | "stats.winRate"
  | "stats.bestStreak"
  | "stats.currentStreak"
  | "stats.averageDuration"
  | "stats.lastPlayed"
  | "stats.empty"
  | "achievements.title"
  | "achievements.locked"
  | "achievements.unlocked"
  | "achievements.unlockedAt"
  | "achievements.progress"
  | "achievements.empty"
  | "history.title"
  | "history.empty"
  | "history.export"
  | "history.import"
  | "history.clear"
  | "history.confirmClear"
  | "history.duration"
  | "history.moves"
  | "history.opponent"
  | "history.result.win"
  | "history.result.loss"
  | "history.result.draw"
  | "common.player.human"
  | "common.player.ai"
  | "common.confirm"
  | "common.cancel"
  | "common.save"
  | "common.close"
  | "common.yes"
  | "common.no"
  | "common.unknown"
  | "errors.invalidSlot"
  | "errors.invalidImport"
  | "plural.moves"
  | "plural.games"
  | "plural.seconds"
  | "plural.minutes"
  | "plural.days";

/**
 * Контракт словника: повне покриття всіх ключів. Усі словники
 * зобовʼязані надати кожен ключ — це ловить пропуски на компіляції.
 */
export type Dictionary = Readonly<Record<TranslationKey, DictionaryEntry>>;
