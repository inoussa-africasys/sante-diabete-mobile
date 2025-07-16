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
import { ConsultationSyncError, PatientDeletedSyncError, PatientFormData, PatientSyncDataResponseOfGetAllMedicalDataServer, PatientUpdatedSyncError, SyncOnlyOnTraitementReturnType, SyncPatientReturnType } from "../types";
import Logger from '../utils/Logger';
import { TraficFolder } from '../utils/TraficFolder';
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
      patientClass.date = new Date().toISOString();
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

      const folderUri = `${FileSystem.documentDirectory}${TraficFolder.getPatientsFolderPath(this.getTypeDiabete())}`;
      const fileUri = `${folderUri}/${fileName}`;

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
      patientToUpdate.isModified = true;
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
      const folderUri = `${FileSystem.documentDirectory}${TraficFolder.getPatientsFolderPath(this.getTypeDiabete())}/`;
      const fileUri = `${folderUri}${id_patient}.json`;

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        console.warn("Le fichier patient n'existe pas :", fileUri);
        Logger.warn("Le fichier patient n'existe pas :", { fileUri });
        const patient = await this.patientRepository.findAllByPatientId(id_patient);
        if (!patient) { throw new Error(` Patient avec l'ID ${id_patient} non trouvé`); }
        this.savePatientAsJson(patient);
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


  async syncPatients(): Promise<SyncPatientReturnType> {
    try {
      const errors: string[] = [];

      // Synchroniser les patients supprimés
      const syncDeletedPatientsResult = await this.syncDeletedPatients();
      console.log("Patients supprimés synchronisés in local db:", syncDeletedPatientsResult.success);
      if (!syncDeletedPatientsResult.success) {
        console.error("Erreur lors de la synchronisation des patients supprimés");
        Logger.log("error", "Erreur lors de la synchronisation des patients supprimés");
        if (syncDeletedPatientsResult.errors) {
          errors.push(...syncDeletedPatientsResult.errors);
        }
      }

      // Envoyer les patients créés ou mis à jour au serveur
      const sendCreatedOrUpdatedPatientsResult = await this.sendCreatedOrUpdatedPatientsToServer();
      console.log("Patients mis à jour synchronisés in local db:", sendCreatedOrUpdatedPatientsResult.success);
      if (!sendCreatedOrUpdatedPatientsResult.success) {
        console.error("Erreur lors de la synchronisation des patients mis à jour");
        Logger.log("error", "Erreur lors de la synchronisation des patients mis à jour");
        if (sendCreatedOrUpdatedPatientsResult.errors) {
          errors.push(...sendCreatedOrUpdatedPatientsResult.errors);
        }
      }

      // Envoyer les consultations créées au serveur
      const sendCreatedConsultationsResult = await this.sendCreatedConsultationsToServer();
      console.log("Consultations créées synchronisées in local db:", sendCreatedConsultationsResult.success);
      if (!sendCreatedConsultationsResult.success) {
        console.error("Erreur lors de la synchronisation des consultations créées");
        Logger.log("error", "Erreur lors de la synchronisation des consultations créées");
        if (sendCreatedConsultationsResult.errors) {
          errors.push(...sendCreatedConsultationsResult.errors);
        }
      }

      // Récupérer tous les patients du serveur
      const getAllPatientResult = await this.getAllPatientOnServer();
      console.log("Patients synchronisés get Medical Data:", getAllPatientResult.success);
      if (!getAllPatientResult.success) {
        console.error("Erreur lors de la synchronisation des patients");
        Logger.log("error", "Erreur lors de la synchronisation des patients");
        if (getAllPatientResult.errors) {
          errors.push(...getAllPatientResult.errors);
        }
      }

      // Récupérer tous les patients supprimés du serveur
      const getAllDeletedPatientResult = await this.getAllDeletedPatientOnServer();
      console.log("Patients supprimés synchronisés on the server:", getAllDeletedPatientResult.success);
      if (!getAllDeletedPatientResult.success) {
        console.error("Erreur lors de la synchronisation des patients supprimés");
        Logger.log("error", "Erreur lors de la synchronisation des patients supprimés");
        if (getAllDeletedPatientResult.errors) {
          errors.push(...getAllDeletedPatientResult.errors);
        }
      }

      // Synchroniser les images si activé
      let syncPicturesResult: SyncOnlyOnTraitementReturnType = {
        success: true,
        message: "Synchronisation des images ignorée (désactivée)",
        statistics: { total: 0, success: 0, failed: 0 }
      };

      if (config.isPictureSyncEnabled) {
        /* syncPicturesResult = await this.syncPictures(); */
        console.log("Images synchronisées on the server:", syncPicturesResult.success);
        if (!syncPicturesResult.success) {
          console.error("Erreur lors de la synchronisation des images");
          Logger.log("error", "Erreur lors de la synchronisation des images");
          if (syncPicturesResult.errors) {
            errors.push(...syncPicturesResult.errors);
          }
        }
      }

      await setLastSyncDate(new Date().toISOString());

      Logger.log("info", "Patients synchronisés");
      console.log("Patients synchronisés");

      // Créer l'objet de retour avec toutes les statistiques
      const result: SyncPatientReturnType = {
        success: errors.length === 0,
        message: errors.length === 0 ? "Synchronisation effectuée avec succès" : "Synchronisation terminée avec des erreurs",
        errors: errors.length > 0 ? errors : undefined,
        statistics: {
          syncDeletedPatients: syncDeletedPatientsResult.statistics,
          sendCreatedOrUpdatedPatientsToServer: sendCreatedOrUpdatedPatientsResult.statistics,
          sendCreatedConsultationsToServer: sendCreatedConsultationsResult.statistics,
          getAllPatientOnServer: getAllPatientResult.statistics,
          getAllDeletedPatientOnServer: getAllDeletedPatientResult.statistics,
          syncPictures: syncPicturesResult.statistics
        }
      };

      return result;
    } catch (error) {
      console.error("Erreur lors de la synchronisation des patients :", error);
      Logger.log("error", "Erreur lors de la synchronisation des patients", { error });

      return {
        success: false,
        message: "Erreur lors de la synchronisation des patients",
        errors: [error instanceof Error ? error.message : JSON.stringify(error)],
        statistics: {
          syncDeletedPatients: { total: 0, success: 0, failed: 0 },
          sendCreatedOrUpdatedPatientsToServer: { total: 0, success: 0, failed: 0 },
          sendCreatedConsultationsToServer: { total: 0, success: 0, failed: 0 },
          getAllPatientOnServer: { total: 0, success: 0, failed: 0 },
          getAllDeletedPatientOnServer: { total: 0, success: 0, failed: 0 },
          syncPictures: { total: 0, success: 0, failed: 0 }
        }
      };
    }
  }

  private async syncDeletedPatients(): Promise<SyncOnlyOnTraitementReturnType> {
    try {
      const deletedPatients = await this.patientRepository.getDeletedPatientsOnLocalDB();
      const totalDeletedPatients = deletedPatients.length;
      let deletedPatientsSynced = 0;
      const lastSyncDate = await getLastSyncDate();

      const errors: PatientDeletedSyncError[] = [];
      const errorMessages: string[] = [];

      const requests = deletedPatients.map(async (patient) => {
        const url = `${this.getBaseUrl()}/api/json/mobile/patients?token=${this.getToken()}&app_version=${APP_VERSION}&user_last_sync_date=${lastSyncDate}&patientID=${patient.id_patient}`;

        try {
          if (!patient.id) {
            throw new Error(` Patient avec l'ID ${patient.id_patient} non trouvé`);
          }
          console.log("Sync deleted patients : ", url);
          const response = await axios.post(url);
          if (response.status !== 200 && response.status !== 201) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          this.patientRepository.forceDelete(patient.id);
          Logger.info(`${SYNCHRO_DELETE_LOCAL_PATIENTS} ${patient.id_patient}: ${response.data}`);
          deletedPatientsSynced++;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
          Logger.error(`${SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED} ${patient.id_patient}: ${errorMsg}`);
          errors.push({ patientId: patient.id_patient, error: errorMsg });
          errorMessages.push(`Erreur pour le patient ${patient.id_patient}: ${errorMsg}`);
        }
      });

      await Promise.allSettled(requests);

      const success = errors.length === 0;

      if (!success) {
        console.warn("Patients non synchronisés :", errors);
        Logger.error("syncDeletedPatients Failed :", errors);
        sendTraficAuditEvent(SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED, SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED + " " + errors);
      } else {
        Logger.info("syncDeletedPatients Success :", deletedPatients);
        console.log("syncDeletedPatients Success :", deletedPatientsSynced + "/" + totalDeletedPatients);
        sendTraficAuditEvent(SYNCHRO_DELETE_LOCAL_PATIENTS, SYNCHRO_DELETE_LOCAL_PATIENTS + " " + deletedPatients);
      }

      return {
        success,
        message: success ? "Synchronisation des patients supprimés réussie" : "Erreur lors de la synchronisation des patients supprimés",
        errors: errorMessages.length > 0 ? errorMessages : undefined,
        statistics: {
          total: totalDeletedPatients,
          success: deletedPatientsSynced,
          failed: totalDeletedPatients - deletedPatientsSynced
        }
      };

    } catch (error) {
      console.error("Erreur globale dans syncDeletedPatients :", error);
      sendTraficAuditEvent(SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED, SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED + " " + error);

      return {
        success: false,
        message: "Erreur lors de la synchronisation des patients supprimés",
        errors: [error instanceof Error ? error.message : JSON.stringify(error)],
        statistics: {
          total: 0,
          success: 0,
          failed: 0
        }
      };
    }
  }

  private async sendCreatedOrUpdatedPatientsToServer(): Promise<SyncOnlyOnTraitementReturnType> {
    try {
      let patientsSynced = 0;
      const lastSyncDate = await getLastSyncDate();
      const patients = await this.patientRepository.getAllPatientsUpdatedAtIsGreaterThanLastSyncDateOnLocalDB(lastSyncDate);
      const errors: PatientUpdatedSyncError[] = [];
      const errorMessages: string[] = [];
      const totalPatients = patients.length;

      const requests = patients.map(async (patient) => {
        const url = `${this.getBaseUrl()}/api/json/mobile/patients/synchro?token=${this.getToken()}&app_version=${APP_VERSION}&user_last_sync_date=${lastSyncDate}`;
        console.log("Send created or updated patients to server : ", url);
        try {
          if (!patient.identifier) {
            throw new Error(` Patient avec l'ID ${patient.identifier} non trouvé`);
          }
          const response = await axios.post(url, patient);
          console.log("Send created or updated patients to server : ", JSON.stringify(patient));
          if (response.status !== 201 && response.status !== 200) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          //this.patientRepository.markToSyncedByIdPatient(patient.identifier);
          Logger.info(`${SYNCHRO_UPLOAD_LOCAL_PATIENTS} ${patient.identifier}: ${response.status} : ${response.data}`);
          console.info(`${SYNCHRO_UPLOAD_LOCAL_PATIENTS} ${patient.identifier}: ${response.status} : ${JSON.stringify(response.data)}`);
          patientsSynced++;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
          Logger.error(`${SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED} ${patient.identifier}: ${errorMsg}`);
          console.error(`${SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED} ${patient.identifier}: ${errorMsg}`);
          errors.push({ patientId: patient.identifier, error: errorMsg });
          errorMessages.push(`Erreur pour le patient ${patient.identifier}: ${errorMsg}`);
        }
      });

      await Promise.allSettled(requests);

      const success = errors.length === 0;

      if (!success) {
        console.warn("Patients non synchronisés :", errors);
        Logger.error("sendCreatedPatientsToServer Failed :", errors);
        sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED, SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED + " " + errors);
      } else {
        Logger.info("sendCreatedPatientsToServer Success :", patients);
        console.info("sendCreatedPatientsToServer Success :", patientsSynced + "/" + totalPatients);
        sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_PATIENTS, SYNCHRO_UPLOAD_LOCAL_PATIENTS + " " + patients);
      }

      return {
        success,
        message: success ? "Synchronisation des patients créés/mis à jour réussie" : "Erreur lors de la synchronisation des patients créés/mis à jour",
        errors: errorMessages.length > 0 ? errorMessages : undefined,
        statistics: {
          total: totalPatients,
          success: patientsSynced,
          failed: totalPatients - patientsSynced
        }
      };

    } catch (error) {
      console.error("Erreur lors de la synchronisation des patients mis à jour :", error);

      return {
        success: false,
        message: "Erreur lors de la synchronisation des patients créés/mis à jour",
        errors: [error instanceof Error ? error.message : JSON.stringify(error)],
        statistics: {
          total: 0,
          success: 0,
          failed: 0
        }
      };
    }
  }


  private async sendCreatedConsultationsToServer(): Promise<SyncOnlyOnTraitementReturnType> {
    try {
      let consultationsSynced = 0;
      const lastSyncDate = await getLastSyncDate();
      const consultations = await this.consultationRepository.getConsultationsGroupedByPatientOnLocalDB(lastSyncDate);
      const errors: ConsultationSyncError[] = [];
      const errorMessages: string[] = [];
      const totalConsultations = Object.values(consultations).flat().length;

      const requests = Object.entries(consultations).map(async ([patientId, consultations]) => {
        const url = `${this.getBaseUrl()}/api/v2/json/mobile/patients/medicaldata/synchro/submissions/batch?token=${this.getToken()}&app_version=${APP_VERSION}&user_last_sync_date=${lastSyncDate}&patientID=${patientId}&lat&lon`;
        console.log(`URL: ${url}`);
        try {
          const consultationsSyncData = consultations.map((consultation) => ConsultationMapper.toConsultationCreatedSyncData(consultation));
          const response = await axios.post(url, { data: JSON.stringify(consultationsSyncData) });
          if (response.status !== 201 && response.status !== 200) {
            throw new Error(`Erreur HTTP: ${response.status}  : ${response.statusText}`);
          }
          this.consultationRepository.markToSynced(patientId);
          Logger.info(`${SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS} ${patientId}: ${response.status} : ${response.statusText}`);
          console.info(`${SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS} ${patientId}: ${response.status} : ${response.statusText}`);
          consultationsSynced += consultations.length;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
          Logger.error(`${SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS_FAILDED} ${patientId}: ${errorMsg}`);
          console.error(`${SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS_FAILDED} ${patientId}: ${errorMsg}`);
          errors.push({ consultationId: "Patient id : " + patientId, error: errorMsg });
          errorMessages.push(`Erreur pour les consultations du patient ${patientId}: ${errorMsg}`);
        }
      });
      await Promise.allSettled(requests);

      const success = errors.length === 0;

      if (!success) {
        console.warn("Consultations non synchronisées :", errors);
        Logger.error("sendCreatedConsultationsToServer Failed :", errors);
        sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS_FAILDED, SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS_FAILDED + " " + errors);
      } else {
        Logger.info("sendCreatedConsultationsToServer Success :", consultations);
        console.log("sendCreatedConsultationsToServer Success :", consultationsSynced + "/" + totalConsultations);
        sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS, SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS + " " + consultations);
      }

      return {
        success,
        message: success ? "Synchronisation des consultations réussie" : "Erreur lors de la synchronisation des consultations",
        errors: errorMessages.length > 0 ? errorMessages : undefined,
        statistics: {
          total: totalConsultations,
          success: consultationsSynced,
          failed: totalConsultations - consultationsSynced
        }
      };

    } catch (error) {
      console.error("Erreur lors de la synchronisation des consultations créées :", error);
      Logger.error("sendCreatedConsultationsToServer Failed :", { error });
      sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS_FAILDED, SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS_FAILDED + " " + error);

      return {
        success: false,
        message: "Erreur lors de la synchronisation des consultations",
        errors: [error instanceof Error ? error.message : JSON.stringify(error)],
        statistics: {
          total: 0,
          success: 0,
          failed: 0
        }
      };
    }
  }


  private async syncPictures(): Promise<SyncOnlyOnTraitementReturnType> {
    try {
      // Si la synchronisation des images est désactivée, on retourne un succès sans statistiques
      if (!config.isPictureSyncEnabled) {
        return {
          success: true,
          message: "Synchronisation des images désactivée",
          statistics: {
            total: 0,
            success: 0,
            failed: 0
          }
        };
      }

      try {
        const resultGet = await this.getPicturesOnTheServer();


        const resultPost = await this.sendPicturesOnTheServer();

        if (resultGet.success && resultPost.success) {
          return {
            success: true,
            message: "Synchronisation des images réussie",
            statistics: {
              total: resultGet.statistics.total + resultPost.statistics.total,
              success: resultGet.statistics.success + resultPost.statistics.success,
              failed: resultGet.statistics.failed + resultPost.statistics.failed
            }
          }
        } else {
          return {
            success: false,
            message: "Erreur lors de la synchronisation des images",
            errors: ["Erreur lors de la synchronisation des images", JSON.stringify(resultGet.errors), JSON.stringify(resultPost.errors)],
            statistics: {
              total: 0,
              success: 0,
              failed: 0
            }
          }
        }


      } catch (error) {
        console.error("Erreur lors de la synchronisation des images :", error);
        return {
          success: false,
          message: "Erreur lors de la synchronisation des images",
          errors: [error instanceof Error ? error.message : JSON.stringify(error)],
          statistics: {
            total: 0,
            success: 0,
            failed: 0
          }
        };
      }

    } catch (error) {
      console.error("Erreur lors de la synchronisation des images :", error);

      return {
        success: false,
        message: "Erreur lors de la synchronisation des images",
        errors: [error instanceof Error ? error.message : JSON.stringify(error)],
        statistics: {
          total: 0,
          success: 0,
          failed: 0
        }
      };
    }
  }


  private async getPicturesOnTheServer(): Promise<SyncOnlyOnTraitementReturnType> {
    const lastSyncDate = await getLastSyncDate();
    const patients = await this.patientRepository.getAllPatientsUpdatedAtIsGreaterThanLastSyncDateOnLocalDB(lastSyncDate);
    const totalPatients = patients.length;
    let patientsPicturesSynced = 0;
    const errors: PatientUpdatedSyncError[] = [];
    const errorMessages: string[] = [];

    for (const patient of patients) {
      try {
        const url = `${this.getBaseUrl()}/api/json/mobile/patients/media?patientID=${patient.identifier}&token=${this.getToken()}&app_version=${APP_VERSION}&user_last_sync_date=${lastSyncDate}`;
        console.log("Get sync patient media:", url);

        const response = await axios.get(url);

        if (response.status !== 200 && response.status !== 201) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        console.log("Get sync patient media response:", response.data);

        /*         const patientsPictures = response.data as PatientSyncDataResponseOfGetAllMedicalDataServer[];
                await this.patientRepository.createOrUpdateAll(patientsPictures); */

        /* sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_PATIENTS, SYNCHRO_UPLOAD_LOCAL_PATIENTS); */
        /* patientsPicturesSynced++; */
      } catch (error) {
        const errorMessage = `Erreur pour le patient ${patient.identifier}: ${error instanceof Error ? error.message : JSON.stringify(error)}`;
        console.error(errorMessage);
        errorMessages.push(errorMessage);
        errors.push({
          patientId: patient.identifier,
          error: errorMessage
        });
      }
    }

    return {
      success: errorMessages.length === 0,
      message: errorMessages.length === 0
        ? "Récupération des patients du serveur réussie"
        : "Des erreurs sont survenues pendant la récupération des patients",
      errors: errorMessages,
      statistics: {
        total: totalPatients,
        success: patientsPicturesSynced,
        failed: totalPatients - patientsPicturesSynced
      }
    };
  }


  private async sendPicturesOnTheServer(): Promise<SyncOnlyOnTraitementReturnType> {

    const lastSyncDate = await getLastSyncDate();
    const patients = await this.patientRepository.getAllPatientsPicturesUpdatedAtIsGreaterThanLastSyncDateOnLocalDB(lastSyncDate);
    const totalPatients = patients.length;
    let patientsPicturesSynced = 0;
    const errors: PatientUpdatedSyncError[] = [];
    const errorMessages: string[] = [];

    for (const patient of patients) {
      try {
        const url = `${this.getBaseUrl()}/api/json/mobile/patients/media?token=${this.getToken()}&app_version=${APP_VERSION}&user_last_sync_date=${lastSyncDate}&patientID=${patient.identifier}&media=${patient.photo}`;

        /*  const response = await axios.post(url);
         if (response.status !== 200 && response.status !== 201) {
           throw new Error(`Erreur HTTP: ${response.status}`);
         } */
        patientsPicturesSynced++;
      } catch (error) {
        const errorMessage = `Erreur pour le patient ${patient.identifier}: ${error instanceof Error ? error.message : JSON.stringify(error)}`;
        console.error(errorMessage);
        errorMessages.push(errorMessage);
        errors.push({
          patientId: patient.identifier,
          error: errorMessage
        });
      }
    }

    return {
      success: errorMessages.length === 0,
      message: errorMessages.length === 0
        ? "Synchronisation des images réussie"
        : "Des erreurs sont survenues pendant la synchronisation des images",
      errors: errorMessages,
      statistics: {
        total: totalPatients,
        success: patientsPicturesSynced,
        failed: totalPatients - patientsPicturesSynced
      }
    };

  }


  private async getAllPatientOnServer(): Promise<SyncOnlyOnTraitementReturnType> {
    try {
      const lastSyncDate = await getLastSyncDate();
      const url = `${this.getBaseUrl()}/api/v3/json/mobile/patients/medicaldata/all?token=${this.getToken()}&app_version=${APP_VERSION}&user_last_sync_date=${lastSyncDate}`;
      const response = await axios.get(url);

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const patients = response.data as PatientSyncDataResponseOfGetAllMedicalDataServer[];
      await this.patientRepository.createOrUpdateAll(patients);
      const totalPatients = patients.length;

      sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_PATIENTS, SYNCHRO_UPLOAD_LOCAL_PATIENTS);

      return {
        success: true,
        message: "Récupération des patients du serveur réussie",
        statistics: {
          total: totalPatients,
          success: totalPatients,
          failed: 0
        }
      };
    } catch (error) {
      console.error("Erreur lors de la synchronisation des patients :", error);
      sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED, SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED);

      return {
        success: false,
        message: "Erreur lors de la récupération des patients du serveur",
        errors: [error instanceof Error ? error.message : JSON.stringify(error)],
        statistics: {
          total: 0,
          success: 0,
          failed: 0
        }
      };
    }
  }

  private async getAllDeletedPatientOnServer(): Promise<SyncOnlyOnTraitementReturnType> {
    try {
      const lastSyncDate = await getLastSyncDate();
      const url = `${this.getBaseUrl()}/api/v3/json/mobile/patients/deleted/all?token=${this.getToken()}&app_version=${APP_VERSION}&user_last_sync_date=${lastSyncDate}`;
      const response = await axios.get(url);
      console.log("Get all deleted patient on server : ", url);

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const patients = response.data as PatientSyncDataResponseOfGetAllMedicalDataServer[];
      await this.deleteAll(patients.map(p => p.identifier));
      const totalPatients = patients.length;

      await sendTraficAuditEvent(SYNCHRO_DELETE_LOCAL_PATIENTS, SYNCHRO_DELETE_LOCAL_PATIENTS);

      return {
        success: true,
        message: "Récupération des patients supprimés du serveur réussie",
        statistics: {
          total: totalPatients,
          success: totalPatients,
          failed: 0
        }
      };
    } catch (error) {
      console.error("Erreur lors de la synchronisation des patients supprimés :", error);
      sendTraficAuditEvent(SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED, SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED);

      return {
        success: false,
        message: "Erreur lors de la récupération des patients supprimés du serveur",
        errors: [error instanceof Error ? error.message : JSON.stringify(error)],
        statistics: {
          total: 0,
          success: 0,
          failed: 0
        }
      };
    }
  }

  countPatientsCreatedOrUpdatedSince = async (date: string, diabetesType: string): Promise<any> => {
    return this.patientRepository.countPatientsCreatedOrUpdatedSince(date, diabetesType);
  }

  sendToCreateOrUpdatedOnlyOnePatient = async (patient: PatientFormData): Promise<boolean> => {
    try {
      const response = await axios.post(this.getFullUrl('/api/json/mobile/patient'), patient, {
        headers: API_HEADER
      });
      return true;
    } catch (error) {
      console.error('Erreur réseau :', error);
      Logger.log('error', 'Error sending patient to create or updated only one patient on the server', { error });
      return false;
    }
  };

  private deleteAll = async (patientIds: string[]): Promise<void> => {
    try {
      await this.patientRepository.deleteAll(patientIds);
      await this.deleteAllFiles(patientIds);

    } catch (error) {
      console.error('Erreur lors de la suppression des patients :', error);
      Logger.error('Erreur lors de la suppression des patients :', { error });
    }
  };

  private deleteAllFiles = async (patientIds: string[]): Promise<void> => {
    try {
      const folderUri = `${FileSystem.documentDirectory}${PATH_OF_PATIENTS_DIR_ON_THE_LOCAL}/`;
      const files = await FileSystem.readDirectoryAsync(folderUri);
      const filesToDelete = files.filter(file => patientIds.includes(file));
      await Promise.all(filesToDelete.map(file => FileSystem.deleteAsync(`${folderUri}${file}`)));
    } catch (error) {
      console.error('Erreur lors de la suppression des fichiers :', error);
      Logger.error('Erreur lors de la suppression des fichiers :', { error });
    }
  };

}



