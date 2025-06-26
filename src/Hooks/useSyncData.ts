import { useState, useCallback, useRef } from 'react';
import { useFiche } from './useFiche';
import useConsultation from './useConsultation';
import { Consultation } from '../models/Consultation';
import Fiche from '../models/Fiche';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ConsultationService from '../Services/ConsulationService';
import Logger from '../utils/Logger';

export interface SyncFileData {
  name: string;
  date: string;
  id: string;
  consultation: Consultation;
}

export interface SyncFolderData {
  name: string;
  id?: number;
  files?: SyncFileData[];
}

export const useSyncData = () => {
  const [folders, setFolders] = useState<SyncFolderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  const { getAllFicheDownloaded } = useFiche();
  const consultationHook = useConsultation();

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd-MM-yyyy_HH\'h\'mm\'min\'ss', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const getAllLocalConsultationsForFiche = async (ficheId: string): Promise<Consultation[]> => {
    try {
      // Utiliser la méthode dédiée du service pour obtenir les consultations locales par fiche
      const consultationService = await ConsultationService.create();
      const consultations = await consultationService.getLocalConsultationsByFicheId(ficheId);
      return consultations;
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
      console.log(`${fiches.length} fiches téléchargées`);
      
      const folderData: SyncFolderData[] = [];
      
      // Pour chaque fiche, récupérer les consultations locales associées
      for (const fiche of fiches) {
        const ficheId = fiche.id?.toString() || '';
        const consultations = await getAllLocalConsultationsForFiche(ficheId);
        
        // Ajouter la fiche seulement si elle a des consultations
        if (consultations && consultations.length > 0) {
          // Créer un objet SyncFolderData pour cette fiche
          const folder: SyncFolderData = {
            name: fiche.name?.toString() || '',
            id: fiche.id,
            files: consultations.map(consultation => ({
              name: fiche.name?.toString() || '',
              date: formatDate(consultation.createdAt || ''),
              id: `TF-${consultation.id?.toString().padStart(8, '0')}`,
              consultation: consultation
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
