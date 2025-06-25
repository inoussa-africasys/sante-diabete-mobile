import { Consultation } from "../models/Consultation";
import { ConsultationFormData } from "../types";

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
}
