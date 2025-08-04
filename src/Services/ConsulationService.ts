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
      consultationToCreate.uuid = generateUUID();
      consultationToCreate.createdBy = this.getConnectedUsername();
      consultationToCreate.createdAt = new Date().toISOString();
      consultationToCreate.updatedAt = new Date().toISOString();
      consultationToCreate.date = new Date().toISOString();
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
        fileName = `${generateFicheAdministrativeNameForJsonSave(new Date(),consultation.ficheName)}`;
      } else {
        fileName = `${generateConsultationName(new Date())}`;
      }

      const folderUri = `${FileSystem.documentDirectory}${TraficFolder.getConsultationsFolderPath(this.getTypeDiabete(),consultation.id_patient)}/`;
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
      
      // Récupérer l'ID du patient depuis la consultation
      const patientId = consultationToDelete.id_patient;
      
      // D'abord supprimer le fichier
      try {
        await this.deleteConsultationFile(consultationToDelete.fileName, patientId);
      } catch (fileError: any) {
        console.error('Erreur lors de la suppression du fichier de consultation:', fileError);
        Logger.log('error', 'Error deleting consultation file', { error: fileError });
        throw new Error(`Erreur lors de la suppression du fichier: ${fileError?.message || 'Erreur inconnue'}`);
      }
      
      // Ensuite supprimer de la base de données
      await this.consultationRepository.delete(consultationId);
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
      
      // Vérifier si le fileName est valide
      if (!consultationToCreate.fileName || consultationToCreate.fileName.trim() === '') {
        // Générer un nouveau nom de fichier si nécessaire
        if (await consultationToCreate.isFicheAdministrative()) {
          consultationToCreate.fileName = `${generateFicheAdministrativeNameForJsonSave(new Date(), consultationToCreate.ficheName)}`;
          const patientService = await PatientService.create();
          const patientData :FicheAdministrativeFormData = JSON.parse(consultationToCreate.data);
          console.log("patientData fiche admin",patientData);
          const patientData2 = PatientMapper.ficheAdminToFormPatient(patientData,consultationToCreate.ficheName);
          console.log("patientData2 fiche admin",patientData2);
          await patientService.updateOnTheLocalDb(consultationToCreate.id_patient, patientData2);
          
        } else {
          consultationToCreate.fileName = `${generateConsultationName(new Date())}`;
        }
      }
      
      // Mettre à jour les données de la consultation
      consultationToCreate.data = consultation.data;
      consultationToCreate.updatedAt = new Date().toISOString();
      consultationToCreate.synced = false;

      // D'abord mettre à jour la base de données pour s'assurer que le fileName est enregistré
      await this.consultationRepository.update(consultationId, consultationToCreate);
      
      // Ensuite mettre à jour le fichier JSON
      try {
        // Vérifier que le fileName n'est pas l'ID du patient
        if (consultationToCreate.fileName === consultationToCreate.id_patient) {
          throw new Error(`Le nom du fichier ne peut pas être l'ID du patient: ${consultationToCreate.fileName}`);
        }
        
        console.log(`Mise à jour du fichier: ${consultationToCreate.fileName}`);
        await this.updateConsultationFile(consultationToCreate.fileName, consultationToCreate.data);
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



  async updateConsultationFile(fileName: string, updatedData: any) {
    try {
      // Récupérer la consultation depuis updatedData pour obtenir l'ID du patient
      const consultationData = updatedData;
      const patientId = consultationData.id_patient;
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
        
        await FileSystem.writeAsStringAsync(newFileUri, JSON.stringify(updatedData, null, 2));
        console.log("✅ Fichier consultation mis à jour avec un nouveau nom :", newFileUri);
        
        // Mettre à jour le fileName dans la consultation
        if (consultationData.id) {
          const updatedConsultation = { ...consultationData, fileName: uniqueFileName };
          await this.consultationRepository.update(consultationData.id, updatedConsultation);
          console.log(`✅ Nom du fichier mis à jour dans la base de données: ${uniqueFileName}`);
        }
        
        return;
      }
      
      // Vérifier que le dossier parent existe
      const folderInfo = await FileSystem.getInfoAsync(folderUri);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
      }
      
      // Écrire le fichier
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(updatedData, null, 2));
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
