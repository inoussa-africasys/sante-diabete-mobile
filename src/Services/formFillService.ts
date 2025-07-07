import axios from "axios";
import { APP_VERSION } from "../Constants/App";
import { generateFormfillId } from "../functions/helpers";
import FormFillMapper from "../mappers/formFill";
import { FormFill } from "../models/FormFill";
import { FormFillRepository } from "../Repositories/FormFillRepository";
import { SyncErrorType, SyncFormFillResultType } from "../types/app";
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

    async getAllFormFillByFicheName(ficheName: string): Promise<FormFill[]> {
        return this.formFillRepository.findAllByFicheName(ficheName);
    }

    async getAllFicheWhereFormFillIsNotNull(): Promise<Map<string, FormFill>> {
        return this.formFillRepository.getFichesFilledWithFormFill();
    }

    async createFormFill(formFill: FormFillForm): Promise<boolean> {
        try {
            const formFillMapped = FormFillMapper.toFormFill(formFill);
            formFillMapped.uuid = generateUUID();
            formFillMapped.createdBy = this.getConnectedUsername();
            formFillMapped.createdAt = new Date().toISOString();
            formFillMapped.updatedAt = new Date().toISOString();
            formFillMapped.synced = false;
            formFillMapped.type_diabete = this.getTypeDiabete();
            formFillMapped.id_trafic = generateFormfillId();
            await this.formFillRepository.insert(formFillMapped);
            return true;
        } catch (error) {
            console.error('Error creating form fill:', error);
            Logger.log('error', 'Error creating form fill:', { error });
            return false;
        }
    }

    async createFormFillAndReturn(formFill: FormFillForm): Promise<FormFill | null> {
        try {
            const formFillMapped = FormFillMapper.toFormFill(formFill);
            formFillMapped.uuid = generateUUID();
            formFillMapped.createdBy = this.getConnectedUsername();
            formFillMapped.createdAt = new Date().toISOString();
            formFillMapped.updatedAt = new Date().toISOString();
            formFillMapped.synced = false;
            formFillMapped.type_diabete = this.getTypeDiabete();
            formFillMapped.id_trafic = generateFormfillId();
            const formFillCreated = await this.formFillRepository.insertAndReturn(formFillMapped);
            return formFillCreated;
        } catch (error) {
            console.error('Error creating form fill:', error);
            Logger.log('error', 'Error creating form fill:', { error });
            return null;
        }
    }

    async getAllFormFill(): Promise<FormFill[]> {
        try {
            return this.formFillRepository.findAll();
        } catch (error) {
            console.error('Error getting form fill:', error);
            Logger.log('error', 'Error getting form fill:', { error });
            return [];
        }
    }


    async syncFormFill(ficheName: string = ''): Promise<SyncFormFillResultType> {
        try {
            let formFills: FormFill[] = [];
            let errors: SyncErrorType[] = [];
            if (ficheName === '') {
                formFills = this.formFillRepository.getUnSyncedFormFill();
            } else {
                formFills = await this.getAllFormFillByFicheName(ficheName);
            }

            for (const formFill of formFills) {
                const result = await this.syncOneFormfill(formFill);
                if (!result) {
                    errors.push({ id: formFill.id?.toString() || '', error: `Error syncing form fill ${formFill.id}` });
                }
            }
            if (errors.length > 0) {
                return {
                    success: false,
                    statistics: {
                        total: formFills.length,
                        success: formFills.length - errors.length,
                        failed: errors.length
                    },
                    errors
                };
            }
            return {
                success: true,
                statistics: {
                    total: formFills.length,
                    success: formFills.length,
                    failed: 0
                },
                errors
            };
        } catch (error) {
            console.error('Error syncing form fill:', error);
            Logger.log('error', 'Error syncing form fill:', { error });
            return {
                success: false,
                statistics: {
                    total: 0,
                    success: 0,
                    failed: 0
                },
                errors: []
            };
        }
    }


    private async syncOneFormfill(formFill: FormFill): Promise<boolean> {
        try {
            const url = `${this.getBaseUrl()}/api/json/mobile/forms/${formFill.ficheName}/submissions?token=${this.getToken()}&uuid=${formFill.uuid}&app_version=${APP_VERSION}`;
            const response = await axios.post(url, formFill)
            if (response.status !== 201 && response.status !== 200) {
                return false;
            }
            this.makeSyncFormFill(formFill);
            return true;
        } catch (error) {
            console.error('Error syncing form fill:', error);
            Logger.log('error', 'Error syncing form fill:', { error });
            return false;
        }
    }

    private getUnSyncedFormFill(): FormFill[] {
        try {
            const formFill = this.formFillRepository.getUnSyncedFormFill();
            return formFill;
        } catch (error) {
            console.error('Error getting form fill:', error);
            Logger.log('error', 'Error getting form fill:', { error });
            return [];
        }
    }


    private makeSyncFormFill(formFill: FormFill): boolean {
        try {
            formFill.synced = true;
            formFill.updatedAt = new Date().toISOString();
            if (formFill.id) {
                this.formFillRepository.update(formFill.id, formFill);
            } else {
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error syncing form fill:', error);
            Logger.log('error', 'Error syncing form fill:', { error });
            return false;
        }
    }


    autoSyncFormFill = async (formFill: FormFill): Promise<boolean> => {
        try {
            return await this.syncOneFormfill(formFill);
        } catch (error) {
            console.error('Erreur réseau :', error);
            return false;
        }
    };

    async getFormFillById(id: number): Promise<FormFill | null> {
        try {
            const formFill = this.formFillRepository.findById(id);
            return formFill;
        } catch (error) {
            console.error('Error getting form fill:', error);
            Logger.log('error', 'Error getting form fill:', { error });
            return null;
        }
    }




}
