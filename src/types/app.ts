import { Language, Theme } from "./enums";
import { SyncStatistics } from "./patient";

export type PreferencesType = {
    theme: Theme;
    language: Language;
    notificationsEnabled: boolean;
    autoSync: boolean;
    isPictureSyncEnabled: boolean;
};

export type SyncErrorType = {
    id: string;
    error: string;
};

export type SyncFormFillResultType = {
    success: boolean;
    statistics: SyncStatistics;
    errors: SyncErrorType[];
};



