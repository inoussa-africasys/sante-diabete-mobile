import axios from "axios";
import { DpiResponse } from "../types/dpi";
import Logger from "../utils/Logger";
import Service from "./core/Service";

export default class DpiService extends Service {    

    async fetchAllDpisOnServer( {patientId,ficheName}: {patientId: string, ficheName: string}): Promise<DpiResponse> {
        if (!patientId || !ficheName) {
            throw new Error('No patientId or ficheName found');
        }

        try {
            const baseUrl = this.getBaseUrl();
            const token = this.getToken();
            const url = `${baseUrl}/api/json/mobile/patients/medicaldata/dpiview?patientID=${patientId}&formName=${ficheName}&token=${token}`;
            const response = await axios.get<DpiResponse>(url);
            return response.data;
        } catch (error) {
            console.error('Erreur réseau :', error);
            Logger.error('Erreur lors de la récupération des données du serveur', { error });
            throw error;
        }
    }
}