import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';
import config from '../Config';
import { API_HEADER, APP_VERSION, PATH_OF_PATIENTS_DIR_ON_THE_LOCAL } from "../Constants/App";
import { ConsultationRepository } from '../Repositories/ConsultationRepository';
import { PatientRepository } from "../Repositories/PatientRepository";
import { getLastSyncDate } from '../functions';
import { setLastSyncDate } from '../functions/syncHelpers';
import { ConsultationMapper } from '../mappers/consultationMapper';
import { PatientMapper } from '../mappers/patientMapper';
import Patient from "../models/Patient";
import { ConsultationSyncError, PatientDeletedSyncError, PatientFormData, PatientSyncDataResponseOfGetAllServer, PatientUpdatedSyncError } from "../types";
import Logger from '../utils/Logger';
import { sendTraficAuditEvent } from '../utils/traficAudit';
import { SYNCHRO_DELETE_LOCAL_PATIENTS, SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED, SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS, SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS_FAILDED, SYNCHRO_UPLOAD_LOCAL_PATIENTS, SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED } from './../Constants/syncAudit';
import Service from "./core/Service";


export default class PatientService extends Service {
  private patientRepository: PatientRepository;
  private consultationRepository: ConsultationRepository;


  constructor() {
    super();
    this.patientRepository = new PatientRepository();
    this.consultationRepository = new ConsultationRepository();
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

  async updateOnTheLocalDb(patientId: string, patientFormData: PatientFormData): Promise<void> {
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
      if (!id) { throw new Error(` Patient avec l'ID ${patientId} non trouvé`); }
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
      const sendCreatedPatientsToServer = await this.sendCreatedPatientsToServer();
      console.log("Patients mis à jour synchronisés :", sendCreatedPatientsToServer);
      if (!sendCreatedPatientsToServer) {
        console.error("Erreur lors de la synchronisation des patients mis à jour");
        Logger.log("error", "Erreur lors de la synchronisation des patients mis à jour");
        return false;
      }

      const sendDataToCreatedConsultationsToServer = await this.sendCreatedConsultationsToServer();
      console.log("Consultations créées synchronisées :", sendDataToCreatedConsultationsToServer);
      if (!sendDataToCreatedConsultationsToServer) {
        console.error("Erreur lors de la synchronisation des consultations créées");
        Logger.log("error", "Erreur lors de la synchronisation des consultations créées");
        return false;
      }

      const getAllPatientOnServer = await this.getAllPatientOnServer();
      console.log("Patients synchronisés :", getAllPatientOnServer);
      if (!getAllPatientOnServer) {
        console.error("Erreur lors de la synchronisation des patients");
        Logger.log("error", "Erreur lors de la synchronisation des patients");
        return false;
      }

      const getAllDeletedPatientOnServer = await this.getAllDeletedPatientOnServer();
      console.log("Patients supprimés synchronisés :", getAllDeletedPatientOnServer);
      if (!getAllDeletedPatientOnServer) {
        console.error("Erreur lors de la synchronisation des patients supprimés");
        Logger.log("error", "Erreur lors de la synchronisation des patients supprimés");
        return false;
      }

      if (config.isPictureSyncEnabled) {
        const syncPictures = await this.syncPictures();
        console.log("Images synchronisées :", syncPictures);
        if (!syncPictures) {
          console.error("Erreur lors de la synchronisation des images");
          Logger.log("error", "Erreur lors de la synchronisation des images");
          return false;
        }
      }


      await setLastSyncDate(new Date().toISOString());
      Logger.log("info", "Patients synchronisés");
      console.log("Patients synchronisés");
      

      return true;
    } catch (error) {
      console.error("Erreur lors de la synchronisation des patients :", error);
      Logger.log("error", "Erreur lors de la synchronisation des patients", { error });
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
        sendTraficAuditEvent(SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED, SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED + " " + errors);
        return false;
      }

      Logger.info("syncDeletedPatients Success :", deletedPatients);
      sendTraficAuditEvent(SYNCHRO_DELETE_LOCAL_PATIENTS, SYNCHRO_DELETE_LOCAL_PATIENTS + " " + deletedPatients);
      return true;

    } catch (error) {
      console.error("Erreur globale dans syncDeletedPatients :", error);
      sendTraficAuditEvent(SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED, SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED + " " + error);
      return false;
    }
  }


  private async sendCreatedPatientsToServer(): Promise<boolean> {
    try {
      const lastSyncDate = await getLastSyncDate();
      const patients = await this.patientRepository.getAllPatientsUpdatedAtIsGreaterThanLastSyncDateOnLocalDB(lastSyncDate);
      const errors: PatientUpdatedSyncError[] = [];
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
        sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED, SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED + " " + errors);
        return false;
      }

      Logger.info("sendCreatedPatientsToServer Success :", patients);
      sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_PATIENTS, SYNCHRO_UPLOAD_LOCAL_PATIENTS + " " + patients);
      return true;

    } catch (error) {
      console.error("Erreur lors de la synchronisation des patients mis à jour :", error);
      return false;
    }
  }


  private async sendCreatedConsultationsToServer(): Promise<boolean> {
    try {
      const lastSyncDate = await getLastSyncDate();
      const consultations = await this.consultationRepository.getConsultationsGroupedByPatientOnLocalDB(lastSyncDate);
      const errors: ConsultationSyncError[] = [];
      const requests = Object.entries(consultations).map(async ([patientId, consultations]) => {
        const url = `${this.getBaseUrl()}/api/v2/json/mobile/patients/medicaldata/synchro/submissions/batch?token=${this.getToken()}&app_version=${APP_VERSION}&user_last_sync_date=${lastSyncDate}&patientID=${patientId}&lat&lon`;
        try {
          const consultationsSyncData = consultations.map((consultation) => ConsultationMapper.toConsultationCreatedSyncData(consultation));
          const response = await axios.post(url, { data: JSON.stringify(consultationsSyncData) });
          if (response.status !== 201 && response.status !== 200) {
            throw new Error(`Erreur HTTP: ${response.status}  : ${response.statusText}`);
          }
          this.consultationRepository.markToSynced(patientId);
          Logger.info(`${SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS} ${patientId}: ${response.data}`);
          console.log(`${SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS} ${patientId}: ${response.data}`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
          Logger.error(`${SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS_FAILDED} ${patientId}: ${errorMsg}`);
          console.log(`${SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS_FAILDED} ${patientId}: ${errorMsg}`);
          errors.push({ consultationId: patientId, error: errorMsg });
        }
      });
      await Promise.allSettled(requests);

      if (errors.length > 0) {
        console.warn("Consultations non synchronisées :", errors);
        Logger.error("sendCreatedConsultationsToServer Failed :", errors);
        sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS_FAILDED, SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS_FAILDED + " " + errors);
        return false;
      }
      Logger.info("sendCreatedConsultationsToServer Success :", consultations);
      sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS, SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS + " " + consultations);
      return true;

    } catch (error) {
      console.error("Erreur lors de la synchronisation des consultations créées :", error);
      Logger.error("sendCreatedConsultationsToServer Failed :", { error });
      sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS_FAILDED, SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS_FAILDED + " " + error);
      return false;
    }
  }


  private async syncPictures(): Promise<boolean> {
    try {
      console.log(`Syncing pictures en cours : `);
      return true;
    } catch (error) {
      console.error("Erreur lors de la synchronisation des images :", error);
      return false;
    }
  }

  private async getAllPatientOnServer(): Promise<boolean> {
    try {
      const lastSyncDate = await getLastSyncDate();
      const url = `${this.getBaseUrl()}/api/json/mobile/patients/medicaldata/all?token=${this.getToken()}&app_version=${APP_VERSION}&user_last_sync_date=${lastSyncDate}`;
      console.log("Get sync patients : ", url);
      const response = await axios.get(url);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const patients = response.data as PatientSyncDataResponseOfGetAllServer[];
      this.patientRepository.createOrUpdateAll(patients);

      sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_PATIENTS, SYNCHRO_UPLOAD_LOCAL_PATIENTS);
      return true;
    } catch (error) {
      console.error("Erreur lors de la synchronisation des patients :", error);
      sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED, SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED);
      return false;
    }
  }

  private async getAllDeletedPatientOnServer(): Promise<boolean> {
    try {
      const lastSyncDate = await getLastSyncDate();
     /*  const url = `${this.getBaseUrl()}/api/v2/json/mobile/patients/deleted/all?token=${this.getToken()}&app_version=${APP_VERSION}&user_last_sync_date=${lastSyncDate}`;
      const response = await axios.get(url);
      console.log("Get sync deleted patients : ", url);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      } 
      const deletedPatients = response.data;
      console.log("Get sync deleted patients : ", deletedPatients);*/
      sendTraficAuditEvent(SYNCHRO_DELETE_LOCAL_PATIENTS, SYNCHRO_DELETE_LOCAL_PATIENTS);
      return true;
    } catch (error) {
      console.error("Erreur lors de la synchronisation des patients supprimés :", error);
      sendTraficAuditEvent(SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED, SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED);
      return false;
    }
  }




}



