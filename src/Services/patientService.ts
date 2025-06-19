import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';
import { API_HEADER, PATH_OF_PATIENTS_DIR_ON_THE_LOCAL } from "../Constants/App";
import { PatientRepository } from "../Repositories/PatientRepository";
import Patient from "../models/Patient";
import { PatientFormData } from "../types";
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

    async insertOnTheLocalDb(patientFormData: PatientFormData): Promise<void> {
        try {
            const patientClass = this.mapperPatientFormDataToPatientClass(patientFormData);
            patientClass.id_patient = this.generatePatientId();
            patientClass.synced = false;
            patientClass.createdAt = new Date().toISOString();
            patientClass.updatedAt = new Date().toISOString();
            const location = await this.getCurrentLocation();
            if (location) {
                patientClass.latitude = location.latitude;
                patientClass.longitude = location.longitude;
            }
            this.patientRepository.insert(patientClass);
            this.savePatientAsJson(patientClass);

        } catch (error) {
            console.error('Erreur réseau :', error);
            throw error;
        }
    }

    private mapperPatientFormDataToPatientClass(patientFormData: PatientFormData): Patient {
        const patient = new Patient();
        patient.last_name = patientFormData.nom;
        patient.first_name = patientFormData.prenom;
        patient.date_of_birth = patientFormData.dateNaissance?.toISOString() || '';
        patient.genre = patientFormData.genre;
        patient.profession = patientFormData.profession;
        patient.phone = patientFormData.telephone;
        patient.email = patientFormData.email;
        patient.comment = patientFormData.commentaire;
        patient.photo = patientFormData.photo || undefined;
        patient.createdBy = this.getConnectedUsername();
        patient.type_diabete = this.getTypeDiabete();
        return patient;
    }

    private generatePatientId(): string {
        const rawUuid = uuid.v4() as string; // Génère un UUID (ex: 'ba13f9a6-...')
        const cleaned = rawUuid.replace(/-/g, '');
        const id = cleaned.substring(0, 8).toUpperCase();
        return `P-${id}`;
    }


    
    async savePatientAsJson(patient: Patient): Promise<void> {
        try {
            const jsonContent = JSON.stringify(patient.toJson(), null, 2);
            const fileName = `${patient.id_patient}.json`;

            const folderUri = `${FileSystem.documentDirectory}${PATH_OF_PATIENTS_DIR_ON_THE_LOCAL}/`;
            const fileUri = `${folderUri}${fileName}`;

            const dirInfo = await FileSystem.getInfoAsync(folderUri);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
            }

            await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            console.log(`✅ Patient enregistré dans le fichier : ${fileUri}`);
        } catch (error) {
            console.error("❌ Erreur d'enregistrement du fichier JSON :", error);
        }
    }

      
}
