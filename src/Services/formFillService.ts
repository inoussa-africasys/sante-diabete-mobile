import FormFillMapper from "../mappers/formFill";
import { FormFill } from "../models/FormFill";
import { FormFillRepository } from "../Repositories/FormFillRepository";
import FormFillForm from "../types/formFill";
import { generateUUID } from "../utils/consultation";
import Logger from "../utils/Logger";
import Service from "./core/Service";


export default class FormFillService extends Service {
    private formFillRepository: FormFillRepository;

    constructor() {
        super();
        this.formFillRepository = new FormFillRepository();
    }

    async getAllFormFillByFicheName(ficheName: string) : Promise<FormFill[]> {
        return this.formFillRepository.findAllByFicheName(ficheName);
    }

    async getAllFicheWhereFormFillIsNotNull() : Promise<Map<string, FormFill>> {
        return this.formFillRepository.getFichesFilledWithFormFill();
    }

    async createFormFill(formFill: FormFillForm) : Promise<boolean> {
        try {
            const formFillMapped = FormFillMapper.toFormFill(formFill);
            formFillMapped.uuid = generateUUID();
            formFillMapped.createdBy = this.getConnectedUsername();
            formFillMapped.createdAt = new Date().toISOString();
            formFillMapped.updatedAt = new Date().toISOString();
            formFillMapped.synced = false;
            formFillMapped.type_diabete = this.getTypeDiabete();
            await this.formFillRepository.insert(formFillMapped);
            return true;
        } catch (error) {
            console.error('Error creating form fill:', error);
            Logger.log('error', 'Error creating form fill:', { error });
            return false;
        }
    }

    async getAllFormFill() : Promise<FormFill[]> {
        try {
            return this.formFillRepository.findAll();
        } catch (error) {
            console.error('Error getting form fill:', error);
            Logger.log('error', 'Error getting form fill:', { error });
            return [];
        }
    }


    async syncAllFormFill() {
        try {
            const formFills = await this.getUnSyncedFormFill();
            for (const formFill of formFills) {
                await this.syncFormFill(formFill);
            }
        } catch (error) {
            console.error('Error syncing form fill:', error);
            Logger.log('error', 'Error syncing form fill:', { error });
        }
    }
    private syncFormFill(formFill: FormFill) {
        throw new Error("Method not implemented.");
    }

    private getUnSyncedFormFill() {
        try {
            const formFill = this.formFillRepository.getUnSyncedFormFill();
            return formFill;
        } catch (error) {
            console.error('Error getting form fill:', error);
            Logger.log('error', 'Error getting form fill:', { error });
            return [];
        }
    }




}
