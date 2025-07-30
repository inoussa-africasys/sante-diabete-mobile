import * as FileSystem from 'expo-file-system';

export async function getZipFileAsBase64(uri: string) : Promise<string | null> {
    try {
      const base64Zip = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64Zip;
    } catch (error) {
      console.error('Erreur lecture base64 ZIP :', error);
      return null;
    }
}
  