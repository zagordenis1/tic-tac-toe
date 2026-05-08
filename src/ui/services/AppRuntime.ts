import { Game } from "../../core/Game";
import { makePlayer } from "../../core/Player";
import type { Player } from "../../core/Player";
import { GameCommandService } from "../../commands/GameCommandService";
import { EventBus } from "../../events/EventBus";
import type { GameEventMap } from "../../events/GameEvents";
import { EventfulGameService } from "../../events/EventfulGameService";
import { MoveCounter } from "../../events/subscribers/MoveCounter";
import { HistoryRecorder } from "../../events/subscribers/HistoryRecorder";
import { defaultAIPlayerFactory } from "../../ai/AIPlayerFactory";
import { AIController } from "../../ai/AIController";
import { Translator } from "../../i18n/Translator";
import { ThemeApplier } from "../../themes/ThemeApplier";
import {
  createDefaultStorage,
  type StorageBundle,
} from "../../persistence/StorageRegistry";
import { PersistenceCoordinator } from "../../persistence/PersistenceCoordinator";
import { SaveSlotMapper } from "../../persistence/mappers/SaveSlotMapper";
import {
  DEFAULT_USER_SETTINGS,
  type UserSettings,
} from "../../persistence/Settings";
import { AchievementEvaluator } from "../../achievements/AchievementEvaluator";
import { AchievementRepository } from "../../achievements/AchievementRepository";
import {
  AchievementSubscriber,
  type AchievementUnlockedListener,
} from "../../achievements/AchievementSubscriber";
import type { PlayerSymbol } from "../../types/Symbol";

/**
 * Композитний рантайм застосунку. Тримає всі довгоживучі сервіси,
 * створені одразу під час старту: переклад, тема, сховище, ігрова
 * шина, сервіс команд, AI-контролер, координатор автозбереження
 * та підписники досягнень.
 *
 * Це класичний контейнер залежностей: React-дерево не створює
 * сервіси в `useEffect`, а просто читає їх з контексту. Такий підхід
 * корисний з кількох причин:
 *   - синглтоновані обʼєкти (`Translator`, `ThemeApplier`) не
 *     перевизначаються між рендерами;
 *   - тести можуть передати власний `AppRuntime`, не міняючи
 *     React-компоненти;
 *   - HMR не «двоїть» підписки: при оновленні UI ми лишаємо ту саму
 *     шину і ті самі лічильники.
 */
export interface AppRuntime {
  readonly storage: StorageBundle;
  readonly settings: UserSettings;
  readonly translator: Translator;
  readonly themeApplier: ThemeApplier;
  readonly bus: EventBus<GameEventMap>;
  readonly commandService: GameCommandService;
  readonly gameService: EventfulGameService;
  readonly moveCounter: MoveCounter;
  readonly historyRecorder: HistoryRecorder;
  readonly aiController: AIController;
  readonly persistence: PersistenceCoordinator;
  readonly achievements: AchievementRepository;
  readonly achievementSubscriber: AchievementSubscriber;
  /**
   * Підписка лише на ФАКТИЧНО нові розблокування. Хук UI
   * (`useAchievementsUnlock`) використовує її, щоб не показувати тост
   * на старі досягнення при кожному «game:ended».
   */
  onAchievementsUnlocked(listener: AchievementUnlockedListener): () => void;
  readonly disposers: Array<() => void>;
  dispose(): void;
}

/**
 * Параметри ініціалізації. Усі поля опційні, бо рантайм має сенсовні
 * дефолти. Тести можуть підкласти `storageOverride` (наприклад,
 * `InMemoryAdapter` через `createDefaultStorage`).
 */
export interface AppRuntimeOptions {
  readonly storageOverride?: StorageBundle;
  readonly onAchievementsUnlocked?: AchievementUnlockedListener;
}

/**
 * Створює рантайм. Без побічних ефектів окрім тих, що відбуваються
 * в конструкторах (підписки на шину, накладання теми, тощо).
 *
 * Послідовність важлива:
 *   1) сховище — джерело правди про налаштування;
 *   2) переклад/тема ініціалізуються з налаштувань;
 *   3) ігровий стан або відновлюється зі слоту, або створюється новий;
 *   4) сервіси та підписники чіпляються до шини;
 *   5) автозбереження вмикаємо лише після того, як підписники активні.
 */
