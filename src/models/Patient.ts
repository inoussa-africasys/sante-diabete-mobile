import ConsultationService from "../Services/ConsulationService";
import { PatientToSaveOnJson } from "../types";
import { checkIfConsultationIsAFicheAdministrative, getFicheAdministrativeName } from "../utils/ficheAdmin";
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
    fiche_administrative_name?: string;
    
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
        this.fiche_administrative_name = data?.fiche_administrative_name || undefined;
    }

    public async ficheAdministrative(): Promise<Consultation> {
        if (!this.fiche_administrative_name) {
            const newFakeConsultation = await this.transformePatientToDonneAdmin();
            return newFakeConsultation;
        }
        const consultation = await this.donneesAdministratives();
        if (!consultation) {
            throw new Error('Fiche administrative ID : ' + this.fiche_administrative_name + ' not found for patient ' + this.id);
        }
        return consultation;
    }


    public async donneesAdministratives(): Promise<Consultation | null> {
        const consultationService = await ConsultationService.create();
        const consultationList = await consultationService.getConsultationsByPatientId(this.id_patient);
        const ficheAdministrative = consultationList.find((consultation) => checkIfConsultationIsAFicheAdministrative(consultation));
        if (!ficheAdministrative || !ficheAdministrative.id) {
            return null;
        }

        return ficheAdministrative;
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

    public async getAllConsultations(): Promise<Consultation[]> {
        const consultationService = await ConsultationService.create();
        const consultations = await consultationService.getConsultationsByPatientId(this.id_patient);
        return await consultations;
    }


    public async transformePatientToDonneAdmin(): Promise<Consultation> {
        const consultation = new Consultation();
        consultation.id = this.id;
        consultation.id_patient = this.id_patient;
        consultation.ficheName = await getFicheAdministrativeName();
        consultation.type_diabete = this.type_diabete;
        consultation.createdBy = this.createdBy;
        consultation.createdAt = this.createdAt;
        consultation.updatedAt = this.updatedAt;
        consultation.deletedAt = this.deletedAt;
        consultation.isLocalCreated = this.isLocalCreated;
        consultation.date = this.date;
        return consultation;
    }
}