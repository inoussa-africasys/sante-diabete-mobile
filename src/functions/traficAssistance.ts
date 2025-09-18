import * as FileSystem from 'expo-file-system';
import { TraficFolder } from '../utils/TraficFolder';

export async function getZipFileAsBase64(uri: string) : Promise<string | null> {
    try {
      // Ensure the URI has the correct scheme (file://)
      let fileUri = uri;
      if (!uri.startsWith('file://')) {
        fileUri = `file://${uri}`;
      }
      
      // Check if file exists before reading
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        console.error(`Le fichier n'existe pas: ${fileUri}`);
        return null;
      }
      
      const base64Zip = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64Zip;
    } catch (error) {
      console.error('Erreur lecture base64 ZIP :', error);
      return null;
    }
}

export async function resetAllFilesOnTraficFolder() {
    try {
      console.log('🗑️ Suppression des fichiers du dossier Trafic...');
      const uri = `${FileSystem.documentDirectory}${TraficFolder.getTraficFolderPath()}`;
      await FileSystem.deleteAsync(uri);
      console.log('✅ Tous les fichiers du dossier Trafic ont été supprimés avec succès');
    } catch (error) {
      console.error('Erreur resetAllFilesOnTraficFolder :', error);
    }
}

  