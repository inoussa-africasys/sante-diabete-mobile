import { Consultation } from "../models/Consultation";
import { ConsultationRepository } from "../Repositories/ConsultationRepository";
import Service from "./core/Service";

export default class ConsultationService extends Service {

    private consultationRepository: ConsultationRepository;
    
    constructor() {
        super();
        this.consultationRepository = new ConsultationRepository();
    }
    
    getAllConsultationByPatientIdOnLocalDB(patientId: string): Record<string, Consultation[]> {
        return this.consultationRepository.getAllConsultationOnLocalDBGroupedByDate(patientId,this.getTypeDiabete());
    }
}
