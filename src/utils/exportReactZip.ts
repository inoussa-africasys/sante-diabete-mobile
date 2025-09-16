import { zipDirectory } from './exportZipViajsZip';



export const zipDirectoryWithReactNativeZipArchive = async () => {
    /* const dirUri = `${FileSystem.documentDirectory}${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}`;
    const zipUri = `${FileSystem.documentDirectory}${NAME_OF_TRAFIC_ZIP_FILE}`;

    // Normaliser les chemins pour react-native-zip-archive (pas de préfixe file://)
    const normalizePath = (p: string) => p?.startsWith('file://') ? p.replace('file://', '') : p;

    // S'assurer que le dossier source existe (le créer si besoin)
    const dirInfo = await FileSystem.getInfoAsync(dirUri);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
    }

    // Supprimer un ZIP existant pour éviter les collisions
    const zipInfo = await FileSystem.getInfoAsync(zipUri);
    if (zipInfo.exists && !zipInfo.isDirectory) {
      await FileSystem.deleteAsync(zipUri, { idempotent: true });
    }

    const resultPath = await zip(normalizePath(dirUri), normalizePath(zipUri));
    return resultPath; */
    await zipDirectory();
}


