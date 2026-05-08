import { Button } from "../common/Button";
import { useTranslation } from "../../hooks/useTranslation";

export interface GameControlsProps {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onRestart: () => void;
  readonly onNewGame: () => void;
}

/**
 * Панель керування партією: undo, redo, перезапуск, нова гра.
 * Намагаємось тримати кнопки великими і однаковими — UI має «дихати»
 * на дотику, бо мобільні пристрої — основний таргет.
 */
export function GameControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRestart,
  onNewGame,
}: GameControlsProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={onUndo} disabled={!canUndo}>
        {t("game.undo")}
      </Button>
      <Button variant="secondary" onClick={onRedo} disabled={!canRedo}>
        {t("game.redo")}
      </Button>
      <Button variant="ghost" onClick={onRestart}>
        {t("game.restart")}
      </Button>
      <Button variant="primary" onClick={onNewGame}>
        {t("menu.newGame")}
      </Button>
    </div>
  );
}
