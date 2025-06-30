import { Consultation } from "../models/Consultation";
import { ConsultationCreatedSyncData, ConsultationFormData } from "../types";
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
        consultation.data = consultationFormData.data;
        consultation.id_fiche = consultationFormData.id_fiche;
        return consultation;
    }

    static toConsultationCreatedSyncData(consultation: Consultation): ConsultationCreatedSyncData {
        return {
            form_name: consultation.getFiche().name as string,
            consultation_name: generateConsultationFileName(consultation.fileName),
            uuid: consultation.uuid,
            content: consultation.data
        };
    }
}
