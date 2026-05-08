import type { Game } from "../../../core/Game";
import { isDraw, isWin } from "../../../types/GameStatus";
import { Badge } from "../common/Badge";
import { useTranslation } from "../../hooks/useTranslation";

export interface GameStatusViewProps {
  readonly game: Game;
  readonly aiThinking: boolean;
}

/**
 * Текстовий індикатор стану гри: чий хід / переможець / нічия.
 * Використовуємо переклади (`game.yourTurn`, `game.opponentTurn` тощо),
 * аби UI коректно зміщувався при зміні локалі.
 */
export function GameStatusView({ game, aiThinking }: GameStatusViewProps): JSX.Element {
  const { t } = useTranslation();
  const status = game.getStatus();
  const current = game.getCurrentPlayer();

  if (isWin(status)) {
    const winner = status.winner === game.getPlayerX().symbol ? game.getPlayerX() : game.getPlayerO();
    return (
      <div className="flex items-center gap-2" role="status" aria-live="polite">
        <Badge tone="success">{t("history.result.win")}</Badge>
        <span className="text-base font-medium text-ink">
          {t("game.winner", { params: { name: winner.name } })}
        </span>
      </div>
    );
  }

  if (isDraw(status)) {
    return (
      <div className="flex items-center gap-2" role="status" aria-live="polite">
        <Badge tone="warning">{t("history.result.draw")}</Badge>
        <span className="text-base font-medium text-ink">{t("game.draw")}</span>
      </div>
    );
  }

  if (aiThinking) {
    return (
      <div className="flex items-center gap-2" role="status" aria-live="polite">
        <Badge tone="accent">{t("common.player.ai")}</Badge>
        <span className="text-base text-ink-muted">{t("game.aiThinking")}</span>
      </div>
    );
  }

  const isHuman = !current.isComputer;
  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <Badge tone={current.symbol === "X" ? "accent" : "danger"}>
        {current.symbol}
      </Badge>
      <span className="text-base font-medium text-ink">
        {isHuman ? t("game.yourTurn") : t("game.opponentTurn")}
      </span>
    </div>
  );
}
