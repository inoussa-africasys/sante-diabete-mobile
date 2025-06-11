import * as Crypto from 'expo-crypto';
import { QRCodeRepository } from '../Repositories/QRCodeRepository';
import { DiabeteType } from '../types/enums';

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

export async function getBaseUrl(DiabeteType: DiabeteType): Promise<string | null> {
    const repo = new QRCodeRepository();
    const qrCode = await repo.findAll();
    console.log('QR Code:', qrCode);
    const baseUrl = qrCode.findLast((qrCode) => qrCode.type === DiabeteType)?.url || null;
    console.log('Base URL:', baseUrl);
    return baseUrl;
}


