import { shareViaWhatsApp, uploadZipToTheWebService, zipDirectory } from '../utils/exportZipViajsZip';

export default class TraficAssistantService {



    /**
     * Crée une archive ZIP du dossier contenant les fichiers patients.
     * @returns Le chemin de l'archive ZIP générée.
     */
    static zipPatientDirectory = async (): Promise<string | null> => {
        try {

                const zipUri = await zipDirectory();
                console.log("✅ Fichiers patients zippés :", zipUri);
              
                // Partager
                await shareViaWhatsApp(zipUri);
              
                console.log("✅ Fichiers patients partagés :", zipUri);
                // Envoyer au backend
                await uploadZipToTheWebService(zipUri);
                
                 console.log("✅ Fichiers patients envoyés au backend :", zipUri);

                return zipUri;
              
           /*  const folderUri = `${FileSystem.documentDirectory}${PATH_OF_PATIENTS_DIR_ON_THE_LOCAL}/`;
            const zipDestination = `${FileSystem.documentDirectory}${NAME_OF_TRAFIC_ZIP_FILE}`;

            // Vérifie que le dossier existe
            const folderInfo = await FileSystem.getInfoAsync(folderUri);
            if (!folderInfo.exists || !folderInfo.isDirectory) {
                console.error("❌ Le dossier patients n'existe pas :", folderUri);
                return null;
            }

            // Crée le ZIP
            const zippedPath = await zip(folderUri, zipDestination);
            console.log("✅ Fichiers patients zippés :", zippedPath);
            return zippedPath; */
        } catch (error) {
            console.error("❌ Erreur lors de la création de l'archive ZIP :", error);
            return null;
        }

    }



    




}
