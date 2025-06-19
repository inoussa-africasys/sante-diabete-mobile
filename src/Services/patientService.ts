import { API_HEADER } from "../Constants/App";
import { PatientRepository } from "../Repositories/PatientRepository";
import Patient from "../models/Patient";
import Service from "./core/Service";

export default class PatientService extends Service {
    private patientRepository: PatientRepository;


    constructor() {
        super();
        this.patientRepository = new PatientRepository();
    }

    async getAllOnTheLocalDb(type_diabete: string): Promise<Patient[]> {
        return await this.patientRepository.findAllByTypeDiabete(type_diabete);
    }

    async getAllOnTheServer(): Promise<Patient[]> {
        try {
            const response = await fetch(this.getFullUrl('/api/json/mobile/patients'), {
                method: 'GET',
                headers: API_HEADER
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data: Patient[] = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur réseau :', error);
            throw error;
        }
    }

}
