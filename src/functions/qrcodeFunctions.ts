import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { DiabeteType } from '../types/enums';
import Logger from '../utils/Logger';

export function decoderQRCodeInformation(qrCode: string): {url: string, code: string, username: string} {
    const [url, code, username] = qrCode.split('|');
    return {url, code, username};
}


export async function hashTo512(token: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA512,
    token,
    { encoding: Crypto.CryptoEncoding.HEX }
  );

  // Padding pour imiter le comportement Java si nécessaire :
  return hash.padStart(32, '0');
}

export function getAuthTokenKey(DiabeteType: DiabeteType): string {
    return `auth_token_${DiabeteType.toLowerCase()}`;
}


export function getUserNameKey(DiabeteType: DiabeteType): string {
  return `user_name_${DiabeteType.toLowerCase()}`;
}

export function getAuthBaseUrlKey(DiabeteType: DiabeteType): string {
  return `auth_base_url_${DiabeteType.toLowerCase()}`;
}

export async function getUserName(DiabeteType: DiabeteType): Promise<string | null> {
  return await SecureStore.getItemAsync(getUserNameKey(DiabeteType));
}

export async function getBaseUrl(DiabeteType: DiabeteType): Promise<string | null> {
    /* const repo = new QRCodeRepository();
    const qrCode = await repo.findAll();
    console.log('QR Code:', qrCode);
    const baseUrl = qrCode.findLast((qrCode) => qrCode.type === DiabeteType)?.url || null;
    console.log('Base URL:', baseUrl); */
    const baseUrl = await SecureStore.getItemAsync(getAuthBaseUrlKey(DiabeteType));
    return baseUrl;
}


export function isValidURL(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    // Vérifie que le protocole est bien http ou https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }

    // Vérifie que l'hôte existe (nom de domaine ou adresse IP)
    if (!parsedUrl.hostname) {
      return false;
    }

    // Si tout passe, c'est une URL valide
    return true;
  } catch (error) {
    Logger.error('Error checking URL:', { error });
    return false;
  }
}

