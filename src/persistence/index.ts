export type { StorageAdapter } from "./StorageAdapter";
export { InMemoryAdapter } from "./adapters/InMemoryAdapter";
export { LocalStorageAdapter } from "./adapters/LocalStorageAdapter";
export { JsonRepository } from "./JsonRepository";

export type { MatchRecord, MatchParticipant, MatchMoveRecord } from "./Match";
export { buildMatchId } from "./Match";
export type { SaveSlot, SaveSlotMove, SaveSlotParticipant } from "./SaveSlot";
export type { UserSettings, ThemeMode, SupportedLocale } from "./Settings";
export { DEFAULT_USER_SETTINGS, withSettingChange } from "./Settings";

export { MatchRepository } from "./repositories/MatchRepository";
export { SettingsRepository } from "./repositories/SettingsRepository";
export { SaveSlotRepository } from "./repositories/SaveSlotRepository";

export { MatchRecordMapper } from "./mappers/MatchRecordMapper";
export { SaveSlotMapper } from "./mappers/SaveSlotMapper";

export { PersistenceCoordinator } from "./PersistenceCoordinator";
export { createDefaultStorage } from "./StorageRegistry";
export type { StorageBundle } from "./StorageRegistry";
