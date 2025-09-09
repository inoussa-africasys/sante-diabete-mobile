import { Consultation } from "../models/Consultation";
import FicheService from "../Services/ficheService";


export const getFicheAdministrativeName = async (): Promise<string | null> => {
    const ficheService = await FicheService.create();
    //const ficheNames = await ficheService.getAllFicheNamesWhereFicheAdministrativeAttributeIsTrue();
    const ficheNames = await ficheService.getAllFicheNames();
    const latestFicheName = getLatestAdminFicheName(ficheNames);
    return latestFicheName;
};


export function getLatestAdminFicheName(ficheNames: string[]): string | null {
    const regex = /^dt[12]_donnees_administrative.*_v([0-9]+)$/;

    let latestFicheName: string | null = null;
    let maxVersion = -1;

    for (const ficheName of ficheNames) {
        const match = ficheName.match(regex);
        if (match) {
            const version = parseInt(match[1], 10);
            if (version > maxVersion) {
                maxVersion = version;
                latestFicheName = ficheName;
            }
        }
    }
    return latestFicheName;
}


export const checkIfConsultationIsAFicheAdministrative = async (consultation: Consultation): Promise<boolean> => {
    const regex = /^dt[12]_.*administrative.*_v([0-9]+)$/;
    const match = consultation.ficheName.match(regex);
    if (!match) {
        return false;
    }
    return true;
}


export const checkIfFicheIsAFicheAdministrativeByFicheName = async (ficheName: string): Promise<boolean> => {
    const regex = /^dt[12]_.*administrative.*_v([0-9]+)$/;
    const match = ficheName.match(regex);
    if (!match) {
        return false;
    }
    return true;
}

