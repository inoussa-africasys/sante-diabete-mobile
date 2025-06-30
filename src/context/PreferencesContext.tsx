import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { USER_PREFERENCES_KEY } from '../Constants/App';
import { PreferencesType } from '../types/app';
import { Language, Theme } from '../types/enums';
  

  
  type PreferencesContextType = {
    preferences: PreferencesType;
    updatePreference: <K extends keyof PreferencesType>(key: K, value: PreferencesType[K]) => void;
  };
  
  const defaultPreferences: PreferencesType = {
    theme: Theme.LIGHT,
    language: Language.FR,
    notificationsEnabled: true,
    autoSync: true,
    isPictureSyncEnabled: false,
  };
  
  const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);
  
  export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
    const [preferences, setPreferences] = useState<PreferencesType>(defaultPreferences);
  
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
  
    const updatePreference = <K extends keyof PreferencesType>(key: K, value: PreferencesType[K]) => {
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
  