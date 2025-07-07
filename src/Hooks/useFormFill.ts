import { useState } from 'react';
import FormFillService from '../Services/formFillService';
import useConfigStore from '../core/zustand/configStore';
import { FormFill } from '../models/FormFill';
import FormFillForm from '../types/formFill';
import { useIsOnline } from './useIsOnline';
type useFormFillType = {
    getFicheListWithFormFill: () => Promise<Map<string, FormFill>>;
    createFormFillOnLocalDB: (formFill: FormFillForm) => Promise<boolean>;
    isLoading: boolean;
    error: string | null;
    formFills: FormFill[];
    loadFormFills: () => Promise<void>;
    getFormFillById: (id: string) => Promise<FormFill | null>;
}
export const useFormFill = (): useFormFillType => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const isOnline = useIsOnline();
    const isAutoSyncActive = useConfigStore((state) => state.getValue('autoSync'));
    const [formFills,setFormFills] = useState<FormFill[]>([])

    const getFicheListWithFormFill = async (): Promise<Map<string, FormFill>> => {
        try {
            setIsLoading(true);
            const formFillService = await FormFillService.create();
            const fiches = await formFillService.getAllFicheWhereFormFillIsNotNull();
            
            return fiches;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            setIsLoading(false);
            return new Map<string, FormFill>();
        } finally {
            setIsLoading(false);
        }
    };

    const createFormFillOnLocalDB = async (formFill: FormFillForm): Promise<boolean> => {
        try {
            setIsLoading(true);
            const formFillService = await FormFillService.create();
            const result = await formFillService.createFormFillAndReturn(formFill);
            console.info('formFill créée :', result);
            if (result && isOnline && isAutoSyncActive) {
                const resultSync = await formFillService.autoSyncFormFill(result);
                return resultSync;
            }
            return true;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            setIsLoading(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const loadFormFills = async () => {
        try {
            setIsLoading(true);
            const formFillService = await FormFillService.create();
            const fiches = await formFillService.getAllFormFill();
            setFormFills(fiches);
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const getFormFillById = async (id: string): Promise<FormFill | null> => {
        try {
            setIsLoading(true);
            const formFillService = await FormFillService.create();
            const formFill = await formFillService.getFormFillById(parseInt(id));
            console.log('formFill', id);
            return formFill;
        } catch (error) {
            console.error('Erreur réseau :', error);
            setError(error as string);
            setIsLoading(false);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        getFicheListWithFormFill,
        createFormFillOnLocalDB,
        isLoading,
        error,
        formFills,
        loadFormFills,
        getFormFillById   
    };



};
