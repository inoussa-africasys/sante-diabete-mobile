import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';
import { API_HEADER, APP_VERSION, PATH_OF_PATIENTS_DIR_ON_THE_LOCAL } from "../Constants/App";
import { PatientRepository } from "../Repositories/PatientRepository";
import { getLastSyncDate } from '../functions';
import { setLastSyncDate } from '../functions/syncHelpers';
import { PatientMapper } from '../mappers/patientMapper';
import Patient from "../models/Patient";
import { PatientDeletedSyncError, PatientFormData, PatientUpdatedSyncError } from "../types";
import Logger from '../utils/Logger';
import { sendTraficAuditEvent } from '../utils/traficAudit';
import { SYNCHRO_DELETE_LOCAL_PATIENTS, SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED, SYNCHRO_UPLOAD_LOCAL_PATIENTS, SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED } from './../Constants/syncAudit';
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
            const patientClass = PatientMapper.toPatient(patientFormData);
            patientClass.id_patient = this.generatePatientId();
            patientClass.synced = false;
            patientClass.createdAt = new Date().toISOString();
            patientClass.updatedAt = new Date().toISOString();
            patientClass.createdBy = this.getConnectedUsername();
            patientClass.type_diabete = this.getTypeDiabete();
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

            console.log(`Patient enregistré dans le fichier : ${fileUri}`);
        } catch (error) {
            console.error("Erreur d'enregistrement du fichier JSON :", error);
        }
    }

    async updateOnTheLocalDb(patientId: string,patientFormData: PatientFormData): Promise<void> {
        try {
            const oldPatient = (await this.patientRepository.findAllByPatientId(patientId));
            const id = oldPatient?.id;
            if (!id) {
                throw new Error(` Patient avec l'ID ${patientId} non trouvé`);
            }

            const patientToUpdate = PatientMapper.toPatient(patientFormData);
            patientToUpdate.id = id;
            patientToUpdate.updatedAt = new Date().toISOString();
            patientToUpdate.synced = false;
            patientToUpdate.id_patient = patientId;
            patientToUpdate.createdBy = this.getConnectedUsername();
            patientToUpdate.trafic_user = this.getConnectedUsername();
            patientToUpdate.type_diabete = this.getTypeDiabete();
            patientToUpdate.createdAt = oldPatient.createdAt;
            this.patientRepository.updatev2(id, patientToUpdate);
            this.updatePatientJson(patientId, patientToUpdate);
            console.log(`Patient mis à jour : ${patientId}`);
        } catch (error) {
            console.error("Erreur de mise à jour du patient :", error);
        }
    }

    async deleteOnTheLocalDb(patientId: string): Promise<void> {
        try {
            const id = (await this.patientRepository.findAllByPatientId(patientId))?.id;
            if (!id) {throw new Error(` Patient avec l'ID ${patientId} non trouvé`);}
            this.patientRepository.softDelete(id.toString());
            this.deletePatientJson(patientId);
            console.log(`Patient supprimé : ${patientId}`);
        } catch (error) {
            console.error("Erreur de suppression du patient :", error);
        }
    }


    async updatePatientJson(id_patient: string, updatedFields: Partial<Patient>): Promise<void> {
        try {
          const folderUri = `${FileSystem.documentDirectory}${PATH_OF_PATIENTS_DIR_ON_THE_LOCAL}/`;
          const fileUri = `${folderUri}${id_patient}.json`;
      
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          if (!fileInfo.exists) {
            console.error("Le fichier patient n'existe pas :", fileUri);
            return;
          }
      
          const fileContent = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          const existingPatient = JSON.parse(fileContent);
          const updatedPatient = { ...existingPatient, ...updatedFields };
      
          const updatedJsonContent = JSON.stringify(updatedPatient, null, 2);
          await FileSystem.writeAsStringAsync(fileUri, updatedJsonContent, {
            encoding: FileSystem.EncodingType.UTF8,
          });
      
          console.log(`Patient mis à jour dans le fichier : ${fileUri}`);
        } catch (error) {
          console.error("Erreur lors de la mise à jour du fichier JSON :", error);
        }
      }
      

      async deletePatientJson(id_patient: string): Promise<void> {
        try {
          const folderUri = `${FileSystem.documentDirectory}${PATH_OF_PATIENTS_DIR_ON_THE_LOCAL}/`;
          const fileUri = `${folderUri}${id_patient}.json`;
      
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          if (!fileInfo.exists) {
            console.warn("Le fichier n'existe pas :", fileUri);
            return;
          }
      
          await FileSystem.deleteAsync(fileUri);
          console.log(`Fichier supprimé : ${fileUri}`);
        } catch (error) {
          console.error("Erreur lors de la suppression du fichier JSON :", error);
        }
      }

      async getPatient(id_patient: string): Promise<Patient | null> {
        try {
          const patient = await this.patientRepository.findByPatientId(id_patient);
          if (!patient) {
            console.error("Patient non trouvé :", id_patient);
            return null;
          }
          return patient;
        } catch (error) {
          console.error("Erreur lors de la lecture du fichier JSON :", error);
          return null;
        }
      }
      

      async syncPatients(): Promise<boolean> {
        try {
          const deletedPatientsSynced = await this.syncDeletedPatients();
          console.log("Patients supprimés synchronisés :", deletedPatientsSynced);
          if (!deletedPatientsSynced) {
            console.error("Erreur lors de la synchronisation des patients supprimés");
            Logger.log("error", "Erreur lors de la synchronisation des patients supprimés");
            return false;
          }
          const updatedPatientsSynced = await this.sendCreatedPatientsToServer();
          console.log("Patients mis à jour synchronisés :", updatedPatientsSynced);
          if (!updatedPatientsSynced) {
            console.error("Erreur lors de la synchronisation des patients mis à jour");
            Logger.log("error", "Erreur lors de la synchronisation des patients mis à jour");
            return false;
          }

          await setLastSyncDate(new Date().toISOString());
          
          return true;
        } catch (error) {
          console.error("Erreur lors de la synchronisation des patients :", error);
          return false;
        }
      }


      private async syncDeletedPatients(): Promise<boolean> {
        try {
          const lastSyncDate = await getLastSyncDate();
          const deletedPatients = await this.patientRepository.getDeletedPatientsOnLocalDB();
    
          const errors: PatientDeletedSyncError[] = [];
      
          const requests = deletedPatients.map(async (patient) => {
            const url = `${this.getBaseUrl()}/api/v2/json/mobile/trafic/events/${SYNCHRO_DELETE_LOCAL_PATIENTS}?token=${this.getToken()}&app_version=${APP_VERSION}&user_last_sync_date=${lastSyncDate}&patientID=${patient.id_patient}`;
      
            try {
              if (!patient.id) {
                throw new Error(` Patient avec l'ID ${patient.id_patient} non trouvé`);
              } 
              const response = await axios.post(url);
              if (response.status !== 200) {
                throw new Error(`Erreur HTTP: ${response.status}`);
              }
              this.patientRepository.forceDelete(patient.id);
              Logger.info(`${SYNCHRO_DELETE_LOCAL_PATIENTS} ${patient.id_patient}: ${response.data}`);
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
              Logger.error(`${SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED} ${patient.id_patient}: ${errorMsg}`);
              errors.push({ patientId: patient.id_patient, error: errorMsg });
            }
          });
      
          await Promise.allSettled(requests);
      
          if (errors.length > 0) {
            console.warn("Patients non synchronisés :", errors);
            Logger.error("syncDeletedPatients Failed :", errors);
            sendTraficAuditEvent(SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED,SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED + " " + errors);
            return false;
          }
      
          Logger.info("syncDeletedPatients Success :", deletedPatients);
          sendTraficAuditEvent(SYNCHRO_DELETE_LOCAL_PATIENTS,SYNCHRO_DELETE_LOCAL_PATIENTS + " " + deletedPatients);
          return true;
      
        } catch (error) {
          console.error("Erreur globale dans syncDeletedPatients :", error);
          sendTraficAuditEvent(SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED,SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED + " " + error);
          return false;
        }
      }
      

      private async sendCreatedPatientsToServer(): Promise<boolean> {
        console.log("sendCreatedPatientsToServer");
        try {
          const lastSyncDate = await getLastSyncDate();
          console.log("lastSyncDate", lastSyncDate);
          const patients = await this.patientRepository.getAllPatientsUpdatedAtIsGreaterThanLastSyncDateOnLocalDB(lastSyncDate);
          const errors: PatientUpdatedSyncError[] = [];
          console.log("patients", patients);
          const requests = patients.map(async (patient) => {
            const url = `${this.getBaseUrl()}/api/json/mobile/patients/synchro?token=${this.getToken()}&app_version=${APP_VERSION}&user_last_sync_date=${lastSyncDate}`;
            try {
              if (!patient.id) {
                throw new Error(` Patient avec l'ID ${patient.id_patient} non trouvé`);
              } 
              const response = await axios.post(url, { data: JSON.stringify(patient) });
              if (response.status !== 201) {
                throw new Error(`Erreur HTTP: ${response.status}`);
              }
              this.patientRepository.markToSynced(patient.id);
              Logger.info(`${SYNCHRO_UPLOAD_LOCAL_PATIENTS} ${patient.id_patient}: ${response.data}`);
              console.log(`${SYNCHRO_UPLOAD_LOCAL_PATIENTS} ${patient.id_patient}: ${response.data}`);
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
              Logger.error(`${SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED} ${patient.id_patient}: ${errorMsg}`);
              console.log(`${SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED} ${patient.id_patient}: ${errorMsg}`);
              errors.push({ patientId: patient.id_patient, error: errorMsg });
            }
          });

          await Promise.allSettled(requests);

          if (errors.length > 0) {
            console.warn("Patients non synchronisés :", errors);
            Logger.error("sendCreatedPatientsToServer Failed :", errors);
            sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED,SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED + " " + errors);
            return false;
          }

          Logger.info("sendCreatedPatientsToServer Success :", patients);
          sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_PATIENTS,SYNCHRO_UPLOAD_LOCAL_PATIENTS + " " + patients);
          return true;

        } catch (error) {
          console.error("Erreur lors de la synchronisation des patients mis à jour :", error);
          return false;
        }
      }

      
      

      
}



