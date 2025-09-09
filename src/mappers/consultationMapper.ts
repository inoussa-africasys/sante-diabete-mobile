import { Consultation } from "../models/Consultation";
import { FicheRepository } from "../Repositories/FicheRepository";
import { ConsultationCreatedSyncData, ConsultationFormData, DataConsultationOfGetWithPatientGetAllServer } from "../types";
import { generateConsultationFileName, traficConstultationDateFormat } from "../utils/consultation";

type AddMetaDataParams = {data: any,startDate: Date,endDate: Date,lon: string,uuid: string,instanceID: string,formName: string,traficIdentifiant: string,traficUtilisateur: string,form_name: string,lat: string,id_patient: string}
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

    static addMetaData({data,startDate,endDate,lon,uuid,instanceID,formName,traficIdentifiant,traficUtilisateur,form_name,lat,id_patient}:AddMetaDataParams) {
        data.start = startDate || new Date();
        data.end = endDate || new Date();
        data.date_consultation = traficConstultationDateFormat(endDate || new Date());
        data.lon = lon || "";
        data.uuid = uuid || "";
        data.instanceID = instanceID || "";
        data.formName = formName || "";
        data.traficIdentifiant = traficIdentifiant || "";
        data.traficUtilisateur = traficUtilisateur || "";
        data.form_name = form_name || "";
        data.lat = lat || "";
        data.id_patient = id_patient || "";
        return data;
    }
}
