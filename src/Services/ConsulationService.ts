import * as FileSystem from 'expo-file-system';
import { PATH_OF_CONSULTATIONS_DIR_ON_THE_LOCAL } from '../Constants/App';
import { ConsultationMapper } from "../mappers/consultationMapper";
import { Consultation } from "../models/Consultation";
import Patient from '../models/Patient';
import { ConsultationRepository } from "../Repositories/ConsultationRepository";
import { PatientRepository } from '../Repositories/PatientRepository';
import { ConsultationFormData, Coordinates } from "../types";
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
      await this.consultationRepository.update(consultationCreated.id,consultationCreated);
      return consultationCreated;
    } catch (error) {
      console.error('Erreur de creation de la consultation locale :', error);
      throw error;
    }
  }



  async saveConsultationAsJson(consultation: Consultation): Promise<string> {
    try {
      const jsonContent = JSON.stringify(consultation.toJson(), null, 2);
      const fileName = `${consultation.fileName || consultation.id_patient}_${Date.now()}.json`;

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
      return fileUri;
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

  async deleteConsultationOnTheLocalDb(consultationId: number): Promise<boolean> {
    try {
      await this.consultationRepository.delete(consultationId);
      return true;
    } catch (error) {
      console.error('Erreur de suppression de la consultation :', error);
      return false;
    }
  }






}
