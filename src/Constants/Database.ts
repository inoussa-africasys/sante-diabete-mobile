import * as FileSystem from 'expo-file-system';

export const DATABASE_NAME = 'database.db';
export const DATABASE_VERSION = 1;
// Emplacement de la base SQLite tel qu'utilisé par votre code (dossier Trafic)
export const DATABASE_PATH = `${FileSystem.documentDirectory}Trafic/`;
// Si vous migrez vers le dossier standard expo-sqlite, remplacez par `${FileSystem.documentDirectory}SQLite/`



