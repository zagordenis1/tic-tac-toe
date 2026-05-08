import { useCallback, useState } from "react";
import { useGame } from "../../hooks/useGame";
import { useSettings } from "../../hooks/useSettings";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { AchievementToast } from "./AchievementToast";
import { GameView } from "../game/GameView";
import { NewGameDialog, type NewGameOverrides } from "../game/NewGameDialog";
import { SettingsPanel } from "../settings/SettingsPanel";
import { StatsPanel } from "../stats/StatsPanel";
import { AchievementsPanel } from "../achievements/AchievementsPanel";
import { HistoryPanel } from "../history/HistoryPanel";
import type { TabId } from "./tabs";
import { Game } from "../../../core/Game";
import { makePlayer } from "../../../core/Player";
import type { Player } from "../../../core/Player";
import type { PlayerSymbol } from "../../../types/Symbol";
import type { Difficulty } from "../../../types/Difficulty";
import { defaultAIPlayerFactory } from "../../../ai/AIPlayerFactory";

/**
 * Кореневий компонент застосунку. Відповідальність:
 *   - тримає стан активної вкладки;
 *   - перетворює вибір користувача в новій грі на нову `Game` і
 *     передає її до `EventfulGameService.replaceState()`;
 *   - оркеструє відображення панелей через простий switch.
 *
 * Ми навмисно тримаємо логіку перемикання вкладок тут, а не в
 * сторінці-роутері: проєкт SPA на одному екрані, кожна вкладка —
 * це окрема панель усередині сітки.
 */
export function App(): JSX.Element {
  const [tab, setTab] = useState<TabId>("game");
  const [isNewGameOpen, setNewGameOpen] = useState(false);
  const { settings, update } = useSettings();
  const { service } = useGame();

  const handleConfirmNewGame = useCallback(
    (overrides: NewGameOverrides) => {
      const opponentSymbol: PlayerSymbol = overrides.humanSymbol === "X" ? "O" : "X";
      const human = buildHumanPlayer(settings.humanName, overrides.humanSymbol);
      const opponent = buildOpponentPlayer(
        opponentSymbol,
        overrides.opponentType,
        overrides.aiDifficulty,
      );
      const playerX = overrides.humanSymbol === "X" ? human : opponent;
      const playerO = overrides.humanSymbol === "X" ? opponent : human;
      const next = Game.start({
        boardSize: overrides.boardSize,
        winLength: overrides.winLength,
        firstSymbol: overrides.firstSymbol,
        playerX,
        playerO,
      });
      service.replaceState(next);
      if (overrides.persistAsDefault) {
        update({
          boardSize: overrides.boardSize,
          winLength: overrides.winLength,
          humanSymbol: overrides.humanSymbol,
          firstSymbol: overrides.firstSymbol,
          opponentType: overrides.opponentType,
          aiDifficulty: overrides.aiDifficulty,
        });
      }
      setNewGameOpen(false);
      setTab("game");
    },
    [service, settings.humanName, update],
  );

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6">
        <Header />
        <div className="grid gap-6 sm:grid-cols-[12rem_1fr]">
          <Sidebar active={tab} onChange={setTab} />
          <main className="min-w-0">
            {tab === "game" ? (
              <GameView onRequestNewGame={() => setNewGameOpen(true)} />
            ) : null}
            {tab === "history" ? <HistoryPanel /> : null}
            {tab === "stats" ? <StatsPanel /> : null}
            {tab === "achievements" ? <AchievementsPanel /> : null}
            {tab === "settings" ? <SettingsPanel /> : null}
          </main>
        </div>
      </div>
      <NewGameDialog
        open={isNewGameOpen}
        defaults={settings}
        onCancel={() => setNewGameOpen(false)}
        onConfirm={handleConfirmNewGame}
      />
      <AchievementToast />
    </div>
  );
}

function buildHumanPlayer(name: string, symbol: PlayerSymbol): Player {
  return makePlayer({
    id: `human:${name}`,
    name,
    symbol,
    isComputer: false,
    difficulty: null,
  });
}

function buildOpponentPlayer(
  symbol: PlayerSymbol,
  opponentType: "human" | "ai",
  difficulty: Difficulty,
): Player {
  if (opponentType === "ai") {
    return makePlayer({
      id: `ai:${difficulty}`,
      name: defaultAIPlayerFactory.botName(difficulty),
      symbol,
      isComputer: true,
      difficulty,
    });
  }
  return makePlayer({
    id: "human:Гравець 2",
    name: "Гравець 2",
    symbol,
    isComputer: false,
    difficulty: null,
  });
}
