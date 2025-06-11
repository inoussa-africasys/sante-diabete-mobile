import { decoderQRCodeInformation, hashTo512 } from "../functions";
import QRCode from "../models/QRCode";
import { QRCodeRepository } from "../Repositories/QRCodeRepository";
import { DiabeteType } from "../types/enums";

export async function login(type: DiabeteType, qrCodeData: string): Promise<boolean> {
    const {url, code, username} = decoderQRCodeInformation(qrCodeData);
    const base64 = await hashTo512(code);
    console.log('Code:', code);
    console.log('Code hash:', base64);

    const repo = new QRCodeRepository();
    await repo.insert(new QRCode({type, url, code: base64, username}));
    console.log('QR Code enregistré');
    return true;
}


export async function getLoginUrl(type: DiabeteType): Promise<string> {
    const repo = new QRCodeRepository();
    const qrCode = await repo.findAll();
    console.log('QR Code:', qrCode);
    return qrCode.find((qrCode) => qrCode.type === type)?.url || '';
}

