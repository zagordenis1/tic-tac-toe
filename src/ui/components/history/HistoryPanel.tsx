import { useCallback, useMemo, useState } from "react";
import { Panel } from "../common/Panel";
import { EmptyState } from "../common/EmptyState";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { useAppRuntime } from "../../hooks/useAppRuntime";
import { useTranslation } from "../../hooks/useTranslation";
import { useGame } from "../../hooks/useGame";
import { useSettings } from "../../hooks/useSettings";
import { isDraw, isWin } from "../../../types/GameStatus";
import type { MatchRecord } from "../../../persistence/Match";

/**
 * Сторінка історії партій. Показуємо список останніх записів у
 * зворотному порядку (новіші згори). Дозволяємо очистити історію
 * через підтвердження.
 *
 * Експорт/імпорт лишаємо на майбутні ітерації — поточний UI
 * розрахований на оперативний перегляд.
 */
export function HistoryPanel(): JSX.Element {
  const { t, locale } = useTranslation();
  const runtime = useAppRuntime();
  const { game } = useGame();
  const { settings } = useSettings();
  const [confirmClear, setConfirmClear] = useState(false);
  const [tick, setTick] = useState(0);

  const matches = useMemo(() => {
    void game; // оновлюємось після зміни стану гри
    void tick;
    return [...runtime.storage.matches.listAll()].reverse();
  }, [runtime, game, tick]);

  const handleClear = useCallback(() => {
    runtime.storage.matches.deleteAll();
    setConfirmClear(false);
    setTick((value) => value + 1);
  }, [runtime]);

  if (matches.length === 0) {
    return (
      <Panel title={t("history.title")}>
        <EmptyState
          title={t("history.title")}
          description={t("history.empty")}
        />
      </Panel>
    );
  }

  return (
    <Panel
      title={t("history.title")}
      footer={
        <Button variant="danger" onClick={() => setConfirmClear(true)}>
          {t("history.clear")}
        </Button>
      }
    >
      <ul className="flex flex-col gap-2">
        {matches.map((record) => (
          <HistoryRow
            key={record.id}
            record={record}
            humanName={settings.humanName}
            locale={locale}
          />
        ))}
      </ul>
      <Modal
        open={confirmClear}
        title={t("history.clear")}
        onClose={() => setConfirmClear(false)}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" onClick={handleClear}>
              {t("common.confirm")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink">{t("history.confirmClear")}</p>
      </Modal>
    </Panel>
  );
}

interface HistoryRowProps {
  readonly record: MatchRecord;
  readonly humanName: string;
  readonly locale: string;
}

function HistoryRow({ record, humanName, locale }: HistoryRowProps): JSX.Element {
  const { t } = useTranslation();
  const opponent = record.playerX.name === humanName ? record.playerO : record.playerX;
  const human = record.playerX.name === humanName ? record.playerX : record.playerO;

  let tone: "success" | "danger" | "warning" = "warning";
  let label = t("history.result.draw");
  if (isWin(record.status)) {
    if (record.status.winner === human.symbol) {
      tone = "success";
      label = t("history.result.win");
    } else {
      tone = "danger";
      label = t("history.result.loss");
    }
  } else if (!isDraw(record.status)) {
    label = t("common.unknown");
  }

  const playedAt = new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(record.playedAt));

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-3 py-2">
      <div className="flex items-center gap-2">
        <Badge tone={tone}>{label}</Badge>
        <span className="text-sm font-medium text-ink">{opponent.name}</span>
        <Badge tone="neutral">
          {opponent.type === "ai"
            ? t("common.player.ai")
            : t("common.player.human")}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-ink-muted">
        <span>{`${record.boardSize}×${record.boardSize}`}</span>
        <span>
          {t("history.moves")}: {record.moves.length}
        </span>
        <span>
          {t("history.duration")}: {formatDuration(record.durationMs)}
        </span>
        <span>{playedAt}</span>
      </div>
    </li>
  );
}

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0:00";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
