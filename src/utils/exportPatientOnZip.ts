import * as FileSystem from "expo-file-system";
import { zip } from "react-native-zip-archive";



const PATH_OF_PATIENTS_DIR_ON_THE_LOCAL = "patients"; // remplace si besoin

/**
 * Crée une archive ZIP du dossier contenant les fichiers patients.
 * @returns Le chemin de l'archive ZIP générée.
 */
export async function zipPatientDirectory(): Promise<string | null> {
  try {
    const folderUri = `${FileSystem.documentDirectory}${PATH_OF_PATIENTS_DIR_ON_THE_LOCAL}/`;
    const zipDestination = `${FileSystem.documentDirectory}patients_archive.zip`;

    // Vérifie que le dossier existe
    const folderInfo = await FileSystem.getInfoAsync(folderUri);
    if (!folderInfo.exists || !folderInfo.isDirectory) {
      console.error("❌ Le dossier patients n'existe pas :", folderUri);
      return null;
    }

    // Crée le ZIP
    const zippedPath = await zip(folderUri, zipDestination);
    console.log("✅ Fichiers patients zippés :", zippedPath);
    return zippedPath;
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'archive ZIP :", error);
    return null;
  }
}


