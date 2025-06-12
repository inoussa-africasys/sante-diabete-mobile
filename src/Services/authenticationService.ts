import { decoderQRCodeInformation, hashTo512 } from "../functions";
import QRCode from "../models/QRCode";
import { QRCodeRepository } from "../Repositories/QRCodeRepository";
import { DiabeteType } from "../types/enums";


interface QRCodeDecodeType {
    url: string;
    code: string;
    token: string;
    username: string;
}

export async function decodeCleanAndInsertQRCodeOnDB(type: DiabeteType, qrCodeData: string): Promise<QRCodeDecodeType> {
    const {url, code, username} = decoderQRCodeInformation(qrCodeData);
    const sha512 = await hashTo512(code);
    const repo = new QRCodeRepository();
    const qrCodes = await repo.findAll();
    qrCodes.filter((qrCode) => qrCode.type === type).forEach((qrCode) => {
        repo.delete(qrCode.id!);
        console.log('Deleted QR Code:', qrCode);
    });
    await repo.insert(new QRCode({type, url, code: sha512, username}));
    return {
        url,
        code,
        token: sha512,
        username
    };
}


export async function getLoginUrl(type: DiabeteType): Promise<string> {
    const repo = new QRCodeRepository();
    const qrCode = await repo.findAll();
    return qrCode.find((qrCode) => qrCode.type === type)?.url || '';
}

