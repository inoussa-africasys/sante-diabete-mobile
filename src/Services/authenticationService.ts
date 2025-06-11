import { decoderQRCodeInformation, encodeBase64 } from "../functions";
import QRCode from "../models/QRCode";
import { QRCodeRepository } from "../Repositories/QRCodeRepository";
import { DiabeteType } from "../types/enums";

export async function login(type: DiabeteType, qrCodeData: string): Promise<boolean> {
    const {url, code, username} = decoderQRCodeInformation(qrCodeData);
    const base64 = encodeBase64(code)

    const repo = new QRCodeRepository();
    await repo.insert(new QRCode({type, url, code: base64, username}));
    console.log('QR Code enregistré');
    return true;
}
