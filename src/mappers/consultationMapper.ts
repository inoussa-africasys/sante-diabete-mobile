import { Consultation } from "../models/Consultation";
import { FicheRepository } from "../Repositories/FicheRepository";
import { ConsultationCreatedSyncData, ConsultationFormData, DataConsultationOfGetWithPatientGetAllServer } from "../types";
import { generateConsultationFileName } from "../utils/consultation";

export class ConsultationMapper {
    static toConsultationFormData(consultation: Consultation): ConsultationFormData {
        return {
            data: consultation.data,
            id_fiche: consultation.id_fiche,
        };
    }

    static toConsultation(consultationFormData: ConsultationFormData): Consultation {
        const consultation = new Consultation();
        consultation.data = JSON.stringify(consultationFormData.data);
        consultation.id_fiche = consultationFormData.id_fiche;
        const ficheRepository = new FicheRepository();
        const fiche = ficheRepository.findById(parseInt(consultationFormData.id_fiche));
        consultation.ficheName = fiche?.name as string || '' ;
        return consultation;
    }

    static toConsultationCreatedSyncData(consultation: Consultation): ConsultationCreatedSyncData {
        return {
            form_name: consultation.ficheName,
            consultation_name: generateConsultationFileName(consultation.fileName),
            uuid: consultation.uuid,
            content: consultation.data,
            date_consultation: consultation.date
        };
    }

    static DataConsultationOfGetWithPatientGetAllMedicalDataToConsultation(dataConsultationOfGetWithPatientGetAllServer: DataConsultationOfGetWithPatientGetAllServer, id_patient: string, type_diabete: string): Consultation {
        const consultation = new Consultation();
        const ficheRepository = new FicheRepository();
        const fiche = ficheRepository.findByName(dataConsultationOfGetWithPatientGetAllServer.form_name);
        const fileId = fiche?.id?.toString() || '';
        consultation.data = dataConsultationOfGetWithPatientGetAllServer.content;
        consultation.id_fiche = fileId;
        consultation.uuid = dataConsultationOfGetWithPatientGetAllServer.uuid;
        consultation.synced = true;
        consultation.isLocalCreated = false;
        consultation.createdAt = new Date().toISOString();
        consultation.updatedAt = new Date().toISOString();
        consultation.deletedAt = undefined;
        consultation.longitude = 0;
        consultation.latitude = 0;
        consultation.id_patient = id_patient;
        consultation.type_diabete = type_diabete;
        consultation.createdAt = new Date().toISOString();
        consultation.updatedAt = new Date().toISOString();
        consultation.ficheName = dataConsultationOfGetWithPatientGetAllServer.form_name;
        consultation.date = dataConsultationOfGetWithPatientGetAllServer.date_consultation;
        return consultation;
    }
}
