import { BaseModel } from "./BaseModel";

export class Consultation extends BaseModel {
    fileName: string;
    data: string;
    synced: boolean;
    type_diabete: string;
    id_patient: string;
    id_fiche: string;
    longitude: number;
    latitude: number;
    createdBy: string;
    deletedAt?: string;
    isLocalCreated?: boolean;

    constructor(data?: Partial<Consultation>) {
        super();
        this.id = data?.id 
        this.fileName = data?.fileName || '';
        this.data = data?.data || '';
        this.synced = data?.synced || false;
        this.type_diabete = data?.type_diabete || '';
        this.id_patient = data?.id_patient || '';
        this.id_fiche = data?.id_fiche || '';
        this.longitude = data?.longitude || 0;
        this.latitude = data?.latitude || 0;
        this.createdBy = data?.createdBy || '';
        this.createdAt = data?.createdAt || ''
        this.updatedAt = data?.updatedAt || ''
        this.deletedAt = data?.deletedAt || undefined;
        this.isLocalCreated = data?.isLocalCreated || true;
    }
}