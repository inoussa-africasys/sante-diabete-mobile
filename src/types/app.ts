import { Language, Theme } from "./enums";

export type PreferencesType = {
    theme: Theme;
    language: Language;
    notificationsEnabled: boolean;
    autoSync: boolean;
    isPictureSyncEnabled: boolean;
};