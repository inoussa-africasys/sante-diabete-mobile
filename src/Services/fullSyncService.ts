import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import config from '../Config';
import { APP_VERSION, PATH_OF_PATIENTS_DIR_ON_THE_LOCAL } from '../Constants/App';
import useConfigStore from '../core/zustand/configStore';
import { setLastSyncDate } from '../functions/syncHelpers';
import { ConsultationMapper } from '../mappers/consultationMapper';
import { ConsultationRepository } from '../Repositories/ConsultationRepository';
import { PatientRepository } from '../Repositories/PatientRepository';
import { ConsultationSyncError, PatientDeletedSyncError, PatientSyncDataResponseOfGetAllMedicalDataServer, PatientUpdatedSyncError, SyncOnlyOnTraitementReturnType, SyncPatientReturnType, SyncPatientsAndConsultationsReturnType } from '../types';
import Logger from '../utils/Logger';
import { sleep } from '../utils/sleep';
import { sendTraficAuditEvent } from '../utils/traficAudit';
import { SYNCHRO_DELETE_LOCAL_PATIENTS, SYNCHRO_DELETE_LOCAL_PATIENTS_FAILDED, SYNCHRO_FULL_FAILDED, SYNCHRO_FULL_SUCCESS, SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS, SYNCHRO_UPLOAD_LOCAL_CONSULTATIONS_FAILDED, SYNCHRO_UPLOAD_LOCAL_PATIENTS, SYNCHRO_UPLOAD_LOCAL_PATIENTS_FAILDED } from './../Constants/syncAudit';
import Service from "./core/Service";
import PatientService from './patientService';

export default class FullSyncService extends Service {
    private patientRepository: PatientRepository;
    private consultationRepository: ConsultationRepository;
    private timer1 = useConfigStore.getState().timer1
    private timer2 = useConfigStore.getState().timer2
    private timer3 = useConfigStore.getState().timer3


    constructor() {
        super();
        this.patientRepository = new PatientRepository();
        this.consultationRepository = new ConsultationRepository();
    }


