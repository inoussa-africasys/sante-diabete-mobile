import * as FileSystem from 'expo-file-system';
import { LOG_FILE_PATH } from '../Constants/App';
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMeta {
  [key: string]: any;
}

const logFileUri = FileSystem.documentDirectory + LOG_FILE_PATH + 'trafic.log';

function formatLog(level: LogLevel, message: string, meta?: LogMeta): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? JSON.stringify(meta) : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}\n`;
}

class Logger {
  static async log(level: LogLevel, message: string, meta?: LogMeta): Promise<void> {
    const logEntry = formatLog(level, message, meta);

    try {
      const fileInfo = await FileSystem.getInfoAsync(logFileUri);
      if (fileInfo.exists) {
        const existing = await FileSystem.readAsStringAsync(logFileUri);
        await FileSystem.writeAsStringAsync(logFileUri, existing + logEntry);
      } else {
        await FileSystem.writeAsStringAsync(logFileUri, logEntry);
      }
    } catch (err) {
      console.error('Erreur écriture log:', err);
    }
  }

  static info(message: string, meta?: LogMeta): void {
    this.log('info', message, meta);
  }

  static warn(message: string, meta?: LogMeta): void {
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
