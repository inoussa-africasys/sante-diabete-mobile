import * as FileSystem from 'expo-file-system';
import { zip } from 'react-native-zip-archive';
import { PATH_OF_TRAFIC_DIR_ON_THE_LOCAL } from '../Constants';
import { NAME_OF_TRAFIC_ZIP_FILE } from '../Constants/App';
import Logger from './Logger';

export async function zipDirectoryNativeRNZA() {
  const baseDir = FileSystem.documentDirectory!;
  const sourceDir = `${baseDir}${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}`;
  const destZip = `${baseDir}${NAME_OF_TRAFIC_ZIP_FILE}`;

  const info = await FileSystem.getInfoAsync(sourceDir);
  if (!info.exists) throw new Error(`Dossier introuvable: ${sourceDir}`);

  try {
    const resultPath = await zip(sourceDir, destZip);
    console.log('✅ Fichier ZIP créé à :', resultPath);
    Logger.log('info', 'Fichier ZIP créé à :', {resultPath});
    return resultPath;
  } catch (error) {
    console.error('❌ Erreur lors de la compression :', error);
    Logger.log('error', 'Erreur lors de la compression :', {error});
  }
}
