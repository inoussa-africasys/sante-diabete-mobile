import { decoderQRCodeInformation, hashTo512 } from "../functions";
import QRCode from "../models/QRCode";
import { QRCodeRepository } from "../Repositories/QRCodeRepository";
import { DiabeteType } from "../types/enums";

export async function insertQRCode(type: DiabeteType, qrCodeData: string): Promise<string> {
    const {url, code, username} = decoderQRCodeInformation(qrCodeData);
    console.log('url:', url);
    console.log('code:', code);
    console.log('username:', username);
    const sha512 = await hashTo512(code);
    console.log('sha512:', sha512);
    const repo = new QRCodeRepository();
    await repo.insert(new QRCode({type, url, code: sha512, username}));
    return sha512;
}


export async function getLoginUrl(type: DiabeteType): Promise<string> {
    const repo = new QRCodeRepository();
    const qrCode = await repo.findAll();
    console.log('QR Code:', qrCode);
    return qrCode.find((qrCode) => qrCode.type === type)?.url || '';
}

