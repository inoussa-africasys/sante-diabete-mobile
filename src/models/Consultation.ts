import { PatientRepository } from '../Repositories/PatientRepository';
import { FicheRepository } from './../Repositories/FicheRepository';
import { checkIfConsultationIsAFicheAdministrative } from './../utils/ficheAdmin';
import { BaseModel } from "./BaseModel";
import Fiche from "./Fiche";
import Patient from './Patient';

export class Consultation extends BaseModel {
    fileName: string;
    uuid: string;
    data: string;
    synced: boolean;
    type_diabete: string;
    id_patient: string;
    id_fiche: string;
    ficheName: string;
    longitude: number;
    latitude: number;
    createdBy: string;
    deletedAt?: string;
    isLocalCreated?: boolean;
    date?: string;

    constructor(data?: Partial<Consultation>) {
        super();
        this.id = data?.id 
        this.fileName = data?.fileName || '';
        this.uuid = data?.uuid || '';
        this.data = data?.data || '';
        this.synced = data?.synced || false;
        this.type_diabete = data?.type_diabete || '';
        this.id_patient = data?.id_patient || '';
        this.id_fiche = data?.id_fiche || '';
        this.ficheName = data?.ficheName || '';
        this.longitude = data?.longitude || 0;
        this.latitude = data?.latitude || 0;
        this.createdBy = data?.createdBy || '';
        this.createdAt = data?.createdAt || ''
        this.updatedAt = data?.updatedAt || ''
        this.deletedAt = data?.deletedAt || undefined;
        this.isLocalCreated = data?.isLocalCreated || true;
        this.date = data?.date || undefined;
    }

    public getFiche() : Fiche{
        const ficheRepository = new FicheRepository();
        const fiche = ficheRepository.findById(parseInt(this.id_fiche));    
        if (!fiche) {
            throw new Error(`Fiche avec l'ID ${this.id_fiche} non trouvé`);
        }
        return fiche;
    }

    public parseDataToJson() {
        console.log("donne data a afficher dans le json",this.data);
        return JSON.parse(this.data);
    }

    public async isFicheAdministrative(): Promise<boolean> {
        return await checkIfConsultationIsAFicheAdministrative(this);
    }

    public getPatient() : Patient{
        const patientRepository = new PatientRepository();
        const patient = patientRepository.findById(parseInt(this.id_patient));    
        if (!patient) {
            throw new Error(`Patient avec l'ID ${this.id_patient} non trouvé`);
        }
        return patient;
    }
}