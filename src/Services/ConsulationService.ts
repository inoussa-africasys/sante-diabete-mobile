import * as FileSystem from 'expo-file-system';
import { PATH_OF_CONSULTATIONS_DIR_ON_THE_LOCAL } from '../Constants/App';
import { ConsultationMapper } from "../mappers/consultationMapper";
import { Consultation } from "../models/Consultation";
import Patient from '../models/Patient';
import { ConsultationRepository } from "../Repositories/ConsultationRepository";
import { PatientRepository } from '../Repositories/PatientRepository';
import { Coordinates } from "../types";
import { generateConsultationName, generateUUID } from '../utils/consultation';
import Logger from '../utils/Logger';
import { ConsultationFormData } from './../types/patient';
import Service from "./core/Service";

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
      throw error;
    }
  }



  async saveConsultationAsJson(consultation: Consultation): Promise<string> {
    try {
      const jsonContent = JSON.stringify(consultation.toJson(), null, 2);
      const fileName = `${generateConsultationName()}.json`;

      const folderUri = `${FileSystem.documentDirectory}${PATH_OF_CONSULTATIONS_DIR_ON_THE_LOCAL}/`;
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
      return "";
    }
  }


  async getConsultationByIdOnLocalDB(consultationId: number): Promise<Consultation | null> {
    try {
      const consultationService = this.consultationRepository.findById(consultationId);
      return consultationService;
    } catch (error) {
      console.error('Erreur de recherche de la consultation :', error);
      return null;
    }
  }

  async getPatientByConsultationIdOnLocalDB(consultationId: number): Promise<Patient | null> {
    try {
      const patient = this.patientRepository.getPatientByConsultationIdOnLocalDB(consultationId);
      return patient;
    } catch (error) {
      console.error('Erreur de recherche du patient :', error);
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
      const consultation = await this.consultationRepository.findById(consultationId);
      if (!consultation) {
        throw new Error('La consultation locale n\'a pas pu etre recupere');
      }
      await this.consultationRepository.softDelete(consultationId.toString());
      await this.deleteConsultationFile(consultation.fileName);
      return true;
    } catch (error) {
      console.error('Erreur de suppression de la consultation :', error);
      Logger.log('error', 'Error deleting consultation on the local db', { error });
      return false;
    }
  }

  async updateConsultationByIdOnLocalDB(consultationId: number, consultation: ConsultationFormData): Promise<boolean> {
    try {
      const consultationToCreate = await this.consultationRepository.findById(consultationId);
      if (!consultationToCreate) {
        throw new Error('La consultation locale n\'a pas pu etre recupere');
      }
      consultationToCreate.data = consultation.data;
      consultationToCreate.updatedAt = new Date().toISOString();
      consultationToCreate.synced = false;

      await this.consultationRepository.update(consultationId, consultationToCreate);
      await this.updateConsultationFile(consultationToCreate.fileName, consultationToCreate.toJson());
      return true;
    } catch (error) {
      console.error('Erreur de mise à jour de la consultation :', error);
      Logger.log('error', 'Error updating consultation on the local db', { error });
      return false;
    }
  }



  async updateConsultationFile(fileName: string, updatedData: any) {
    const folderUri = `${FileSystem.documentDirectory}${PATH_OF_CONSULTATIONS_DIR_ON_THE_LOCAL}/`;
    const fileUri = `${folderUri}${fileName}`;

    try {
      const folderInfo = await FileSystem.getInfoAsync(folderUri);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
      }
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(updatedData, null, 2));
      console.log("✅ Fichier consultation mis à jour :", fileUri);
    } catch (err) {
      console.error("❌ Erreur mise à jour consultation file :", err);
    }
  }


  async deleteConsultationFile(fileName: string): Promise<void> {
    const folderUri = `${FileSystem.documentDirectory}${PATH_OF_CONSULTATIONS_DIR_ON_THE_LOCAL}/`;
    const fileUri = `${folderUri}${fileName}`;

    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
        console.log("🗑️ Fichier supprimé avec succès :", fileUri);
      } else {
        console.warn("⚠️ Le fichier n'existe pas :", fileUri);
      }
    } catch (err) {
      console.error("❌ Erreur lors de la suppression du fichier :", err);
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
      throw error;
    }
  }


}
