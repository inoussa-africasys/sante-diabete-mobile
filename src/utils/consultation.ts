import { randomUUID } from "expo-crypto";
import { Consultation } from "../models/Consultation";

export function generateConsultationName(date: Date = new Date()): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
  
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
  
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
  
    return `consultation_${day}-${month}-${year}_${hours}h${minutes}min`;
  }


  export const generateUUID = (): string => {
    return randomUUID();
  };

  export function generateFicheAdministrativeNameForJsonSave(date: Date = new Date(), ficheAdministrativeName: string): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
  
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
  
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
  
    return `${ficheAdministrativeName}_${day}-${month}-${year}_${hours}h${minutes}min`;
  }
  
  export function generateConsultationFileName(fileJsonUri: string): string {
    const fileName = fileJsonUri.split('/').pop();
    const fileNameWithoutExtension = fileName?.split('.').shift();
    return fileNameWithoutExtension || '';
  }

  export function parseConsultationDate(dateStr: string): Date | null {
    if (!dateStr) {
      return null;
    }
    
    // Vérifier si la date est au format ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
    if (dateStr.includes('T')) {
      try {
        return new Date(dateStr);
      } catch (error) {
        console.error("Erreur de parsing de la date ISO:", error);
        return null;
      }
    }
    
    // Sinon, essayer le format DD-MM-YYYY
    try {
      const [day, month, year] = dateStr.split('-').map(Number);
      
      if (
        !day || !month || !year ||
        day < 1 || day > 31 ||
        month < 1 || month > 12 ||
        year < 1000 || year > 9999
      ) {
        return null;
      }
      
      return new Date(year, month - 1, day);
    } catch (error) {
      console.error("Erreur de parsing de la date au format DD-MM-YYYY:", error);
      return null;
    }
  }
  

  export const getconsultationName = async (consultation: Consultation) => {
    if (await consultation.isFicheAdministrative()) {
      return consultation.ficheName || 'Fiche administrative';
    }
    return consultation.fileName || generateConsultationName(parseConsultationDate(consultation.date || '') || new Date());
  };
  


  export function generateFormFillName(baseName: string): string {
    const now = new Date();
  
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mois de 0 à 11
    const year = now.getFullYear();
  
    const hours = String(now.getHours()).padStart(1, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    return `${baseName}_${day}-${month}-${year}_${hours}h${minutes}min${seconds}`;
  }
  