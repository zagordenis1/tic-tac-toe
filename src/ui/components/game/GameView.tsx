import { useCallback, useEffect, useRef, useState } from "react";
import { Panel } from "../common/Panel";
import { Board } from "./Board";
import { GameStatusView } from "./GameStatusView";
import { GameControls } from "./GameControls";
import { useGame } from "../../hooks/useGame";
import { useAppRuntime } from "../../hooks/useAppRuntime";
import { useSettings } from "../../hooks/useSettings";
import { useTranslation } from "../../hooks/useTranslation";
import { Badge } from "../common/Badge";
import { defaultAIPlayerFactory } from "../../../ai/AIPlayerFactory";
import { ValidationError } from "../../../utils/assert";
import { isWin } from "../../../types/GameStatus";

export interface GameViewProps {
  readonly onRequestNewGame: () => void;
}

/**
 * Композиційний контейнер: збирає дошку, статус та кнопки керування,
 * а також обслуговує AI-цикл — слухає чергу ходів противника-бота і
 * підставляє їх у `gameService.makeMove`. Логіка тут навмисно тонка:
 * UI делегує реальні правила в core/AI.
 */
export function GameView({ onRequestNewGame }: GameViewProps): JSX.Element {
  const { t } = useTranslation();
  const runtime = useAppRuntime();
  const { settings } = useSettings();
  const { service, game, history, lastRejection } = useGame();
  const [aiThinking, setAiThinking] = useState(false);
  const aiAbortRef = useRef<{ aborted: boolean } | null>(null);

  /**
   * Цикл AI: коли поточний гравець — компʼютер і гра не завершена,
   * запускаємо асинхронне обчислення ходу. Викидаємо abort-флаг при
   * зміні гри, щоб не зробити «другий хід» після рестарту.
   */
  useEffect(() => {
    if (game.isOver()) return;
    const current = game.getCurrentPlayer();
    if (!current.isComputer) return;
    const difficulty = current.difficulty ?? settings.aiDifficulty;
    const strategy = defaultAIPlayerFactory.createStrategy(difficulty);
    const token = { aborted: false };
    aiAbortRef.current = token;
    setAiThinking(true);
    runtime.aiController
      .chooseMoveAsync(strategy, game)
      .then((position) => {
        if (token.aborted) return;
        try {
          service.makeMove(position);
        } catch (error) {
          if (!(error instanceof ValidationError)) {
            // eslint-disable-next-line no-console
            console.error("[GameView] AI move failed", error);
          }
        }
      })
      .finally(() => {
        if (token.aborted) return;
        setAiThinking(false);
      });
    return () => {
      token.aborted = true;
    };
  }, [game, service, runtime, settings.aiDifficulty]);

  const handleSelect = useCallback(
    (position: { row: number; col: number }) => {
      if (game.isOver()) return;
      const current = game.getCurrentPlayer();
      if (current.isComputer) return;
      try {
        service.makeMove(position);
      } catch (error) {
        if (!(error instanceof ValidationError)) {
          // eslint-disable-next-line no-console
          console.error("[GameView] human move failed", error);
        }
      }
    },
    [game, service],
  );

  const handleUndo = useCallback(() => {
    service.undo();
    // Якщо після undo попередній хід — теж AI, повторюємо undo, щоб
    // «віддати» хід людині, інакше AI миттєво поверне свій хід.
    setTimeout(() => {
      const next = service.getState();
      if (!next.isOver() && next.getCurrentPlayer().isComputer && service.canUndo()) {
        service.undo();
      }
    }, 0);
  }, [service]);

  const handleRedo = useCallback(() => service.redo(), [service]);
  const handleRestart = useCallback(() => service.restart(), [service]);

  const status = game.getStatus();
  const meta = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone="neutral">
        {t("game.boardSize", { params: { size: game.getBoard().size } })}
      </Badge>
      <Badge tone="neutral">
        {t("game.winLength", { params: { length: game.getWinLength() } })}
      </Badge>
      <Badge tone="neutral">
        {t("game.firstSymbol", { params: { symbol: game.firstSymbol() } })}
      </Badge>
    </div>
  );

  return (
    <Panel
      title={t("app.title")}
      subtitle={t("app.tagline")}
      actions={meta}
      footer={
        <GameControls
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onRestart={handleRestart}
          onNewGame={onRequestNewGame}
        />
      }
    >
      <GameStatusView game={game} aiThinking={aiThinking} />
      <Board
        game={game}
        disabled={aiThinking || game.isOver()}
        onSelect={handleSelect}
        highlightLastMove={settings.highlightLastMove}
      />
      {lastRejection ? (
        <p className="text-sm text-danger" role="alert">
          {lastRejection}
        </p>
      ) : null}
      {isWin(status) ? (
        <p className="text-sm text-ink-muted">
          {t("game.winLength", { params: { length: status.winningLine.length } })}
        </p>
      ) : null}
    </Panel>
  );
}
