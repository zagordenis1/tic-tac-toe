import {
  createContext,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Game } from "../../core/Game";
import type { EventfulGameService } from "../../events/EventfulGameService";

/**
 * Знімок історії команд: чи можна undo/redo та розмір стеків. UI
 * використовує це для увімкнення/вимкнення кнопок без зайвого
 * читання внутрішніх обʼєктів `CommandHistory`.
 */
export interface HistorySnapshot {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly pastSize: number;
  readonly futureSize: number;
}

export interface GameContextValue {
  readonly service: EventfulGameService;
  readonly game: Game;
  readonly history: HistorySnapshot;
  readonly lastRejection: string | null;
}

export const GameContext = createContext<GameContextValue | null>(null);

export interface GameProviderProps {
  readonly service: EventfulGameService;
  readonly children: ReactNode;
}

/**
 * Провайдер ігрового стану. Підписується на ключові події шини й
 * зберігає у локальному `useState` останній знімок гри + знімок
 * історії команд. Завдяки цьому компоненти UI отримують щонайменше
 * залежну інформацію без власних підписок.
 */
export function GameProvider({ service, children }: GameProviderProps): JSX.Element {
  const [game, setGame] = useState<Game>(() => service.getState());
  const [history, setHistory] = useState<HistorySnapshot>(() => ({
    canUndo: service.canUndo(),
    canRedo: service.canRedo(),
    pastSize: 0,
    futureSize: 0,
  }));
  const [lastRejection, setLastRejection] = useState<string | null>(null);

  useEffect(() => {
    const bus = service.getBus();
    const events = ["game:started", "game:moveMade", "game:undo", "game:redo", "game:restarted", "game:ended"] as const;
    const offs = events.map((event) =>
      bus.on(event, ({ game: nextGame }) => setGame(nextGame)),
    );
    const offHistory = bus.on("history:changed", (payload) => {
      setHistory({
        canUndo: payload.canUndo,
        canRedo: payload.canRedo,
        pastSize: payload.pastSize,
        futureSize: payload.futureSize,
      });
    });
    const offRejected = bus.on("game:moveRejected", ({ reason }) => {
      setLastRejection(reason);
    });
    return () => {
      for (const off of offs) off();
      offHistory();
      offRejected();
    };
  }, [service]);

  const value = useMemo<GameContextValue>(
    () => ({ service, game, history, lastRejection }),
    [service, game, history, lastRejection],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
