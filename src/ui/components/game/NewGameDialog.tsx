import { useEffect, useMemo, useState } from "react";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { Select } from "../common/Select";
import { SegmentedControl } from "../common/SegmentedControl";
import { Toggle } from "../common/Toggle";
import {
  MAX_BOARD_SIZE,
  MIN_BOARD_SIZE,
} from "../../../utils/constants";
import { ALL_DIFFICULTIES } from "../../../types/Difficulty";
import type { Difficulty } from "../../../types/Difficulty";
import type { OpponentType, UserSettings } from "../../../persistence/Settings";
import type { PlayerSymbol } from "../../../types/Symbol";
import { useTranslation } from "../../hooks/useTranslation";

export interface NewGameDialogProps {
  readonly open: boolean;
  readonly defaults: UserSettings;
  readonly onCancel: () => void;
  readonly onConfirm: (overrides: NewGameOverrides) => void;
}

/**
 * Параметри, які користувач обирає для нової партії. Це підмножина
 * `UserSettings` — саме ті поля, що впливають на старт гри.
 */
export interface NewGameOverrides {
  readonly boardSize: number;
  readonly winLength: number;
  readonly humanSymbol: PlayerSymbol;
  readonly firstSymbol: PlayerSymbol;
  readonly opponentType: OpponentType;
  readonly aiDifficulty: Difficulty;
  readonly persistAsDefault: boolean;
}

/**
 * Допустимі довжини виграшної лінії залежно від розміру дошки.
 * Не показуємо неможливі комбінації (наприклад, 5 в ряд на 3×3).
 */
function winLengthsFor(boardSize: number): number[] {
  const min = 3;
  const max = boardSize;
  const result: number[] = [];
  for (let length = min; length <= max; length += 1) result.push(length);
  return result;
}

/**
 * Діалог «Нова гра». Показує налаштування партії і запускає її через
 * колбек. Свідомо не торкається `gameService` напряму — це робить
 * `App` після підтвердження.
 */
export function NewGameDialog({
  open,
  defaults,
  onCancel,
  onConfirm,
}: NewGameDialogProps): JSX.Element {
  const { t } = useTranslation();
  const [boardSize, setBoardSize] = useState<number>(defaults.boardSize);
  const [winLength, setWinLength] = useState<number>(defaults.winLength);
  const [humanSymbol, setHumanSymbol] = useState<PlayerSymbol>(defaults.humanSymbol);
  const [firstSymbol, setFirstSymbol] = useState<PlayerSymbol>(defaults.firstSymbol);
  const [opponentType, setOpponentType] = useState<OpponentType>(defaults.opponentType);
  const [aiDifficulty, setAiDifficulty] = useState<Difficulty>(defaults.aiDifficulty);
  const [persist, setPersist] = useState<boolean>(true);

  // Кожного разу, коли діалог відкривається, синхронізуємо локальний
  // стан із поточними налаштуваннями. Інакше зміни «застрягають».
  useEffect(() => {
    if (!open) return;
    setBoardSize(defaults.boardSize);
    setWinLength(defaults.winLength);
    setHumanSymbol(defaults.humanSymbol);
    setFirstSymbol(defaults.firstSymbol);
    setOpponentType(defaults.opponentType);
    setAiDifficulty(defaults.aiDifficulty);
    setPersist(true);
  }, [open, defaults]);

  // Обмежуємо `winLength` валідним діапазоном, коли змінився
  // розмір дошки. Без цього можна випадково потрапити в стан,
  // де `winLength > boardSize`.
  useEffect(() => {
    if (winLength > boardSize) setWinLength(boardSize);
    if (winLength < 3) setWinLength(3);
  }, [boardSize, winLength]);

  const sizeOptions = useMemo(() => {
    const options = [];
    for (let size = MIN_BOARD_SIZE; size <= MAX_BOARD_SIZE; size += 1) {
      options.push({ value: String(size), label: `${size}×${size}` });
    }
    return options;
  }, []);

  const winOptions = useMemo(
    () =>
      winLengthsFor(boardSize).map((length) => ({
        value: String(length),
        label: String(length),
      })),
    [boardSize],
  );

  const difficultyOptions = useMemo(
    () =>
      ALL_DIFFICULTIES.map((difficulty) => ({
        value: difficulty,
        label: t(`settings.aiDifficulty.${difficulty}` as const),
      })),
    [t],
  );

  return (
    <Modal
      open={open}
      title={t("menu.newGame")}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              onConfirm({
                boardSize,
                winLength,
                humanSymbol,
                firstSymbol,
                opponentType,
                aiDifficulty,
                persistAsDefault: persist,
              })
            }
          >
            {t("common.confirm")}
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label={t("game.boardSize", { params: { size: boardSize } })}
          value={String(boardSize)}
          onChange={(value) => setBoardSize(Number(value))}
          options={sizeOptions}
        />
        <Select
          label={t("game.winLength", { params: { length: winLength } })}
          value={String(winLength)}
          onChange={(value) => setWinLength(Number(value))}
          options={winOptions}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink">{t("game.firstSymbol", { params: { symbol: firstSymbol } })}</span>
        <SegmentedControl
          ariaLabel={t("game.firstSymbol", { params: { symbol: firstSymbol } })}
          value={firstSymbol}
          onChange={(value) => setFirstSymbol(value)}
          items={[
            { value: "X", label: "X" },
            { value: "O", label: "O" },
          ]}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink">{t("common.player.human")}</span>
        <SegmentedControl
          ariaLabel={t("common.player.human")}
          value={humanSymbol}
          onChange={(value) => setHumanSymbol(value)}
          items={[
            { value: "X", label: "X" },
            { value: "O", label: "O" },
          ]}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink">{t("history.opponent")}</span>
        <SegmentedControl<OpponentType>
          ariaLabel={t("history.opponent")}
          value={opponentType}
          onChange={(value) => setOpponentType(value)}
          items={[
            { value: "ai", label: t("common.player.ai") },
            { value: "human", label: t("common.player.human") },
          ]}
        />
      </div>
      {opponentType === "ai" ? (
        <Select
          label={t("settings.aiDifficulty")}
          value={aiDifficulty}
          onChange={(value) => setAiDifficulty(value as Difficulty)}
          options={difficultyOptions}
        />
      ) : null}
      <Toggle
        label={t("common.save")}
        description={t("settings.autosave")}
        checked={persist}
        onChange={setPersist}
      />
    </Modal>
  );
}
