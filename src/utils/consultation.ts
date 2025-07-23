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
  


  export function generateConsultationFileName(fileJsonUri: string): string {
    const fileName = fileJsonUri.split('/').pop();
    const fileNameWithoutExtension = fileName?.split('.').shift();
    return fileNameWithoutExtension || '';
  }

  export function parseConsultationDate(dateStr: string): Date | null {
    console.log("dateStr : ",dateStr);
    const date = new Date(dateStr);
    
    const [day, month, year] = dateStr.split('-').map(Number);
    console.log("day : ",day);
    console.log("month : ",month);
    console.log("year : ",year);
    if (
      !day || !month || !year ||
      day < 1 || day > 31 ||
      month < 1 || month > 12 ||
      year < 1000 || year > 9999
    ) {
      
      return date;
    }
    console.log("new Date(year, month - 1, day) : ",new Date(year, month - 1, day));
    return new Date(year, month - 1, day);
  }
  

  export const getconsultationName = (consultation: Consultation) => {
    if (consultation.isFicheAdministrative()) {
      return consultation.ficheName || 'Fiche administrative';
    }
    return consultation.fileName || generateConsultationName(parseConsultationDate(consultation.date || '') || new Date());
  };
  