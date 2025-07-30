import ConsultationService from "../Services/ConsulationService";
import { PatientToSaveOnJson } from "../types";
import { BaseModel } from "./BaseModel";
import { Consultation } from "./Consultation";

export default class Patient extends BaseModel {

    id_patient: string;
    date_of_birth: string;
    photo?: string;
    last_name: string;
    first_name: string;
    trafic_user: string;
    status: string;
    synced: boolean;
    type_diabete: string;
    genre: string;
    profession: string;
    phone: string;
    email: string;
    comment: string;
    createdBy: string;
    latitude?: number;
    longitude?: number;
    deletedAt?: string;
    isLocalCreated?: boolean;
    isModified?: boolean;
    date?: string;
    fiche_administrative_id?: string;
    
    constructor(data?: Partial<Patient>) {
        super();
        this.id = data?.id ;
        this.id_patient = data?.id_patient || '';
        this.first_name = data?.first_name || '';
        this.last_name = data?.last_name || '';
        this.date_of_birth = data?.date_of_birth || '';
        this.photo = data?.photo || '';
        this.trafic_user = data?.trafic_user || '';
        this.status = data?.status || '';
        this.synced = data?.synced || false;
        this.type_diabete = data?.type_diabete || '';
        this.createdAt = data?.createdAt;
        this.updatedAt = data?.updatedAt;
        this.genre = data?.genre || '';
        this.profession = data?.profession || '';
        this.phone = data?.phone || '';
        this.email = data?.email || '';
        this.comment = data?.comment || '';
        this.createdBy = data?.createdBy || '';
        this.latitude = data?.latitude || undefined;
        this.longitude = data?.longitude || undefined;
        this.deletedAt = data?.deletedAt || undefined;
        this.isLocalCreated = data?.isLocalCreated || true;
        this.isModified = data?.isModified || false;
        this.date = data?.date || undefined;
        this.fiche_administrative_id = data?.fiche_administrative_id || undefined;
    }

    public async ficheAdministrative(): Promise<Consultation> {
        const consultationService = await ConsultationService.create();
        if (!this.fiche_administrative_id) {
            throw new Error('Fiche administrative ID is missing for patient ' + this.id);
        }
        const consultation = await consultationService.getConsultationByIdOnLocalDB(parseInt(this.fiche_administrative_id));
        if (!consultation) {
            throw new Error('Fiche administrative ID : ' + this.fiche_administrative_id + ' not found for patient ' + this.id);
        }
        return consultation;
    }


    public toJson(): PatientToSaveOnJson {
        return {
            identifier: this.id_patient,
            firstName: this.first_name,
            lastName: this.last_name,
            dateBirthday: this.date_of_birth,
            gender: this.genre,
            bloodGroup: "",
            electrophoresis: "",
            job: this.profession,
            contact:  this.phone,
            email: this.email,
            comments: this.comment,
            emergencyPeople: "",
            emergencyContact: "",
            isModified: this.isModified ? 'true' : 'false',
            end_date: this.createdAt || '',
            traficUser: this.trafic_user
        };
    }
}