import { decode as base64Decode, encode as base64Encode } from 'base-64';


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
  