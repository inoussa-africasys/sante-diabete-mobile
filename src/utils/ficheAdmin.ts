
export const generateFicheAdministrativeName = (typeDiabete: string): string => {
    //return typeDiabete.toLowerCase() + "_" + FICHE_ADMINISTRATIVE_NAME;
    return "fiche_v1";
};


export const getFicheAdministrativeName = (typeDiabete: string): string => {
    return generateFicheAdministrativeName(typeDiabete);
};
