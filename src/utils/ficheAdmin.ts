
export const generateFicheAdministrativeName = (typeDiabete: string): string => {
    //return typeDiabete.toLowerCase() + "_" + FICHE_ADMINISTRATIVE_NAME;
    return "dt1_administrative_v4";
};


export const getFicheAdministrativeName = (typeDiabete: string): string => {
    return generateFicheAdministrativeName(typeDiabete);
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

    return latestFicheName;
}
