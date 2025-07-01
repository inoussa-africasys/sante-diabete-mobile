import AsyncStorage from '@react-native-async-storage/async-storage';
import { LAST_SYNC_DATE_KEY } from "../Constants/App";

export const saveLastSyncDate = async (date: string) => {
  try {
    await AsyncStorage.setItem(LAST_SYNC_DATE_KEY, date);
    console.log("Last sync date saved : ", date);
    
  } catch (error) {
    console.error('Error saving last sync date :', error);
  }
};

export const getLastSyncDate = async (): Promise<string | null> => {
    const lastSyncDate = await AsyncStorage.getItem(LAST_SYNC_DATE_KEY);
    return lastSyncDate ;
};

export const setLastSyncDate = async (date: string) => {
    await saveLastSyncDate(date);
};