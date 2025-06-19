import { BaseModel } from "./BaseModel";

export default class Patient extends BaseModel {

    id_patient: string;
    date_of_birth: string;
    photo: string;
    last_name: string;
    first_name: string;
    trafic_user: string;
    status: string;
    synced: boolean;
    type_diabete: string;

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
    }
}