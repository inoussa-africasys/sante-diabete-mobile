import { useQuery } from '@tanstack/react-query';
import { useNetworkState } from 'expo-network';
import { useCallback, useState } from 'react';
import FicheService from '../Services/ficheService';
import { SyncPatientReturnType } from '../types/patient';
import { usePatient } from './usePatient';

export type UseSyncPatientsUIOptions = {
  onAfterSuccess?: (stats: SyncPatientReturnType) => Promise<void> | void;
  onAfterError?: (stats: SyncPatientReturnType | null, error?: unknown) => Promise<void> | void;
};

export type UseSyncPatientsUIReturn = {
  isSyncing: boolean;
  syncSuccess: boolean;
  isSyncError: boolean;
  syncStats: SyncPatientReturnType | null;
  showSyncStats: boolean;
  handleSync: () => Promise<void>;
  closeStats: () => void;
};

export const useSyncPatientsUI = (options?: UseSyncPatientsUIOptions): UseSyncPatientsUIReturn => {
  const { syncPatients } = usePatient();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isSyncError, setIsSyncError] = useState(false);
  const [syncStats, setSyncStats] = useState<SyncPatientReturnType | null>(null);
  const [showSyncStats, setShowSyncStats] = useState(false);

    const networkState = useNetworkState();

  const { data: fiches, isLoading: isLoadingFiches, error: errorFiches } = useQuery({
    queryKey: ['fiches'],
    queryFn: async () => {
      const fichesService = await FicheService.create();
      const fichesArrayString = await fichesService.fetchAllFichesOnServerQuery();
      await fichesService.insertAllFichesOnTheLocalDb(fichesArrayString);
      return fichesArrayString;
    },
    enabled: networkState.isConnected === true,
    retry: 2,

  });

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await syncPatients();
      setIsSyncing(false);
      setSyncStats(result);

      if (result.success) {
        setSyncSuccess(true);
        setShowSyncStats(true);
        await options?.onAfterSuccess?.(result);
      } else {
        setIsSyncError(true);
        setShowSyncStats(true);
        await options?.onAfterError?.(result);
      }
    } catch (error) {
      setIsSyncing(false);
      setIsSyncError(true);
      setShowSyncStats(true);
      await options?.onAfterError?.(null, error);
      console.error('Erreur lors de la synchronisation:', error);
    }
  }, [options, syncPatients]);

  const closeStats = useCallback(() => setShowSyncStats(false), []);

  return {
    isSyncing,
    syncSuccess,
    isSyncError,
    syncStats,
    showSyncStats,
    handleSync,
    closeStats,
  };
};
