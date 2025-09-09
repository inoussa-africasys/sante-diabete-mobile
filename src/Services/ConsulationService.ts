import * as FileSystem from 'expo-file-system';
import { ConsultationMapper } from "../mappers/consultationMapper";
import { Consultation } from "../models/Consultation";
import Patient from '../models/Patient';
import { ConsultationRepository } from "../Repositories/ConsultationRepository";
import { PatientRepository } from '../Repositories/PatientRepository';
import { Coordinates } from "../types";
import { generateConsultationName, generateFicheAdministrativeNameForJsonSave, generateUUID } from '../utils/consultation';
import Logger from '../utils/Logger';
import { TraficFolder } from '../utils/TraficFolder';
import { PatientMapper } from './../mappers/patientMapper';
import { ConsultationFormData, FicheAdministrativeFormData } from './../types/patient';
import Service from "./core/Service";
import PatientService from './patientService';

export default class ConsultationService extends Service {

  private consultationRepository: ConsultationRepository;
  private patientRepository: PatientRepository;

  constructor() {
    super();
    this.consultationRepository = new ConsultationRepository();
    this.patientRepository = new PatientRepository();
  }

  getAllConsultationByPatientIdOnLocalDB(patientId: string): Record<string, Consultation[]> {
    return this.consultationRepository.getAllConsultationOnLocalDBGroupedByDate(patientId, this.getTypeDiabete());
  }

