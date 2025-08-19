import axios from 'axios';
import Constants from 'expo-constants';
import { getBaseUrl, getConnectedUsername, getToken } from '../functions/auth';
import { getZipFileAsBase64 } from '../functions/traficAssistance';
import { zipDirectory } from '../utils/exportZipViajsZip';
import Logger from '../utils/Logger';
interface SendZipFileToTheBackendType {
    brand: string;
    modelName: string;
    osVersion: string;
    zipUri: string;
}

type FormatTraficAssistantMailMessageType = {
    brand: string;
    modelName: string;
    osVersion: string;
}

type SendZipFileToTheBackendWithAxiosType = {
    emailBody: string;
    subject: string;
    media: string;
}
export default class TraficAssistantService {



    /**
     * Crée une archive ZIP du dossier contenant les fichiers patients.
     * @returns Le chemin de l'archive ZIP générée.
     */
    static zipPatientDirectory = async (): Promise<string | null> => {
        try {

            const zipUri = await zipDirectory();
            console.log("✅ Fichiers patients zippés :", zipUri);

            // Partager
            // await shareViaWhatsApp(zipUri);

            return zipUri;

        } catch (error) {
            Logger.log('error', 'Erreur lors de la création de l\'archive ZIP', { error });
            console.error("❌ Erreur lors de la création de l'archive ZIP :", error);
            return null;
        }

    }




    static sendZipFileToTheBackend = async ({ brand, modelName, osVersion, zipUri }: SendZipFileToTheBackendType) => {
        try {
            const { subject, message } = await this.formatTraficAssistantMailMessage({ brand, modelName, osVersion });
            const base64Zip = await getZipFileAsBase64(zipUri);
            if(!base64Zip) {
                console.error("❌ Erreur lors de la lecture du fichier ZIP en base64 :", zipUri);
                return;
            }
            try {
                const baseUrl = await getBaseUrl();
                const token = await getToken();
                const version = Constants.expoConfig?.version;
                const url = `${baseUrl}/api/json/mobile/trafic/assistant/upload/zip?token=${token}&app_version=${version}`;
                const data : SendZipFileToTheBackendWithAxiosType = {
                    emailBody: message,
                    subject : subject,
                    media: base64Zip
                }
                const response = await axios.post(url, data);
                if(response.status === 200) {
                    console.log("✅ Fichier ZIP envoyé au backend :", {status : response.status, statusText : response.statusText});
                    Logger.info("✅ Fichier ZIP envoyé au backend :", {status : response.status, statusText : response.statusText});
                }
            } catch (error) {
                Logger.log('error', 'Erreur lors de l\'envoi du fichier ZIP au backend', { error });
                console.error("❌ Erreur lors de l'envoi du fichier ZIP au backend :", error);
            }
        } catch (error) {
            Logger.log('error', 'Erreur lors du partage du fichier ZIP', { error });
            console.error("❌ Erreur lors du partage du fichier ZIP :", error);
        }
    }



    private static formatTraficAssistantMailMessage = async ({ brand, modelName, osVersion }: FormatTraficAssistantMailMessageType): Promise<{ subject: string, message: string }> => {
        const baseUrl = await getBaseUrl();
        const version = Constants.expoConfig?.version;
        const name = Constants.expoConfig?.name;
        const userName = await getConnectedUsername();
        const subject = "Données via Trafic Assistant ";
        const message = `
            <h1>${name}</h1> <br/>

            Application : ${name}  <br/>
            Nom d'utilisateur : ${userName} <br/>
            Version : ${version} <br/>
            URL Serveur Trafic : ${baseUrl} <br/>
            <br/>
            <b>Informations appareil utilisateur</b> <br/>
            Version android : ${osVersion} <br/>
            Nom de l'appareil : ${modelName} <br/>
            Model : ${brand} <br/>
            <br/>
            `;
        return { subject, message };
    }





}