    async fullSyncPatients(): Promise<SyncPatientReturnType> {
        try {
            const errors: string[] = [];

            // Synchroniser les patients supprimés
            const syncDeletedPatientsResult = await this.syncDeletedPatients();
            console.log("FULLSYNCHRO - Patients supprimés synchronisés in local db:", syncDeletedPatientsResult.success);
            Logger.info("FULLSYNCHRO - Patients supprimés synchronisés in local db:", { success: syncDeletedPatientsResult.success });
            if (!syncDeletedPatientsResult.success) {
                Logger.error("FULLSYNCHRO - Erreur lors de la synchronisation des patients supprimés");
                console.error("FULLSYNCHRO - Erreur lors de la synchronisation des patients supprimés");
                if (syncDeletedPatientsResult.errors) {
                    errors.push(...syncDeletedPatientsResult.errors);
                }
            }

            // Envoyer les patients créés ou mis à jour au serveur
            const sendCreatedOrUpdatedPatientsResult = await this.sendCreatedOrUpdatedPatientsToServer();
            console.log("FULLSYNCHRO - Patients mis à jour synchronisés in local db:", sendCreatedOrUpdatedPatientsResult.success);
            Logger.info("FULLSYNCHRO - Patients mis à jour synchronisés in local db:", { success: sendCreatedOrUpdatedPatientsResult.success });
            if (!sendCreatedOrUpdatedPatientsResult.success) {
                Logger.error("FULLSYNCHRO - Erreur lors de la synchronisation des patients mis à jour");
                console.error("FULLSYNCHRO - Erreur lors de la synchronisation des patients mis à jour");
                if (sendCreatedOrUpdatedPatientsResult.errors) {
                    errors.push(...sendCreatedOrUpdatedPatientsResult.errors);
                }
            }

            // Envoyer les consultations créées au serveur
            const sendCreatedConsultationsResult = await this.sendCreatedConsultationsToServer();
            console.log("FULLSYNCHRO - Consultations créées synchronisées in local db:", sendCreatedConsultationsResult.success);
            Logger.info("FULLSYNCHRO - Consultations créées synchronisées in local db:", { success: sendCreatedConsultationsResult.success });
            if (!sendCreatedConsultationsResult.success) {
                Logger.error("FULLSYNCHRO - Erreur lors de la synchronisation des consultations créées");
                console.error("FULLSYNCHRO - Erreur lors de la synchronisation des consultations créées");
                if (sendCreatedConsultationsResult.errors) {
                    errors.push(...sendCreatedConsultationsResult.errors);
                }
            }
            await sleep(1000 * this.timer1)

            // Récupérer tous les patients du serveur
            const getAllPatientResult = await this.getAllPatientOnServer();
            console.log("FULLSYNCHRO - Patients synchronisés get Medical Data:", getAllPatientResult.success);
            Logger.info("FULLSYNCHRO - Patients synchronisés get Medical Data:", { success: getAllPatientResult.success });
            if (!getAllPatientResult.success) {
                Logger.error("FULLSYNCHRO - Erreur lors de la synchronisation des patients");
                console.error("FULLSYNCHRO - Erreur lors de la synchronisation des patients");
                if (getAllPatientResult.errors) {
                    errors.push(...getAllPatientResult.errors);
                }
            }

            await sleep(1000 * this.timer2)

            // Récupérer tous les patients supprimés du serveur
            const getAllDeletedPatientResult = await this.getAllDeletedPatientOnServer();
            console.log("FULLSYNCHRO - Patients supprimés synchronisés on the server:", getAllDeletedPatientResult.success);
            Logger.info("FULLSYNCHRO - Patients supprimés synchronisés on the server:", { success: getAllDeletedPatientResult.success });
            if (!getAllDeletedPatientResult.success) {
                Logger.error("FULLSYNCHRO - Erreur lors de la synchronisation des patients supprimés");
                console.error("FULLSYNCHRO - Erreur lors de la synchronisation des patients supprimés");
                if (getAllDeletedPatientResult.errors) {
                    errors.push(...getAllDeletedPatientResult.errors);
                }
            }

            await sleep(1000 * this.timer3)

            // Synchroniser les images si activé
            let syncPicturesResult: SyncOnlyOnTraitementReturnType = {
                success: true,
                message: "Synchronisation des images ignorée (désactivée)",
                statistics: { total: 0, success: 0, failed: 0 }
            };

            if (config.isPictureSyncEnabled) {
                /* syncPicturesResult = await this.syncPictures(); */
                console.log("FULLSYNCHRO - Images synchronisées on the server:", syncPicturesResult.success);
                Logger.info("FULLSYNCHRO - Images synchronisées on the server:", { success: syncPicturesResult.success });
                if (!syncPicturesResult.success) {
                    Logger.error("FULLSYNCHRO - Erreur lors de la synchronisation des images");
                    console.error("FULLSYNCHRO - Erreur lors de la synchronisation des images");
                    if (syncPicturesResult.errors) {
                        errors.push(...syncPicturesResult.errors);
                    }
                }
            }


            await setLastSyncDate(new Date().toISOString());

            Logger.info("FULLSYNCHRO - Patients synchronisés");
            console.log("FULLSYNCHRO - Patients synchronisés");

            // Créer l'objet de retour avec toutes les statistiques
            const result: SyncPatientReturnType = {
                success: errors.length === 0,
                message: "Synchronisation effectuée avec succès",
                errors: errors.length > 0 ? errors : undefined,
                statistics: {
                    syncDeletedPatients: syncDeletedPatientsResult.statistics,
                    sendCreatedOrUpdatedPatientsToServer: sendCreatedOrUpdatedPatientsResult.statistics,
                    sendCreatedConsultationsToServer: sendCreatedConsultationsResult.statistics,
                    getAllPatientOnServer: getAllPatientResult.statistics,
                    getAllDeletedPatientOnServer: getAllDeletedPatientResult.statistics,
                    getAllConsultationsOnServer: getAllPatientResult.consultationsStatistics,
                    syncPictures: syncPicturesResult.statistics
                }
            };

            if (errors.length === 0) {
                await sendTraficAuditEvent(SYNCHRO_FULL_SUCCESS, `FULLSYNCHRO - Synchronisation des patients effectuée avec succès ==> ${JSON.stringify(result)}`);
            } else {
                await sendTraficAuditEvent(SYNCHRO_FULL_FAILDED, `FULLSYNCHRO - Synchronisation des patients echouée ==> ${JSON.stringify({
                    success: false,
                    message: "Erreur lors de la synchronisation des patients",
                    errors: errors,
                    statistics: result.statistics
                })}`);
            }


            return result;
        } catch (error) {
            console.error("FULLSYNCHRO - Erreur lors de la synchronisation des patients :", error);
            Logger.error("FULLSYNCHRO - Erreur lors de la synchronisation des patients", { error });

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
                    getAllConsultationsOnServer: { total: 0, success: 0, failed: 0 },
                    syncPictures: { total: 0, success: 0, failed: 0 }
                }
            };
        }
    }


    async syncDeletedPatients(): Promise<SyncOnlyOnTraitementReturnType> {
        try {
            const deletedPatients = await this.patientRepository.getDeletedPatientsOnLocalDB();
            const totalDeletedPatients = deletedPatients.length;
            let deletedPatientsSynced = 0;
      
            const errors: PatientDeletedSyncError[] = [];
            const errorMessages: string[] = [];
      
            const requests = deletedPatients.map(async (patient) => {
              const url = `${this.getBaseUrl()}/api/json/mobile/patients?token=${this.getToken()}&app_version=${APP_VERSION}&patientID=${patient.id_patient}&user_last_sync_date=${null}`;
      
              try {
                if (!patient.id) {
                  throw new Error(` Patient avec l'ID ${patient.id_patient} non trouvé`);
                }
                const response = await axios.post(url);
                if (response.status !== 200 && response.status !== 201 && response.status !== 401) {
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
          const lastSyncDate = null;
          const patients = await this.patientRepository.getAllPatientsUpdatedAtIsGreaterThanLastSyncDateOnLocalDB(lastSyncDate);
          const errors: PatientUpdatedSyncError[] = [];
          const errorMessages: string[] = [];
          const totalPatients = patients.length;
    
          const requests = patients.map(async (patient) => {
            const url = `${this.getBaseUrl()}/api/json/mobile/patients/synchro?token=${this.getToken()}&app_version=${APP_VERSION}&user_last_sync_date=${lastSyncDate}`;
            try {
              if (!patient.identifier) {
                throw new Error(` Patient avec l'ID ${patient.identifier} non trouvé`);
              }
              const response = await axios.post(url, patient);
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
          const lastSyncDate = null;
          const consultations = await this.consultationRepository.getConsultationsGroupedByPatientOnLocalDB(lastSyncDate);
          const errors: ConsultationSyncError[] = [];
          const errorMessages: string[] = [];
          const totalConsultations = Object.values(consultations).flat().length;
          const requests = Object.entries(consultations).map(async ([patientId, consultations]) => {
            const url = `${this.getBaseUrl()}/api/v2/json/mobile/patients/medicaldata/synchro/submissions/batch?token=${this.getToken()}&app_version=${APP_VERSION}&user_last_sync_date=${lastSyncDate}&patientID=${patientId}&lat&lon`;
            try {
              const consultationsSyncData = consultations.map((consultation) => ConsultationMapper.toConsultationCreatedSyncData(consultation));
              const response = await axios.post(url, { identifier: patientId, dataConsultations: consultationsSyncData });
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
    


      
  private async getAllPatientOnServer(): Promise<SyncPatientsAndConsultationsReturnType> {
    try {
      const lastSyncDate = null;
      const url = `${this.getBaseUrl()}/api/v3/json/mobile/patients/medicaldata/all?token=${this.getToken()}&app_version=${APP_VERSION}&user_last_sync_date=${lastSyncDate}`;
      const response = await axios.get(url);

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const patients = response.data as PatientSyncDataResponseOfGetAllMedicalDataServer[];
      await this.patientRepository.createOrUpdateAll(patients);
      const totalPatients = patients.length;
      const totalConsultations = patients.reduce((sum, p) => sum + (p.dataConsultations?.length || 0), 0);

      sendTraficAuditEvent(SYNCHRO_UPLOAD_LOCAL_PATIENTS, SYNCHRO_UPLOAD_LOCAL_PATIENTS);

      // Lancer la création des fichiers JSON en tâche de fond
      const patientService = await PatientService.create();
      patientService.saveAllPatientsAndConsultationsAsJson(patients);

      return {
        success: true,
        message: "Récupération des patients du serveur réussie",
        statistics: {
          total: totalPatients,
          success: totalPatients,
          failed: 0
        },
        consultationsStatistics: {
          total: totalConsultations,
          success: totalConsultations,
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
        },
        consultationsStatistics: {
          total: 0,
          success: 0,
          failed: 0
        }
      };
    }
  }

      


  private async getAllDeletedPatientOnServer(): Promise<SyncOnlyOnTraitementReturnType> {
    try {
      const lastSyncDate = null;
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
      const folderInfo = await FileSystem.getInfoAsync(folderUri);
      if (folderInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(folderUri);
        const filesToDelete = files.filter(file => patientIds.includes(file));
        await Promise.all(filesToDelete.map(file => FileSystem.deleteAsync(`${folderUri}${file}`)));
      } else {
        console.warn("Le dossier n'existe pas :", folderUri);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des fichiers :', error);
      Logger.error('Erreur lors de la suppression des fichiers :', { error });
    }
  };



}



