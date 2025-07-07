import Logger from "../utils/Logger";
import { FicheRepository } from './../Repositories/FicheRepository';
import { BaseModel } from "./BaseModel";
import Fiche from "./Fiche";

export class FormFill extends BaseModel {
    fileName: string;
    uuid: string;
    data: string;
    synced: boolean;
    type_diabete: string;
    ficheName: string;
    longitude: number;
    latitude: number;
    createdBy: string;
    deletedAt?: string;
    id_trafic?: string;

    constructor(data?: Partial<FormFill>) {
        super();
        this.id = data?.id 
        this.fileName = data?.fileName || '';
        this.uuid = data?.uuid || '';
        this.data = data?.data || '';
        this.synced = data?.synced || false;
        this.type_diabete = data?.type_diabete || '';
        this.ficheName = data?.ficheName || '';
        this.longitude = data?.longitude || 0;
        this.latitude = data?.latitude || 0;
        this.createdBy = data?.createdBy || '';
        this.createdAt = data?.createdAt || ''
        this.updatedAt = data?.updatedAt || ''
        this.deletedAt = data?.deletedAt || undefined;
        this.id_trafic = data?.id_trafic || undefined;
    }

    public getFiche() : Fiche | null{
        try {
            const ficheRepository = new FicheRepository();
            const fiche = ficheRepository.findByName(this.ficheName);    
            if (!fiche) {
                return null;
            }
            return fiche;
        } catch (error) {
            console.error('Erreur lors de la récupération de la fiche :', error);
            Logger.log('error', 'Error getting fiche', { error });
            return null;
        }
    }

    
}