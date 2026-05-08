import type { Achievement } from "./Achievement";

/**
 * Декларативний реєстр досягнень. Кожне досягнення — це обʼєкт з
 * предикатом, що дивиться на поточну агреговану статистику та
 * останню партію. Жодного звертання до сховищ — це робить тести
 * тривіальними і дозволяє використовувати реєстр у будь-якому
 * середовищі (зокрема, у SSR/тестах).
 *
 * Ми навмисно експортуємо плоский масив, а не клас. Так UI
 * простіше: показати список усіх досягнень = `ACHIEVEMENT_CATALOG`.
 */
export const ACHIEVEMENT_CATALOG: ReadonlyArray<Achievement> = [
  {
    id: "first-blood",
    title: "Перша кров",
    description: "Виграйте свою першу партію.",
    category: "milestones",
    icon: "🩸",
    tier: "bronze",
    isUnlocked: ({ wins }) => wins >= 1,
  },
  {
    id: "ten-victories",
    title: "Десятка",
    description: "Виграйте 10 партій.",
    category: "milestones",
    icon: "🔟",
    tier: "silver",
    isUnlocked: ({ wins }) => wins >= 10,
  },
  {
    id: "century",
    title: "Сторіччя",
    description: "Зіграйте 100 партій (перемог + поразок + нічиїх).",
    category: "milestones",
    icon: "💯",
    tier: "gold",
    isUnlocked: ({ games }) => games >= 100,
  },
  {
    id: "streak-three",
    title: "Хет-трик",
    description: "Виграйте три партії підряд.",
    category: "streak",
    icon: "🔥",
    tier: "bronze",
    isUnlocked: ({ currentWinStreak, bestWinStreak }) =>
      currentWinStreak >= 3 || bestWinStreak >= 3,
  },
  {
    id: "streak-seven",
    title: "Сім підряд",
    description: "Сім перемог поспіль — справжня форма.",
    category: "streak",
    icon: "⚡",
    tier: "gold",
    isUnlocked: ({ bestWinStreak }) => bestWinStreak >= 7,
  },
  {
    id: "beat-hard",
    title: "Не так уже й складно",
    description: "Перемогти AI на рівні «hard».",
    category: "skill",
    icon: "🤖",
    tier: "silver",
    isUnlocked: ({ lastMatch }) =>
      !!lastMatch &&
      lastMatch.result === "win" &&
      lastMatch.opponentType === "ai" &&
      lastMatch.opponentDifficulty === "hard",
  },
  {
    id: "beat-insane",
    title: "Хто тут insane?",
    description: "Перемогти AI на рівні «insane».",
    category: "skill",
    icon: "🧠",
    tier: "gold",
    isUnlocked: ({ lastMatch }) =>
      !!lastMatch &&
      lastMatch.result === "win" &&
      lastMatch.opponentType === "ai" &&
      lastMatch.opponentDifficulty === "insane",
  },
  {
    id: "speed-run",
    title: "Молниєносна перемога",
    description: "Перемогти за 5 ходів або менше.",
    category: "speed",
    icon: "⚡",
    tier: "bronze",
    isUnlocked: ({ lastMatch }) =>
      !!lastMatch && lastMatch.result === "win" && lastMatch.moveCount <= 5,
  },
  {
    id: "marathon",
    title: "Марафонець",
    description: "Зіграти партію довше пʼяти хвилин.",
    category: "speed",
    icon: "🐢",
    tier: "bronze",
    isUnlocked: ({ lastMatch }) =>
      !!lastMatch && lastMatch.durationMs >= 5 * 60 * 1000,
  },
  {
    id: "explorer",
    title: "Дослідник",
    description: "Зіграти на дошці більшій за 3×3.",
    category: "exploration",
    icon: "🗺️",
    tier: "bronze",
    isUnlocked: ({ lastMatch }) => !!lastMatch && lastMatch.boardSize > 3,
  },
  {
    id: "big-board",
    title: "Велика дошка",
    description: "Перемогти на дошці 6×6.",
    category: "exploration",
    icon: "🪟",
    tier: "gold",
    isUnlocked: ({ lastMatch }) =>
      !!lastMatch && lastMatch.result === "win" && lastMatch.boardSize >= 6,
  },
];

/**
 * Швидке шукання досягнення за id. Корисно для UI у сценаріях,
 * де ми вже знаємо, що отримали запис «розблоковане».
 */
export function findAchievement(id: string): Achievement | null {
  return ACHIEVEMENT_CATALOG.find((a) => a.id === id) ?? null;
}
