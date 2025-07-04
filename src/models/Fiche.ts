import { FormFillRepository } from "../Repositories/FormFillRepository";
import Logger from "../utils/Logger";
import { BaseModel } from "./BaseModel";
import { FormFill } from "./FormFill";

export default class Fiche extends BaseModel {
    name: string;
    type_diabete: string;
    path: string;
    is_downloaded: boolean;
    data: string;

    constructor(data?: Partial<Fiche>) {
        super();
        this.id = data?.id;
        this.name = data?.name || '';
        this.type_diabete = data?.type_diabete || '';
        this.path = data?.path || '';
        this.is_downloaded = data?.is_downloaded || false;
        this.data = data?.data || '';
    }


    public getAllFormFill() : FormFill[] {
        try {
            const formFillRepository = new FormFillRepository();
            const formFill = formFillRepository.findAllByFicheName(this.name);    
            if (!formFill) {
                return [];
            }
            return formFill;
        } catch (error) {
            console.error('Erreur lors de la récupération des formFills :', error);
            Logger.log('error', 'Error getting formFills', { error });
            return [];
        }
    }
}