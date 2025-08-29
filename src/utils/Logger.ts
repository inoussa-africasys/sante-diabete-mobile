import * as FileSystem from 'expo-file-system';
import { LOG_FILE_PATH } from '../Constants/App';
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMeta {
  [key: string]: any;
}

const logFileUri = FileSystem.documentDirectory + LOG_FILE_PATH + 'trafic.log';
const prevLogFileUri = FileSystem.documentDirectory + LOG_FILE_PATH + 'trafic-prev.log';
const MAX_LOG_SIZE_BYTES = 20 * 1024 * 1024; // 20MB rotation simple

function formatLog(level: LogLevel, message: string, meta?: LogMeta): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? JSON.stringify(meta) : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}\n`;
}

class Logger {

    static async log(level: LogLevel, message: string, meta?: LogMeta): Promise<void> {
      const logEntry = formatLog(level, message, meta);
      try {
        // Assurer le répertoire
        const dir = logFileUri.substring(0, logFileUri.lastIndexOf('/'));
        const dirInfo = await FileSystem.getInfoAsync(dir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        }

        // Vérifier le fichier courant
        const fileInfo = await FileSystem.getInfoAsync(logFileUri);

        if (fileInfo.exists) {
          // Rotation simple si trop volumineux
          if ((fileInfo as any).size && (fileInfo as any).size >= MAX_LOG_SIZE_BYTES) {
            try {
              // Supprimer ancien prev si existe
              const prevInfo = await FileSystem.getInfoAsync(prevLogFileUri);
              if (prevInfo.exists) {
                await FileSystem.deleteAsync(prevLogFileUri, { idempotent: true });
              }
              await FileSystem.moveAsync({ from: logFileUri, to: prevLogFileUri });
            } catch (rotErr) {
              console.warn('Logger: rotation échouée, on écrase le fichier', rotErr);
            }
          }
        }

        // Écrire en ajout en lisant le contenu existant (fallback fiable)
        const existsAfter = (await FileSystem.getInfoAsync(logFileUri)).exists;
        if (existsAfter) {
          let existing = '';
          try {
            existing = await FileSystem.readAsStringAsync(logFileUri);
          } catch {
            existing = '';
          }
          await FileSystem.writeAsStringAsync(logFileUri, existing + logEntry, { encoding: FileSystem.EncodingType.UTF8 });
        } else {
          await FileSystem.writeAsStringAsync(logFileUri, logEntry, { encoding: FileSystem.EncodingType.UTF8 });
        }
      } catch (err) {
        console.error('Erreur lors de l’écriture du log :', err);
      }
    }
    
  static info(message: string, meta?: LogMeta): void {
    this.log('info', message, meta);
  }

  static warn(message: string, meta?: LogMeta): void {
    this.log('warn', message, meta);
  }

  // Alias pour éviter les confusions d'API
  static warning(message: string, meta?: LogMeta): void {
    this.log('warn', message, meta);
  }

  static error(message: string, meta?: LogMeta): void {
    this.log('error', message, meta);
  }

  static debug(message: string, meta?: LogMeta): void {
    this.log('debug', message, meta);
  }

  static async read(): Promise<string> {
    try {
      return await FileSystem.readAsStringAsync(logFileUri);
    } catch {
      return 'Aucun log trouvé.';
    }
  }

  static async clear(): Promise<void> {
    try {
      await FileSystem.deleteAsync(logFileUri, { idempotent: true });
    } catch (err) {
      console.error('Erreur suppression log:', err);
    }
  }

  static getLogFilePath(): string {
    return logFileUri;
  }
}

export default Logger;
