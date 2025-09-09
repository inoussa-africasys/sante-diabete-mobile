import * as FileSystem from 'expo-file-system';
import { zip } from 'react-native-zip-archive';
import { PATH_OF_TRAFIC_DIR_ON_THE_LOCAL } from '../Constants';
import { NAME_OF_TRAFIC_ZIP_FILE } from '../Constants/App';

export async function zipDirectoryNativeRNZA() {
  const baseDir = FileSystem.documentDirectory!;
  const sourceDir = `${baseDir}${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}`;
  const destZip = `${baseDir}${NAME_OF_TRAFIC_ZIP_FILE}`;

  const info = await FileSystem.getInfoAsync(sourceDir);
  if (!info.exists) throw new Error(`Dossier introuvable: ${sourceDir}`);

  const resultPath = await zip(sourceDir, destZip);
  return resultPath;
}
