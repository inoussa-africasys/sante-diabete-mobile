import { decode as base64Decode, encode as base64Encode } from 'base-64';
import * as Crypto from 'expo-crypto';

export function decoderQRCodeInformation(qrCode: string): {url: string, code: string, username: string} {
    const [url, code, username] = qrCode.split('|');
    return {url, code, username};
}


export function encodeBase64(data: string): string {
    const encodedData = base64Encode(data);
    return encodedData;
}

export function decodeBase64(data: string): string {
    const decodedData = base64Decode(data);
    return decodedData;
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

  