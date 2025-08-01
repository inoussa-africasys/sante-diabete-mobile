import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ConfigState {
    autoSync: boolean;
    debugMode: boolean;
    syncPhotos: boolean;
    fingerprint: boolean;
    pinAtStartup: boolean;
    inclusiveMode: boolean;

    showPosition: boolean;
    showDownload: boolean;
    showDelete: boolean;
    showPatients: boolean;
    showStock: boolean;
    showSearch: boolean;
    showMedication: boolean;
    showSyncButton: boolean;
    showFicheRemplieButton: boolean;
    showFicheEditerButton: boolean;
    
    timer1: number;
    timer2: number;
    timer3: number;

    // Fonctions
    toggle: (key: ToggleKeys) => void;
    setValue: <K extends ConfigKeys>(key: K, value: ConfigState[K]) => void;
    getValue: <K extends ConfigKeys>(key: K) => ConfigState[K];
}

type ToggleKeys =
    | 'autoSync'
    | 'debugMode'
    | 'syncPhotos'
    | 'fingerprint'
    | 'pinAtStartup'
    | 'inclusiveMode'
    | 'showPosition'
    | 'showDownload'
    | 'showDelete'
    | 'showPatients'
    | 'showStock'
    | 'showSearch'
    | 'showMedication'
    | 'showSyncButton'
    | 'showFicheRemplieButton'
    | 'showFicheEditerButton';

type ConfigKeys = keyof Omit<ConfigState, 'toggle' | 'setValue' | 'getValue'>;

const useConfigStore = create<ConfigState>()(
    persist(
        (set, get) => ({
            autoSync: false,
            debugMode: false,
            syncPhotos: false,
            fingerprint: false,
            pinAtStartup: false,
            inclusiveMode: false,

            showPosition: false,
            showDownload: true,
            showDelete: true,
            showPatients: true,
            showStock: true,
            showSearch: false,
            showMedication: false,
            showSyncButton: true,
            showFicheRemplieButton: true,
            showFicheEditerButton: true,
            
            
            

            timer1: 30,
            timer2: 60,
            timer3: 90,

            toggle: (key) => set((state) => ({ [key]: !state[key] })),
            setValue: (key, value) => set(() => ({ [key]: value })),
            getValue: (key) => get()[key],
        }),
        {
            name: 'app-config',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export default useConfigStore;
