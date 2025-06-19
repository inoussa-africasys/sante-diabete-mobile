import { useState } from 'react';
import FicheService from '../Services/ficheService';
import Fiche from '../models/Fiche';


type UseFicheType = {
  getFicheList: () => Promise<string[]>;
  isLoading: boolean;
  error: string | null;
  downloadFiche: (ficheName: string) => Promise<Fiche | null>;
}
export const useFiche = (): UseFicheType => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  

  const getFicheList = async (): Promise<string[]> => {
    try {
      const fichesService = await FicheService.create();
      const fichesArrayString = await fichesService.fetchAllFichesOnServerQuery();
      await fichesService.insertAllFichesOnTheLocalDb(fichesArrayString);
      return fichesArrayString;
    } catch (error) {
      console.error('Erreur réseau :', error);
      setError(error as string);
      setIsLoading(false);
      return [];
    }
  };

  const downloadFiche = async (ficheName: string): Promise<Fiche | null> => {
    setIsLoading(true);
    try {
        const fichesService = await FicheService.create();
        const fiche = await fichesService.downloadFiche(ficheName);
        setIsLoading(false);
        return fiche;
      } catch (error) {
        console.error('Erreur réseau :', error);
        setError(error as string);
        setIsLoading(false);
        return null;
      }
  };


  return {
    getFicheList,
    isLoading,
    error,
    downloadFiche
  };
};