export function createAppRuntime(options: AppRuntimeOptions = {}): AppRuntime {
  const storage = options.storageOverride ?? createDefaultStorage();
  const settings = storage.settings.load();

  const translator = new Translator(settings.locale);
  const themeApplier = new ThemeApplier(undefined, settings.theme);

  const bus = new EventBus<GameEventMap>();
  const moveCounter = new MoveCounter(bus);
  const historyRecorder = new HistoryRecorder(bus);

  const initialGame = restoreOrCreateGame(storage, settings);
  const commandService = new GameCommandService(initialGame);
  const gameService = new EventfulGameService(commandService, bus);

  const aiController = new AIController({ delayMs: settings.aiThinkingDelayMs });

  const persistence = new PersistenceCoordinator({
    bus,
    matches: storage.matches,
    slots: storage.slots,
    autosaveEnabled: settings.autosave,
  });
  persistence.start();

  const achievements = new AchievementRepository(storage.adapter);
  // Внутрішній «фан-аут»: один колбек у `AchievementSubscriber` —
  // багато підписників на стороні UI. Це дозволяє хукам читати лише
  // ФАКТИЧНО нові розблокування, а не весь історичний список.
  const unlockListeners = new Set<AchievementUnlockedListener>();
  const fanOut: AchievementUnlockedListener = (entries) => {
    if (options.onAchievementsUnlocked) {
      options.onAchievementsUnlocked(entries);
    }
    for (const listener of unlockListeners) {
      try {
        listener(entries);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[AppRuntime] achievement listener threw", error);
      }
    }
  };
  const achievementSubscriber = new AchievementSubscriber(
    bus,
    new AchievementEvaluator(),
    achievements,
    storage.matches,
    settings.humanName,
    () => Date.now(),
    fanOut,
  );
  const stopAchievementSubscriber = achievementSubscriber.start();
  achievementSubscriber.bootstrap();

  // Анонсуємо стартовий стан, щоб усі підписники (зокрема
  // `MoveCounter`/`HistoryRecorder`) синхронізували поля з реальним
  // станом ще до першого рендеру.
  gameService.announceStart();

  const disposers: Array<() => void> = [
    () => persistence.stop(),
    () => stopAchievementSubscriber(),
    () => moveCounter.dispose(),
    () => historyRecorder.dispose(),
    () => themeApplier.dispose(),
    () => bus.clear(),
  ];

  return {
    storage,
    settings,
    translator,
    themeApplier,
    bus,
    commandService,
    gameService,
    moveCounter,
    historyRecorder,
    aiController,
    persistence,
    achievements,
    achievementSubscriber,
    onAchievementsUnlocked(listener: AchievementUnlockedListener): () => void {
      unlockListeners.add(listener);
      return () => {
        unlockListeners.delete(listener);
      };
    },
    disposers,
    dispose(): void {
      for (const off of [...disposers].reverse()) {
        try {
          off();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("[AppRuntime] dispose threw", error);
        }
      }
      disposers.length = 0;
    },
  };
}

/**
 * Створює гравця-людину з налаштувань. Виокремлено в чисту функцію,
 * щоб в одному місці наклеювати ID, який стабільний між сесіями.
 */
export function createHumanPlayer(settings: UserSettings, symbol: PlayerSymbol): Player {
  return makePlayer({
    id: `human:${settings.humanName}`,
    name: settings.humanName,
    symbol,
    isComputer: false,
    difficulty: null,
  });
}

/**
 * Створює другого учасника відповідно до налаштувань. Якщо в
 * налаштуваннях `opponentType === "ai"`, то це бот заданої складности;
 * інакше — друга людина з типовим іменем.
 */
export function createOpponent(settings: UserSettings, symbol: PlayerSymbol): Player {
  if (settings.opponentType === "ai") {
    const factory = defaultAIPlayerFactory;
    return makePlayer({
      id: `ai:${settings.aiDifficulty}`,
      name: factory.botName(settings.aiDifficulty),
      symbol,
      isComputer: true,
      difficulty: settings.aiDifficulty,
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

/**
 * Будує початкову гру з налаштувань. Враховує `humanSymbol` —
 * якщо людина обрала «O», ботові призначається «X», і навпаки.
 */
export function buildInitialGame(settings: UserSettings): Game {
  const humanSymbol = settings.humanSymbol;
  const opponentSymbol: PlayerSymbol = humanSymbol === "X" ? "O" : "X";
  const human = createHumanPlayer(settings, humanSymbol);
  const opponent = createOpponent(settings, opponentSymbol);
  const playerX = humanSymbol === "X" ? human : opponent;
  const playerO = humanSymbol === "X" ? opponent : human;
  return Game.start({
    boardSize: settings.boardSize,
    winLength: settings.winLength,
    firstSymbol: settings.firstSymbol,
    playerX,
    playerO,
  });
}

/**
 * Відновлення стану зі сховища, з фолбеком на новий старт. Якщо слот
 * битий або відсутній — ігноруємо й починаємо чисто.
 */
function restoreOrCreateGame(storage: StorageBundle, settings: UserSettings): Game {
  if (!settings.autosave) return buildInitialGame(settings);
  const slot = storage.slots.load();
  if (!slot) return buildInitialGame(settings);
  try {
    return new SaveSlotMapper().fromSlot(slot);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("[AppRuntime] не вдалося відновити слот:", error);
    storage.slots.clear();
    return buildInitialGame(settings);
  }
}

/**
 * Reset-сценарій: викликається з UI, коли користувач натискає
 * «Нова гра». Не перестворює рантайм — лише перевстановлює стан гри.
 */
export function startFreshGame(runtime: AppRuntime, settings?: UserSettings): Game {
  const next = buildInitialGame(settings ?? DEFAULT_USER_SETTINGS);
  runtime.gameService.replaceState(next);
  return next;
}
