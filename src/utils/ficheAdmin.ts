import FicheService from "../Services/ficheService";


export const getFicheAdministrativeName = async (): Promise<string> => {
    const ficheService = await FicheService.create();
    const ficheNames = await ficheService.getAllFicheNames();
    console.log("ficheNames : ",ficheNames);
    const latestFicheName = getLatestAdminFicheName(ficheNames);
    console.log("latestFicheName : ",latestFicheName);
    if (!latestFicheName) {
        throw new Error('No fiche found for type diabete');
    }
    return latestFicheName;
};


export function getLatestAdminFicheName(ficheNames: string[]): string | null {
    const regex = /^dt[12]_.*administrative.*_v([0-9]+)$/;

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
    console.log("latestFicheName : ",latestFicheName);
    return latestFicheName;
}
