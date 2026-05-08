import { InMemoryAdapter } from "./adapters/InMemoryAdapter";
import { LocalStorageAdapter } from "./adapters/LocalStorageAdapter";
import type { StorageAdapter } from "./StorageAdapter";
import { MatchRepository } from "./repositories/MatchRepository";
import { SaveSlotRepository } from "./repositories/SaveSlotRepository";
import { SettingsRepository } from "./repositories/SettingsRepository";

/**
 * Готовий комплект сховища для застосунку: адаптер та три репозиторії.
 * Інкапсулюємо вибір адаптера в одному місці — UI та сервіси
 * отримують уже готовий «бандл» і не приймають рішень про low-level
 * деталі браузера.
 */
export interface StorageBundle {
  readonly adapter: StorageAdapter;
  readonly matches: MatchRepository;
  readonly settings: SettingsRepository;
  readonly slots: SaveSlotRepository;
}

/**
 * Створює стандартний комплект сховища. У браузері використовуємо
 * `localStorage`, інакше (Node, SSR, тести) — `InMemoryAdapter`.
 *
 * Передавайте `adapter`, якщо хочете явно мокнути сховище у тестах.
 */
export function createDefaultStorage(adapter?: StorageAdapter): StorageBundle {
  const resolved = adapter ?? defaultAdapter();
  return {
    adapter: resolved,
    matches: new MatchRepository(resolved),
    settings: new SettingsRepository(resolved),
    slots: new SaveSlotRepository(resolved),
  };
}

function defaultAdapter(): StorageAdapter {
  if (LocalStorageAdapter.isAvailable()) {
    return new LocalStorageAdapter();
  }
  return new InMemoryAdapter();
}
