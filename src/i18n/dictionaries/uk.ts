import type { Dictionary } from "../Dictionary";

/**
 * Український словник. Тримаємо ключі впорядкованими за «доменами»
 * (`menu`, `game`, `settings`, ...), аби словник читався як зміст
 * UI, а не як випадкова купа рядків.
 *
 * Для рядків зі змінними використовуємо плейсхолдери у фігурних
 * дужках, наприклад `{name}`. Перекладач підмінює їх перед поверненням.
 */
export const ukDictionary: Dictionary = {
  "app.title": "Хрестики-нулики",
  "app.tagline": "Гра, що пам’ятає твою кожну партію",

  "menu.newGame": "Нова гра",
  "menu.continue": "Продовжити збережене",
  "menu.history": "Історія партій",
  "menu.stats": "Статистика",
  "menu.achievements": "Досягнення",
  "menu.settings": "Налаштування",
  "menu.about": "Про застосунок",

  "game.yourTurn": "Твій хід",
  "game.opponentTurn": "Хід суперника",
  "game.aiThinking": "AI обмірковує…",
  "game.draw": "Нічия",
  "game.winner": "Переміг {name}",
  "game.restart": "Почати спочатку",
  "game.undo": "Скасувати хід",
  "game.redo": "Повторити хід",
  "game.surrender": "Здатися",
  "game.boardSize": "Розмір поля {size}×{size}",
  "game.winLength": "Виграшна лінія: {length}",
  "game.firstSymbol": "Першим ходить: {symbol}",
  "game.symbol.x": "X",
  "game.symbol.o": "O",

  "settings.title": "Налаштування",
  "settings.theme": "Тема",
  "settings.theme.light": "Світла",
  "settings.theme.dark": "Темна",
  "settings.theme.system": "Як у системі",
  "settings.locale": "Мова інтерфейсу",
  "settings.aiDifficulty": "Складність AI",
  "settings.aiDifficulty.easy": "Легкий",
  "settings.aiDifficulty.medium": "Середній",
  "settings.aiDifficulty.hard": "Складний",
  "settings.aiDifficulty.insane": "Неможливий",
  "settings.enableSounds": "Звуки",
  "settings.enableAnimations": "Анімації",
  "settings.enableHints": "Підказки",
  "settings.highlightLastMove": "Підсвічувати останній хід",
  "settings.autosave": "Автозбереження партії",
  "settings.aiThinkingDelay": "Пауза AI перед ходом, мс",
  "settings.reset": "Скинути до базових",
  "settings.export": "Експортувати у JSON",
  "settings.import": "Імпортувати з JSON",

  "stats.title": "Статистика",
  "stats.totalGames": "Усього партій",
  "stats.wins": "Перемоги",
  "stats.losses": "Поразки",
  "stats.draws": "Нічиї",
  "stats.winRate": "Відсоток перемог",
  "stats.bestStreak": "Найдовша серія",
  "stats.currentStreak": "Поточна серія",
  "stats.averageDuration": "Середня тривалість",
  "stats.lastPlayed": "Остання партія",
  "stats.empty": "Поки що немає партій. Почни нову гру.",

  "achievements.title": "Досягнення",
  "achievements.locked": "Закрите",
  "achievements.unlocked": "Відкрите",
  "achievements.unlockedAt": "Відкрито {date}",
  "achievements.progress": "Відкрито {unlocked} з {total}",
  "achievements.empty": "Жодного досягнення поки що.",

  "history.title": "Історія партій",
  "history.empty": "Історія порожня.",
  "history.export": "Експорт",
  "history.import": "Імпорт",
  "history.clear": "Очистити історію",
  "history.confirmClear": "Видалити всю історію партій? Дію не можна скасувати.",
  "history.duration": "Тривалість",
  "history.moves": "Ходів",
  "history.opponent": "Суперник",
  "history.result.win": "Перемога",
  "history.result.loss": "Поразка",
  "history.result.draw": "Нічия",

  "common.player.human": "Людина",
  "common.player.ai": "AI",
  "common.confirm": "Підтвердити",
  "common.cancel": "Скасувати",
  "common.save": "Зберегти",
  "common.close": "Закрити",
  "common.yes": "Так",
  "common.no": "Ні",
  "common.unknown": "Невідомо",

  "errors.invalidSlot": "Збережена партія пошкоджена і не може бути відновлена.",
  "errors.invalidImport": "Не вдалося імпортувати: формат файлу не валідний.",

  "plural.moves": {
    one: "{count} хід",
    few: "{count} ходи",
    many: "{count} ходів",
  },
  "plural.games": {
    one: "{count} партія",
    few: "{count} партії",
    many: "{count} партій",
  },
  "plural.seconds": {
    one: "{count} секунда",
    few: "{count} секунди",
    many: "{count} секунд",
  },
  "plural.minutes": {
    one: "{count} хвилина",
    few: "{count} хвилини",
    many: "{count} хвилин",
  },
  "plural.days": {
    one: "{count} день",
    few: "{count} дні",
    many: "{count} днів",
  },
};
