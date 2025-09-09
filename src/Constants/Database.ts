import * as FileSystem from 'expo-file-system';
import { PATH_OF_TRAFIC_DIR_ON_THE_LOCAL } from './App';

export const DATABASE_NAME = 'database.db';
export const DATABASE_VERSION = 1;
// Emplacement de la base SQLite tel qu'utilisé par votre code (dossier Trafic)
export const DATABASE_PATH = `${FileSystem.documentDirectory}${PATH_OF_TRAFIC_DIR_ON_THE_LOCAL}`;
// Si vous migrez vers le dossier standard expo-sqlite, remplacez par `${FileSystem.documentDirectory}SQLite/`



