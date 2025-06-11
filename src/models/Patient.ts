import { BaseModel } from "./BaseModel";

export default class Patient extends BaseModel {
    id_patient: string;
    first_name: string;
    last_name: string;
    date: string;
    photo: string;
    user_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    last_synced_at: string;
    synced: number;

    constructor(data?: Partial<Patient>) {
        super();
        this.id_patient = data?.id_patient || '';
        this.first_name = data?.first_name || '';
        this.last_name = data?.last_name || '';
        this.date = data?.date || '';
        this.photo = data?.photo || '';
        this.user_id = data?.user_id || '';
        this.status = data?.status || '';
        this.created_at = data?.created_at || '';
        this.updated_at = data?.updated_at || '';
        this.last_synced_at = data?.last_synced_at || '';
        this.synced = data?.synced || 0;
    }
}