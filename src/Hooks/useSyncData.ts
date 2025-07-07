import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCallback, useRef, useState } from 'react';
import { generateFormfillId } from '../functions/helpers';
import { FormFill } from '../models/FormFill';
import FormFillService from '../Services/formFillService';
import Logger from '../utils/Logger';
import { useFiche } from './useFiche';

export interface SyncFileData {
  name: string;
  date: string;
  id: string;
  formFill: FormFill;
  id_trafic: string;
  synced: boolean;  
}

export interface SyncFolderData {
  name: string;
  id?: number;
  files?: SyncFileData[];
}

  /**
   * Hook pour gérer la synchronisation des données locales avec le serveur.
   * 
   * Retourne un objet avec les propriétés suivantes :
   * - `folders`: le tableau des dossiers avec des consultations locales qui peuvent être synchronisées
   * - `loading`: un booléen indiquant si les données sont en train d'être chargées
   * - `error`: un message d'erreur si une erreur est survenue lors du chargement ou de la synchronisation
   * - `isSyncing`: un booléen indiquant si la synchronisation est en cours
   * - `syncSuccess`: un booléen indiquant si la synchronisation a réussi
   * - `loadData`: une fonction pour charger les données locales
   * - `syncData`: une fonction pour synchroniser les données locales avec le serveur
   * - `resetSyncSuccess`: une fonction pour réinitialiser la propriété `syncSuccess` à `false`
   */
export const useSyncData = () => {
  const [folders, setFolders] = useState<SyncFolderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  const { getAllFicheDownloaded } = useFiche();

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd-MM-yyyy_HH\'h\'mm\'min\'', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const getAllLocalFormFillForFiche = async (ficheId: string): Promise<FormFill[]> => {
    try {
      // Utiliser la méthode dédiée du service pour obtenir les consultations locales par fiche
      const formFillService = await FormFillService.create();
      const formFill = await formFillService.getAllFormFillByFicheName(ficheId);
      return formFill;
    } catch (error) {
      console.error('Erreur lors de la récupération des consultations locales:', error);
      Logger.log('error', 'Error fetching local consultations for fiche', { error, ficheId });
      return [];
    }
  };

  // Utiliser une référence pour éviter les appels multiples simultanés
  const isLoadingRef = useRef(false);
  
  const loadData = useCallback(async () => {
    // Éviter de recharger les données si déjà en cours de chargement
    if (isLoadingRef.current) {
      console.log('Chargement déjà en cours, ignoré');
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      // Récupérer toutes les fiches téléchargées
      const fiches = await getAllFicheDownloaded();
      
      const folderData: SyncFolderData[] = [];
      
      // Pour chaque fiche, récupérer les consultations locales associées
      for (const fiche of fiches) {
        const formFillService = await FormFillService.create();
        const formFill = await formFillService.getAllFormFillByFicheName(fiche.name?.toString() || '');
        
        console.log('formFill : ', formFill);
        // Ajouter la fiche seulement si elle a des consultations
        if (formFill && formFill.length > 0) {
          // Créer un objet SyncFolderData pour cette fiche
          const folder: SyncFolderData = {
            name: fiche.name?.toString() || '',
            id: fiche.id,
            files: formFill.map(formFill => ({
              id_trafic: formFill.id_trafic || generateFormfillId(),
              name: fiche.name?.toString() || '',
              date: formatDate(formFill.createdAt || ''),
              id: `TF-${formFill.id?.toString().padStart(8, '0')}`,
              synced: formFill.synced,
              formFill: formFill
            }))
          };
          
          folderData.push(folder);
        }
      }
      
      console.log(`${folderData.length} dossiers avec consultations trouvés`);
      setFolders(folderData);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      Logger.log('error', 'Error loading sync data', { error: err });
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
      // Réinitialiser la référence pour permettre de futurs chargements
      isLoadingRef.current = false;
    }
  }, [getAllFicheDownloaded]);

  // Référence pour éviter les synchronisations simultanées
  const isSyncingRef = useRef(false);
  
  const syncData = useCallback(async () => {
    // Éviter les synchronisations simultanées
    if (isSyncingRef.current) {
      console.log('Synchronisation déjà en cours, ignorée');
      return;
    }
    
    isSyncingRef.current = true;
    setIsSyncing(true);
    
    try {
      // Ici, vous pourriez implémenter la logique de synchronisation réelle
      // Par exemple, envoyer toutes les consultations locales au serveur
      
      // Simuler un délai pour la démonstration
      const formFillService = await FormFillService.create();
      const result = await formFillService.syncFormFill();
      console.log('Sync result:', result);
      
      // Recharger les données après la synchronisation
      await loadData();
      setSyncSuccess(true);
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      Logger.log('error', 'Error syncing data', { error });
      setError('Erreur lors de la synchronisation');
    } finally {
      setIsSyncing(false);
      // Réinitialiser la référence
      isSyncingRef.current = false;
    }
  }, [loadData]);

  const resetSyncSuccess = useCallback(() => {
    setSyncSuccess(false);
  }, []);

  return {
    folders,
    loading,
    error,
    isSyncing,
    syncSuccess,
    loadData,
    syncData,
    resetSyncSuccess
  };
};
