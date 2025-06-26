// src/context/PreferencesContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { USER_PREFERENCES_KEY } from '../Constants/App';
import { Language, Theme } from '../types/enums';
  
  type Preferences = {
    theme: Theme;
    language: Language;
    notificationsEnabled: boolean;
    autoSync: boolean;
  };
  
  type PreferencesContextType = {
    preferences: Preferences;
    updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  };
  
  const defaultPreferences: Preferences = {
    theme: Theme.LIGHT,
    language: Language.FR,
    notificationsEnabled: true,
    autoSync: true,
  };
  
  const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);
  
  export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
    const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  
    useEffect(() => {
      const load = async () => {
        const saved = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
        if (saved) setPreferences(JSON.parse(saved));
      };
      load();
    }, []);
  
    useEffect(() => {
      AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
    }, [preferences]);
  
    const updatePreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
    };
  
    return (
      <PreferencesContext.Provider value={{ preferences, updatePreference }}>
        {children}
      </PreferencesContext.Provider>
    );
  };
  
  export const usePreferences = (): PreferencesContextType => {
    const context = useContext(PreferencesContext);
    if (!context) throw new Error('usePreferences must be used within PreferencesProvider');
    return context;
  };
  