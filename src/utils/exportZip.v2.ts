import * as FileSystem from 'expo-file-system';
import JSZip from 'jszip';
import { PATH_OF_TRAFIC_DIR_ON_THE_LOCAL } from '../Constants';
import { NAME_OF_TRAFIC_ZIP_FILE } from '../Constants/App';

/** Conversion efficace Uint8Array -> base64 (sans multiplier les copies) */
function uint8ToBase64(u8: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000; // 32KB pour éviter les surcharges de call stack
  for (let i = 0; i < u8.length; i += chunk) {
    const sub = u8.subarray(i, i + chunk);
    binary += String.fromCharCode.apply(null, Array.from(sub) as any);
  }
  return global.btoa ? global.btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
}

/** Ajoute récursivement les fichiers d'un dossier à JSZip (lecture en base64) */
async function addDirectoryToZipBase64(zip: JSZip, dirUri: string, zipPath = '') {
  const entries = await FileSystem.readDirectoryAsync(dirUri);
  for (const name of entries) {
    const childUri = `${dirUri}${name}`;
    const info = await FileSystem.getInfoAsync(childUri);
    if (info.isDirectory) {
      await addDirectoryToZipBase64(zip, `${childUri}/`, `${zipPath}${name}/`);
    } else {
      // lire directement en base64
      const data = await FileSystem.readAsStringAsync(childUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // IMPORTANT: dire à JSZip que c'est du base64
      zip.file(`${zipPath}${name}`, data, { base64: true });
    }
  }
}

/** Exemple complet */
export async function zipDirectory() {
  const baseDir = FileSystem.documentDirectory!; // 'file://.../'
  const dirUri = `${baseDir}${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL.replace(/^\/+/, '')}/`;
  const zipFilename = NAME_OF_TRAFIC_ZIP_FILE.endsWith('.zip')
    ? NAME_OF_TRAFIC_ZIP_FILE
    : `${NAME_OF_TRAFIC_ZIP_FILE}.zip`;
  const zipUri = `${baseDir}${zipFilename}`;

  try {
    // 1) Vérif dossier + copier la DB
    const dirInfo = await FileSystem.getInfoAsync(dirUri);
    if (!dirInfo.exists) {
      throw new Error(`Le dossier ${dirUri} n'existe pas`);
    }

    // 2) Construire le zip (en mémoire JS – attention aux très gros fichiers)
    const zip = new JSZip();
    await addDirectoryToZipBase64(zip, dirUri);

    // 3) Générer en Uint8Array (évite une énorme chaîne base64 en RAM)
    const u8 = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 5 },
    });

    // 4) Convertir en base64 puis écrire sur disque
    const b64 = uint8ToBase64(u8);
    await FileSystem.writeAsStringAsync(zipUri, b64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return zipUri;
  } catch (error) {
    console.error('❌ Erreur lors de la création du ZIP :', error);
    throw error;
  }
}
