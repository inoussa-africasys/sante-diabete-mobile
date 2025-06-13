import { BaseModel } from "./BaseModel";

export default class Fiche extends BaseModel {
    name: String;
    type_diabete: String;
    path: String;

    constructor(data?: Partial<Fiche>) {
        super();
        this.name = data?.name || '';
        this.type_diabete = data?.type_diabete || '';
        this.path = data?.path || '';
    }
}