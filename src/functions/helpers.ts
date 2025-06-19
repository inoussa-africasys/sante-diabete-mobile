export const formatPatientDate = (date: string) => {
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString('fr-FR');
};

