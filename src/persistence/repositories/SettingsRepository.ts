import { JsonRepository } from "../JsonRepository";
import type { StorageAdapter } from "../StorageAdapter";
import {
  DEFAULT_USER_SETTINGS,
  type OpponentType,
  type SupportedLocale,
  type ThemeMode,
  type UserSettings,
} from "../Settings";
import { ALL_DIFFICULTIES, type Difficulty } from "../../types/Difficulty";

const ALLOWED_THEMES: ReadonlyArray<ThemeMode> = ["system", "light", "dark"];
const ALLOWED_LOCALES: ReadonlyArray<SupportedLocale> = ["uk", "en"];
const ALLOWED_OPPONENTS: ReadonlyArray<OpponentType> = ["human", "ai"];

/**
 * Репозиторій налаштувань користувача. Тонка обгортка над
 * `JsonRepository`, але з типобезпечним мерджем `partial` із
 * дефолтами. Ми не хочемо, щоб під час розробки нові поля «зникали»
 * у користувачів зі старим записом — мердж робить це автоматично.
 */
export class SettingsRepository {
  public static readonly STORAGE_KEY = "ttt:settings";
  private static readonly VERSION = 1;

  private readonly inner: JsonRepository<UserSettings>;

  public constructor(adapter: StorageAdapter) {
    this.inner = new JsonRepository<UserSettings>({
      adapter,
      key: SettingsRepository.STORAGE_KEY,
      defaultValue: DEFAULT_USER_SETTINGS,
      version: SettingsRepository.VERSION,
      migrate: (raw) => SettingsRepository.merge(raw),
    });
  }

  public load(): UserSettings {
    return this.inner.load();
  }

  public save(settings: UserSettings): void {
    this.inner.save(settings);
  }

  /**
   * Зручний редактор: бере поточні налаштування, мутує переданим
   * patch і зберігає. Викликаємо з обробників UI.
   */
  public update(patch: Partial<UserSettings>): UserSettings {
    const current = this.inner.load();
    const next: UserSettings = { ...current, ...patch };
    this.inner.save(next);
    return next;
  }

  public reset(): UserSettings {
    this.inner.save(DEFAULT_USER_SETTINGS);
    return DEFAULT_USER_SETTINGS;
  }

  /**
   * «Дбайливий» мердж: якщо у запису бракує нового поля, ми вставимо
   * дефолт; якщо тип неправильний або значення поза whitelist
   * (`aiDifficulty`, `theme`, `locale`) — теж заміняємо на дефолт.
   * Це захищає UI від «битих» або підроблених записів у localStorage.
   */
  private static merge(raw: unknown): UserSettings {
    if (raw === null || typeof raw !== "object") {
      return DEFAULT_USER_SETTINGS;
    }
    const data = raw as Partial<UserSettings>;
    const result: UserSettings = {
      boardSize: typeof data.boardSize === "number" ? data.boardSize : DEFAULT_USER_SETTINGS.boardSize,
      winLength: typeof data.winLength === "number" ? data.winLength : DEFAULT_USER_SETTINGS.winLength,
      humanSymbol: data.humanSymbol === "O" ? "O" : "X",
      humanName:
        typeof data.humanName === "string" && data.humanName.trim().length > 0
          ? data.humanName.trim()
          : DEFAULT_USER_SETTINGS.humanName,
      firstSymbol: data.firstSymbol === "O" ? "O" : "X",
      opponentType: SettingsRepository.coerceEnum<OpponentType>(
        data.opponentType,
        ALLOWED_OPPONENTS,
        DEFAULT_USER_SETTINGS.opponentType,
      ),
      aiDifficulty: SettingsRepository.coerceEnum<Difficulty>(
        data.aiDifficulty,
        ALL_DIFFICULTIES,
        DEFAULT_USER_SETTINGS.aiDifficulty,
      ),
      theme: SettingsRepository.coerceEnum<ThemeMode>(
        data.theme,
        ALLOWED_THEMES,
        DEFAULT_USER_SETTINGS.theme,
      ),
      locale: SettingsRepository.coerceEnum<SupportedLocale>(
        data.locale,
        ALLOWED_LOCALES,
        DEFAULT_USER_SETTINGS.locale,
      ),
      enableSounds:
        typeof data.enableSounds === "boolean"
          ? data.enableSounds
          : DEFAULT_USER_SETTINGS.enableSounds,
      enableAnimations:
        typeof data.enableAnimations === "boolean"
          ? data.enableAnimations
          : DEFAULT_USER_SETTINGS.enableAnimations,
      enableHints:
        typeof data.enableHints === "boolean"
          ? data.enableHints
          : DEFAULT_USER_SETTINGS.enableHints,
      aiThinkingDelayMs:
        typeof data.aiThinkingDelayMs === "number"
          ? data.aiThinkingDelayMs
          : DEFAULT_USER_SETTINGS.aiThinkingDelayMs,
      highlightLastMove:
        typeof data.highlightLastMove === "boolean"
          ? data.highlightLastMove
          : DEFAULT_USER_SETTINGS.highlightLastMove,
      autosave:
        typeof data.autosave === "boolean"
          ? data.autosave
          : DEFAULT_USER_SETTINGS.autosave,
    };
    return result;
  }

  /**
   * Узагальнений «привіт» для enum-подібних полів: якщо значення
   * входить у whitelist допустимих — повертаємо його, інакше дефолт.
   */
  private static coerceEnum<T extends string>(
    value: unknown,
    allowed: ReadonlyArray<T>,
    fallback: T,
  ): T {
    if (typeof value !== "string") return fallback;
    return (allowed as ReadonlyArray<string>).includes(value) ? (value as T) : fallback;
  }
}