  async createConsultationOnLocalDBAndCreateJson(consultation: ConsultationFormData, patientId: string, coordinates: Coordinates): Promise<Consultation> {
    try {
      const consultationToCreate = ConsultationMapper.toConsultation(consultation);
      consultationToCreate.id_patient = patientId;
      consultationToCreate.type_diabete = this.getTypeDiabete();
      consultationToCreate.synced = false;
      consultationToCreate.longitude = coordinates.longitude;
      consultationToCreate.latitude = coordinates.latitude;
      consultationToCreate.uuid = consultation.data.uuid || generateUUID();
      consultationToCreate.createdBy = this.getConnectedUsername();
      consultationToCreate.createdAt = new Date().toISOString();
      consultationToCreate.updatedAt = new Date().toISOString();
      consultationToCreate.date = new Date().toISOString();
      consultationToCreate.data = JSON.stringify(consultation.data);

      // Garde-fou: empêcher plusieurs fiches administratives pour un même patient
      if (await consultationToCreate.isFicheAdministrative()) {
        const existingConsultations = await this.getConsultationsByPatientId(patientId);
        for (const c of existingConsultations) {
          const isAdmin = await c.isFicheAdministrative();
          if (isAdmin && !c.deletedAt) {
            throw new Error(`Une fiche administrative existe déjà pour ce patient (consultation ID: ${c.id}).`);
          }
        }
      }

      const consultationCreated = this.consultationRepository.insertAndReturn(consultationToCreate);
      if (!consultationCreated) {
        throw new Error('La consultation locale n\'a pas pu etre creer');
      }
      const fileName = await this.saveConsultationAsJson(consultationCreated);
      consultationCreated.fileName = fileName;
      if (!consultationCreated.id) {
        throw new Error('L\'id de la consultation locale n\'a pas pu etre recupere');
      }
      await this.consultationRepository.update(consultationCreated.id, consultationCreated);
      
      // Si c'est une fiche administrative, mettre à jour le patient pour définir cette fiche comme sa fiche administrative
      if (await consultationCreated.isFicheAdministrative()) {
        try {
          // Récupérer le patient
          const patient = await this.patientRepository.findByPatientId(patientId);
          if (patient && (!patient.fiche_administrative_name || patient.fiche_administrative_name.trim() === '')) {
            // Mettre à jour le patient avec le nom de la fiche administrative
            patient.fiche_administrative_name = consultationCreated.ficheName;
            if (patient.id) {
              await this.patientRepository.update(patient.id, patient);
              console.log(`✅ Patient ${patientId} mis à jour avec la fiche administrative ${consultationCreated.ficheName}`);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour du patient avec la fiche administrative :', error);
          Logger.log('error', 'Error updating patient with administrative file', { error });
          // Ne pas bloquer la création de la consultation si la mise à jour du patient échoue
        }
      }
      
      return consultationCreated;
    } catch (error) {
      console.error('Erreur de creation de la consultation locale :', error);
      Logger.log('error', 'Error creating consultation on the local db', { error });
      throw error;
    }
  }



  async saveConsultationAsJson(consultation: Consultation): Promise<string> {
    try {
      const jsonContent = consultation.data;
      let fileName = '';
      if (await consultation.isFicheAdministrative()) {
        fileName = `${generateFicheAdministrativeNameForJsonSave(new Date(), consultation.ficheName)}`;
      } else {
        fileName = `${generateConsultationName(new Date())}`;
      }

      const folderUri = `${FileSystem.documentDirectory}${TraficFolder.getConsultationsFolderPath(this.getTypeDiabete(), consultation.id_patient)}/`;
      const fileUri = `${folderUri}${fileName}`;

      const dirInfo = await FileSystem.getInfoAsync(folderUri);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
      }

      await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });


      console.log(`✅ Consultation enregistrée dans le fichier : ${fileUri}`);
      return fileName;
    } catch (error) {
      console.error("❌ Erreur d'enregistrement de la consultation :", error);
      Logger.log('error', 'Error saving consultation as json', { error });
      return "";
    }
  }


  async getConsultationByIdOnLocalDB(consultationId: number): Promise<Consultation | null> {
    try {
      const consultationService = this.consultationRepository.findById(consultationId);
      return consultationService;
    } catch (error) {
      console.error('Erreur de recherche de la consultation :', error);
      Logger.log('error', 'Error fetching consultation by id on local db', { error });
      return null;
    }
  }

  async getPatientByConsultationIdOnLocalDB(consultationId: number): Promise<Patient | null> {
    try {
      const patient = this.patientRepository.getPatientByConsultationIdOnLocalDB(consultationId);
      return patient;
    } catch (error) {
      console.error('Erreur de recherche du patient :', error);
      Logger.log('error', 'Error fetching patient by consultation id on local db', { error });
      return null;
    }
  }

  async getLocalConsultationsByFicheId(ficheId: string): Promise<Consultation[]> {
    try {
      // Convertir ficheId en chaîne pour assurer la compatibilité
      const ficheIdValue = ficheId.toString();

      // Utiliser la méthode query du repository pour construire une requête personnalisée
      const consultations = this.consultationRepository.query()
        .where('id_fiche = ?', [ficheIdValue])
        .where('isLocalCreated = ?', [1]) // isLocalCreated est stocké comme 1 en SQLite 
        .where('id_patient = ?', [""]) // isLocalCreated est stocké comme 1 en SQLite 
        .where('deletedAt IS NULL')
        .all();

      // Log minimal pour éviter les boucles de rendu
      if (consultations.length > 0) {
        console.log(`Trouvé ${consultations.length} consultation(s) pour la fiche ${ficheIdValue}`);
      }

      return consultations;
    } catch (error) {
      console.error('Erreur lors de la récupération des consultations locales par fiche:', error);
      Logger.log('error', 'Error fetching local consultations by fiche id', { error, ficheId });
      return [];
    }
  }

  async deleteConsultationOnTheLocalDb(consultationId: number): Promise<boolean> {
    try {
      const consultationToDelete = await this.consultationRepository.findById(consultationId);
      if (!consultationToDelete) {
        throw new Error('La consultation locale n\'a pas pu être récupérée');
      }

      // Règle métier: empêcher la suppression de la fiche administrative seule
      const isAdminFiche = await consultationToDelete.isFicheAdministrative();
      if (isAdminFiche) {
        throw new Error("La fiche administrative ne peut pas être supprimée seule. Supprimez le patient pour supprimer aussi la fiche administrative.");
      }

      const patientId = consultationToDelete.id_patient;
      await this.consultationRepository.delete(consultationId);

      try {
        await this.deleteConsultationFile(consultationToDelete.fileName, patientId);
      } catch (fileError: any) {
        console.error('Erreur lors de la suppression du fichier de consultation:', fileError);
        Logger.log('error', 'Error deleting consultation file', { error: fileError });
        throw new Error(`Erreur lors de la suppression du fichier: ${fileError?.message || 'Erreur inconnue'}`);
      }
      return true;
    } catch (error) {
      console.error('Erreur réseau :', error);
      Logger.log('error', 'Error deleting consultation on the local db', { error });
      return false;
    }
  }

  async updateConsultationByIdOnLocalDB(consultationId: number, consultation: ConsultationFormData): Promise<boolean> {
    try {
      const consultationToCreate = await this.consultationRepository.findById(consultationId);
      if (!consultationToCreate) {
        throw new Error('La consultation n\'a pas pu être récupérée de la base de données locale');
      }

      consultationToCreate.data = consultation.data;
      consultationToCreate.updatedAt = new Date().toISOString();
      consultationToCreate.synced = false;
      
      await this.consultationRepository.update(consultationId, consultationToCreate);

      if (await consultationToCreate.isFicheAdministrative()) {
        console.log("start update Patient");
        const patientService = await PatientService.create();
        console.log("consultationToCreate", consultationToCreate.data);
        const patientData: FicheAdministrativeFormData = consultationToCreate.data as unknown as FicheAdministrativeFormData;
        const patientData2 = PatientMapper.ficheAdminToFormPatient(patientData, consultationToCreate.ficheName);
        
        // S'assurer que cette fiche administrative est définie comme la fiche principale du patient
        patientData2.fiche_administrative_name = consultationToCreate.ficheName;
        
        console.log("end update Patient");
        await patientService.updateOnTheLocalDb(consultationToCreate.id_patient, patientData2);
        
        // Vérifier également si le patient a besoin d'être mis à jour directement dans la base de données
        try {
          const patient = await this.patientRepository.findByPatientId(consultationToCreate.id_patient);
          if (patient && (!patient.fiche_administrative_name || patient.fiche_administrative_name.trim() === '' || 
              patient.fiche_administrative_name !== consultationToCreate.ficheName)) {
            // Mettre à jour le patient avec le nom de la fiche administrative
            patient.fiche_administrative_name = consultationToCreate.ficheName;
            if (patient.id) {
              await this.patientRepository.update(patient.id, patient);
              console.log(`✅ Patient ${consultationToCreate.id_patient} mis à jour avec la fiche administrative ${consultationToCreate.ficheName}`);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour du patient avec la fiche administrative :', error);
          Logger.log('error', 'Error updating patient with administrative file', { error });
          // Ne pas bloquer la mise à jour de la consultation si la mise à jour du patient échoue
        }
      }

      // Ensuite mettre à jour le fichier JSON
      try {
        // Si aucun nom de fichier, en générer un (cas anciens enregistrements)
        let fileNameToUse = consultationToCreate.fileName?.trim() || '';
        if (!fileNameToUse || fileNameToUse === consultationToCreate.id_patient) {
          if (await consultationToCreate.isFicheAdministrative()) {
            fileNameToUse = `${generateFicheAdministrativeNameForJsonSave(new Date(), consultationToCreate.ficheName)}`;
          } else {
            fileNameToUse = `${generateConsultationName(new Date())}`;
          }
          consultationToCreate.fileName = fileNameToUse;
          await this.consultationRepository.update(consultationId, consultationToCreate);
        }

        console.log(`Mise à jour du fichier: ${fileNameToUse}`);
        await this.updateConsultationFile(fileNameToUse, consultationToCreate.data, consultationToCreate.id_patient);
      } catch (fileError: any) {
        console.error('Erreur lors de la mise à jour du fichier de consultation:', fileError);
        Logger.log('error', 'Error updating consultation file', { error: fileError });
        throw new Error(`Erreur lors de la mise à jour du fichier: ${fileError?.message || 'Erreur inconnue'}`);
      }

      return true;
    } catch (error) {
      console.error('Erreur de mise à jour de la consultation :', error);
      Logger.log('error', 'Error updating consultation on the local db', { error });
      return false;
    }
  }



  async updateConsultationFile(fileName: string, updatedData: any, patientId: string) {
    try {
      const typeDiabete = this.getTypeDiabete();

      // Vérifier que fileName n'est pas vide et n'est pas l'ID du patient
      if (!fileName || fileName.trim() === '') {
        throw new Error('Le nom du fichier est vide ou invalide');
      }

      if (fileName === patientId) {
        throw new Error(`Le nom du fichier ne peut pas être l'ID du patient: ${fileName}`);
      }

      // S'assurer que le nom du fichier a une extension
      if (!fileName.includes('.')) {
        fileName = `${fileName}.json`;
        console.log(`Extension .json ajoutée au nom du fichier: ${fileName}`);
      }

      // Utiliser le même chemin que dans saveConsultationAsJson
      const folderUri = `${FileSystem.documentDirectory}${TraficFolder.getConsultationsFolderPath(typeDiabete, patientId)}/`;
      const fileUri = `${folderUri}${fileName}`;

      console.log(`Chemin du fichier à mettre à jour: ${fileUri}`);

      // Vérifier si le chemin est un répertoire
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists && fileInfo.isDirectory) {
        // Si c'est un répertoire, créer un fichier avec un nom unique à l'intérieur
        const uniqueFileName = `${fileName.replace(/\.json$/, '')}_${Date.now()}.json`;
        const newFileUri = `${fileUri}/${uniqueFileName}`;
        console.log(`Le chemin est un répertoire, utilisation du nouveau chemin: ${newFileUri}`);

        const contentStr = typeof updatedData === 'string' ? updatedData : JSON.stringify(updatedData, null, 2);
        await FileSystem.writeAsStringAsync(newFileUri, contentStr);
        console.log("✅ Fichier consultation mis à jour avec un nouveau nom :", newFileUri);

        // Mettre à jour le fileName dans la consultation
        // On ne connaît pas l'ID ici via updatedData; la mise à jour du fileName a déjà été faite en amont si nécessaire.

        return;
      }

      // Vérifier que le dossier parent existe
      const folderInfo = await FileSystem.getInfoAsync(folderUri);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
      }

      // Écrire le fichier
      const contentStr = typeof updatedData === 'string' ? updatedData : JSON.stringify(updatedData, null, 2);
      await FileSystem.writeAsStringAsync(fileUri, contentStr);
      console.log("✅ Fichier consultation mis à jour :", fileUri);
    } catch (err) {
      console.error("❌ Erreur mise à jour consultation file :", err);
      Logger.log('error', 'Error updating consultation file', { error: err });
      throw err; // Propager l'erreur pour une meilleure gestion
    }
  }


  async deleteConsultationFile(fileName: string, patientId: string): Promise<void> {
    try {
      const typeDiabete = this.getTypeDiabete();

      // Utiliser le même chemin que dans saveConsultationAsJson
      const folderUri = `${FileSystem.documentDirectory}${TraficFolder.getConsultationsFolderPath(typeDiabete, patientId)}/`;
      const fileUri = `${folderUri}${fileName}`;

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
        console.log("🗑️ Fichier supprimé avec succès :", fileUri);
      } else {
        console.warn("⚠️ Le fichier n'existe pas :", fileUri);
      }
    } catch (err) {
      console.error("❌ Erreur lors de la suppression du fichier :", err);
      Logger.log('error', 'Error deleting consultation file', { error: err });
      throw err; // Propager l'erreur pour une meilleure gestion
    }
  }

  async createdDataInConsultationTableOnLocalDBAndCreateJson(consultation: ConsultationFormData, coordinates: Coordinates): Promise<Consultation> {
    try {
      const consultationToCreate = ConsultationMapper.toConsultation(consultation);
      consultationToCreate.type_diabete = this.getTypeDiabete();
      consultationToCreate.synced = false;
      consultationToCreate.longitude = coordinates.longitude;
      consultationToCreate.latitude = coordinates.latitude;
      consultationToCreate.uuid = generateUUID();
      consultationToCreate.createdBy = this.getConnectedUsername();
      consultationToCreate.createdAt = new Date().toISOString();
      consultationToCreate.updatedAt = new Date().toISOString();

      // Si c'est une fiche administrative ET qu'un patient est spécifié, empêcher les doublons
      if (await consultationToCreate.isFicheAdministrative()) {
        const pid = consultationToCreate.id_patient;
        if (pid && pid.trim() !== '') {
          const existingConsultations = await this.getConsultationsByPatientId(pid);
          for (const c of existingConsultations) {
            const isAdmin = await c.isFicheAdministrative();
            if (isAdmin && !c.deletedAt) {
              throw new Error(`Une fiche administrative existe déjà pour ce patient (consultation ID: ${c.id}).`);
            }
          }
        }
      }
      const consultationCreated = this.consultationRepository.insertAndReturn(consultationToCreate);
      if (!consultationCreated) {
        throw new Error('La consultation locale n\'a pas pu etre creer');
      }
      const fileName = await this.saveConsultationAsJson(consultationCreated);
      consultationCreated.fileName = fileName;
      if (!consultationCreated.id) {
        throw new Error('L\'id de la consultation locale n\'a pas pu etre recupere');
      }
      await this.consultationRepository.update(consultationCreated.id, consultationCreated);
      
      // Si c'est une fiche administrative, mettre à jour le patient pour définir cette fiche comme sa fiche administrative
      if (await consultationCreated.isFicheAdministrative()) {
        const pid = consultationCreated.id_patient;
        if (pid && pid.trim() !== '') {
          try {
            // Récupérer le patient
            const patient = await this.patientRepository.findByPatientId(pid);
            if (patient && (!patient.fiche_administrative_name || patient.fiche_administrative_name.trim() === '')) {
              // Mettre à jour le patient avec le nom de la fiche administrative
              patient.fiche_administrative_name = consultationCreated.ficheName;
              if (patient.id) {
                await this.patientRepository.update(patient.id, patient);
                console.log(`✅ Patient ${pid} mis à jour avec la fiche administrative ${consultationCreated.ficheName}`);
              }
            }
          } catch (error) {
            console.error('Erreur lors de la mise à jour du patient avec la fiche administrative :', error);
            Logger.log('error', 'Error updating patient with administrative file', { error });
            // Ne pas bloquer la création de la consultation si la mise à jour du patient échoue
          }
        }
      }

      return consultationCreated;
    } catch (error) {
      console.error('Erreur de creation de la consultation locale :', error);
      Logger.log('error', 'Error creating consultation on the local db', { error });
      throw error;
    }
  }


  async getConsultationsByPatientId(patientId: string): Promise<Consultation[]> {
    try {
      const consultations = this.consultationRepository.query()
        .where('id_patient = ?', [patientId])
        .where('deletedAt IS NULL')
        .all();
      return consultations;
    } catch (error) {
      console.error('Erreur de recherche des consultations :', error);
      Logger.log('error', 'Error fetching consultations by patient id on local db', { error });
      return [];
    }
  }


}
