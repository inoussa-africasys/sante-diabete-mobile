import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { v4 } from "react-native-uuid/dist/v4";

export const formatPatientDate = (date: string) => {
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString('fr-FR');
};


export function parseSurveyData(rawData: any): Record<string, any> | undefined {
    if (!rawData) return undefined;
  
    try {
      // Si déjà un objet JSON valide
      if (typeof rawData === 'object') return rawData;
  
      // Si c’est une string JSON correcte
      return JSON.parse(rawData);
    } catch {
      try {
        // Dernier recours : parsing custom style Java
        const cleaned = rawData
          .replace(/^{|}$/g, '') // Supprime les { }
          .split(', ')
          .reduce((acc: any, pair: string) => {
            const [key, value] = pair.split('=');
            acc[key.trim()] = value?.replace(/^\[|\]$/g, '').trim();
            return acc;
          }, {});
        return cleaned;
      } catch (e) {
        console.warn("Échec parsing custom survey data :", e);
        return undefined;
      }
    }
}
  

export function generateFormfillId() {
    const rawUuid = v4(); // Génère un UUID (ex: 'ba13f9a6-...')
    const cleaned = rawUuid.replace(/-/g, '');
    const id = cleaned.substring(0, 8).toUpperCase();
    return `TF-${id}`;
}


export const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd-MM-yyyy_HH\'h\'mm\'min\'', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };


  export function getLastElement<T>(arr: T[]): T | undefined {
    if (arr.length === 0) {
      return undefined; // retourne undefined si le tableau est vide
    }
    return arr[arr.length - 1];
  }
  