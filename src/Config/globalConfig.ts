import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_PREFERENCES_KEY } from '../Constants/App';
import { PreferencesType } from '../types/app';
import { Language, Theme } from '../types/enums';

// Configuration par défaut
const defaultConfig: PreferencesType = {
    autoSync: true,
    isPictureSyncEnabled: true,
    theme: Theme.LIGHT,
    language: Language.FR,
    notificationsEnabled: true,
};

// Configuration actuelle
export let config: PreferencesType = { ...defaultConfig };

// Fonction pour charger la configuration
export const loadConfig = async (): Promise<PreferencesType> => {
    try {
        const saved = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
        if (saved) {
            const savedConfig = JSON.parse(saved) as PreferencesType;
            config = {
                autoSync: savedConfig?.autoSync ?? defaultConfig.autoSync,
                isPictureSyncEnabled: savedConfig?.isPictureSyncEnabled ?? defaultConfig.isPictureSyncEnabled,
                theme: savedConfig?.theme ?? defaultConfig.theme,
                language: savedConfig?.language ?? defaultConfig.language,
                notificationsEnabled: savedConfig?.notificationsEnabled ?? defaultConfig.notificationsEnabled,
            };
        }
        return config;
    } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
        return defaultConfig;
    }
};


