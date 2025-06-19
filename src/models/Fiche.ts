import { BaseModel } from "./BaseModel";

export default class Fiche extends BaseModel {
    name: String;
    type_diabete: String;
    path: String;
    is_downloaded: boolean;
    data: String;

    constructor(data?: Partial<Fiche>) {
        super();
        this.id = data?.id;
        this.name = data?.name || '';
        this.type_diabete = data?.type_diabete || '';
        this.path = data?.path || '';
        this.is_downloaded = data?.is_downloaded || false;
        this.data = data?.data || '';
    }
}